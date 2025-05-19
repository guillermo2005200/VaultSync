import requests
import time
import os
from pathlib import Path
import shutil

URL_API = "http://127.0.0.1:8000/api/v1/cambios"
RUTA_LOCAL = "/home/guillermo/prueba_cliente"  # Ruta donde sincronizarás los cambios


class ClienteSincronizador:
    def __init__(self, url_api, ruta_local, intervalo=5):
        self.url_api = url_api
        self.ruta_local = Path(ruta_local)
        self.intervalo = intervalo  # Intervalo de consulta en segundos

        if not self.ruta_local.exists():
            self.ruta_local.mkdir(parents=True)

    def consultar_cambios(self):
        try:
            respuesta = requests.post(self.url_api)
            if respuesta.status_code == 200:
                datos = respuesta.json()
                if "nodos" in datos:
                    print("Se detectaron cambios:", datos["nodos"])
                    self.sincronizar(datos["nodos"])
                else:
                    print(datos["mensaje"])
            else:
                print(f"Error en la consulta: {respuesta.status_code}")
        except Exception as e:
            print(f"Error al conectar con el servidor: {e}")

    import shutil

    def sincronizar(self, nodos):
        if self.ruta_local.exists():
            shutil.rmtree(self.ruta_local)
        self.ruta_local.mkdir(parents=True, exist_ok=True)

        for nodo in nodos:
            ruta_relativa = nodo["ruta_relativa"]
            contenido = nodo.get("contenido", "")
            es_directorio = nodo.get("directorio", False)
            print(es_directorio)

            ruta_completa = self.ruta_local / ruta_relativa

            if es_directorio:
                ruta_completa.mkdir(parents=True, exist_ok=True)
                print(f"Carpeta creada: {ruta_relativa}")
            else:
                ruta_completa.parent.mkdir(parents=True, exist_ok=True)
                with open(ruta_completa, "w", encoding="utf-8") as archivo:
                    archivo.write(contenido)
                print(f"Archivo creado: {ruta_relativa}")

    def iniciar(self):
        print("Iniciando sincronización del cliente...")
        while True:
            self.consultar_cambios()
            time.sleep(self.intervalo)


if __name__ == "__main__":
    cliente = ClienteSincronizador(URL_API, RUTA_LOCAL, intervalo=5)
    cliente.iniciar()
