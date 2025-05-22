import requests
import time
import os
from pathlib import Path
import shutil
from inotify_simple import INotify, flags

URL_API = "http://127.0.0.1:8000/api/v1/cambios"
URL_API2 = "http://127.0.0.1:8000/api/v1/cambios2"
RUTA_LOCAL = "/home/guillermo/prueba_cliente"
EMAIL = "barcenalopezguillermo@gmail.com"  # <-- query param


class ClienteSincronizador:
    def __init__(self, url_api, url_api2, ruta_local, email, intervalo=5):
        self.watch_to_path = []
        self.url_api = url_api
        self.url_api2 = url_api2
        self.ruta_local = Path(ruta_local)
        self.email = email
        self.intervalo = intervalo
        self.inotify = INotify()
        self.watch_flags = flags.CREATE | flags.MODIFY | flags.DELETE | flags.MOVED_FROM | flags.MOVED_TO
        self.realizar = True

        if not self.ruta_local.exists():
            self.ruta_local.mkdir(parents=True)

    def obtener_nodos_recursivo(self):
        nodos = []

        ruta_objetivo = os.path.join(self.ruta_local)

        if not os.path.exists(ruta_objetivo):
            print("La ruta no existe.")
            return nodos

        for raiz, dirs, archivos in os.walk(ruta_objetivo):
            ruta_relativa_base = os.path.relpath(raiz, self.ruta_local)

            for dir_nombre in dirs:
                ruta_relativa = os.path.join(ruta_relativa_base, dir_nombre)
                nodo = {
                    "nombre": dir_nombre,
                    "contenido": "",
                    "directorio": True,
                    "ruta_relativa": ruta_relativa
                }
                nodos.append(nodo)

            # Añadir archivos
            for archivo in archivos:
                ruta_completa = os.path.join(raiz, archivo)
                ruta_relativa = os.path.join(ruta_relativa_base, archivo)
                print(archivo)
                try:
                    with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read()
                except Exception as e:
                    print(f"No se pudo leer {ruta_completa}: {e}")
                    contenido = ""

                nodo = {
                    "nombre": archivo,
                    "contenido": contenido,
                    "directorio": False,
                    "ruta_relativa": ruta_relativa
                }

                nodos.append(nodo)

        return nodos

    def consultar_cambios(self):
        try:
            respuesta = requests.post(self.url_api, params={"email": self.email})

            if respuesta.status_code == 200:
                datos = respuesta.json()
                if "nodos" in datos:
                    print("Se detectaron cambios:", datos["nodos"])
                    self.realizar = False
                    self.sincronizar(datos["nodos"])
                else:
                    self.realizar = True
                    print("hola")
                    print(datos["mensaje"])
            else:
                print(f"Error en la consulta: {respuesta.status_code}")
        except Exception as e:
            print(f"Error al conectar con el servidor: {e}")

    def sincronizar(self, nodos):
        # Eliminar contenido existente, manteniendo el directorio base
        for item in os.listdir(self.ruta_local):
            ruta_item = os.path.join(self.ruta_local, item)
            if os.path.isfile(ruta_item):
                os.remove(ruta_item)
            elif os.path.isdir(ruta_item):
                shutil.rmtree(ruta_item)

        # Sincronizar nuevos archivos y directorios
        for nodo in nodos:
            ruta_relativa = nodo["ruta_relativa"]
            contenido = nodo.get("contenido", "")
            es_directorio = nodo.get("directorio", False)

            ruta_completa = self.ruta_local / ruta_relativa

            if es_directorio:
                ruta_completa.mkdir(parents=True, exist_ok=True)
                print(f"Carpeta creada: {ruta_relativa}")
            else:
                ruta_completa.parent.mkdir(parents=True, exist_ok=True)
                with open(ruta_completa, "w", encoding="utf-8") as archivo:
                    archivo.write(contenido)
                print(f"Archivo creado: {ruta_relativa}")
        self.iniciar_vigilancia_recursiva()

    def iniciar_vigilancia_recursiva(self):
        self.watch_to_path = {}
        for dirpath, dirnames, _ in os.walk(self.ruta_local):
            wd = self.inotify.add_watch(dirpath, self.watch_flags)
            self.watch_to_path[wd] = dirpath
            print(f"Vigilando: {dirpath} con wd {wd}")

    def consultar_cambios_propios(self):
        try:
            events = self.inotify.read(timeout=100)  # Lee eventos durante 100ms máximo
            for event in events:
                if self.realizar:
                    print(f"Evento detectado: {flags.from_mask(event.mask)} en {event.name}")
                    nodos = self.obtener_nodos_recursivo()
                    response = requests.post(self.url_api2, params={"email": self.email},
                                             json=nodos)  # CORRECTO: esto sí va en el body como JSON
                    print(response.json())
        except Exception as e:
            print(f"Error monitoreando cambios locales: {e}")

    def iniciar(self):
        print("Iniciando sincronización del cliente...")
        self.iniciar_vigilancia_recursiva()
        while True:
            self.consultar_cambios_propios()
            self.consultar_cambios()
            time.sleep(self.intervalo)


if __name__ == "__main__":
    cliente = ClienteSincronizador(URL_API, URL_API2, RUTA_LOCAL, EMAIL, intervalo=5)
    cliente.iniciar()
