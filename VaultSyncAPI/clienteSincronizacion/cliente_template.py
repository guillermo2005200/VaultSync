#!/usr/bin/env python3
import sys
import os
import subprocess
import argparse
import requests
import time
import shutil
from pathlib import Path
from inotify_simple import INotify, flags

EMAIL = "{{EMAIL}}"

URL_API = "https://vaultsync.es/api/v1/cambios"
URL_API2 = "https://vaultsync.es/api/v1/cambios2"
RUTA_LOCAL = "/home/VaultSync"

SERVICE_UNIT = f"""[Unit]
Description=Cliente de sincronización VaultSync
After=network.target

[Service]
ExecStart={os.path.realpath(sys.argv[0])}
Restart=always
User={os.getenv('SUDO_USER') or os.getenv('USER')}
WorkingDirectory={os.getcwd()}
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=vaultsync-cliente

[Install]
WantedBy=multi-user.target
"""

def install_service():
    if os.geteuid() != 0:
        print("Tienes que ejecutar con sudo para instalar el servicio.")
        sys.exit(1)
    unit_path = "/etc/systemd/system/cliente.service"
    try:
        with open(unit_path, "w", encoding="utf-8") as f:
            f.write(SERVICE_UNIT)
        subprocess.run(["systemctl", "daemon-reload"], check=True)
        subprocess.run(["systemctl", "enable", "cliente"], check=True)
        subprocess.run(["systemctl", "start", "cliente"], check=True)
        print("Servicio cliente instalado y arrancado correctamente.")
    except Exception as e:
        print("Error instalando el servicio:", e)
        sys.exit(1)
    sys.exit(0)


def uninstall_service():
    if os.geteuid() != 0:
        print("Tienes que ejecutar con sudo para desinstalar el servicio.")
        sys.exit(1)
    unit_path = "/etc/systemd/system/cliente.service"
    try:
        subprocess.run(["systemctl", "stop", "cliente"], check=True)
        subprocess.run(["systemctl", "disable", "cliente"], check=True)
        if os.path.exists(unit_path):
            os.remove(unit_path)
        subprocess.run(["systemctl", "daemon-reload"], check=True)
        print("Servicio cliente detenido y desinstalado.")
    except Exception as e:
        print("Error desinstalando el servicio:", e)
        sys.exit(1)
    sys.exit(0)

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
        ruta_objetivo = str(self.ruta_local)
        if not os.path.exists(ruta_objetivo):
            print("La ruta no existe.")
            return nodos
        for raiz, dirs, archivos in os.walk(ruta_objetivo):
            ruta_relativa_base = os.path.relpath(raiz, ruta_objetivo)
            for dir_nombre in dirs:
                ruta_relativa = os.path.join(ruta_relativa_base, dir_nombre)
                nodos.append({
                    "nombre": dir_nombre,
                    "contenido": "",
                    "directorio": True,
                    "ruta_relativa": ruta_relativa
                })
            for archivo in archivos:
                ruta_completa = os.path.join(raiz, archivo)
                ruta_relativa = os.path.join(ruta_relativa_base, archivo)
                try:
                    with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read()
                except Exception:
                    contenido = ""
                nodos.append({
                    "nombre": archivo,
                    "contenido": contenido,
                    "directorio": False,
                    "ruta_relativa": ruta_relativa
                })
        return nodos

    def consultar_cambios(self):
        try:
            resp = requests.post(self.url_api, params={"email": self.email})
            if resp.status_code == 200:
                datos = resp.json()
                if "nodos" in datos:
                    self.realizar = False
                    self.sincronizar(datos["nodos"])
                else:
                    self.realizar = True
                    print(datos.get("mensaje", "Sin cambios"))
            else:
                print(f"Error en la consulta: {resp.status_code}")
        except Exception as e:
            print(f"Error al conectar con el servidor: {e}")

    def sincronizar(self, nodos):
        for item in os.listdir(self.ruta_local):
            ruta_item = self.ruta_local / item
            if ruta_item.is_file():
                ruta_item.unlink()
            else:
                shutil.rmtree(ruta_item)
        for nodo in nodos:
            ruta_relativa = nodo["ruta_relativa"]
            destino = self.ruta_local / ruta_relativa
            if nodo.get("directorio", False):
                destino.mkdir(parents=True, exist_ok=True)
            else:
                destino.parent.mkdir(parents=True, exist_ok=True)
                with open(destino, "w", encoding="utf-8") as f:
                    f.write(nodo.get("contenido", ""))
        self.iniciar_vigilancia_recursiva()

    def iniciar_vigilancia_recursiva(self):
        self.watch_to_path = {}
        for dirpath, _, _ in os.walk(self.ruta_local):
            wd = self.inotify.add_watch(dirpath, self.watch_flags)
            self.watch_to_path[wd] = dirpath

    def consultar_cambios_propios(self):
        try:
            for event in self.inotify.read(timeout=100):
                if self.realizar:
                    nodos = self.obtener_nodos_recursivo()
                    requests.post(self.url_api2, params={"email": self.email}, json=nodos)
        except Exception as e:
            print(f"Error monitoreando cambios: {e}")

    def iniciar(self):
        self.iniciar_vigilancia_recursiva()
        while True:
            self.consultar_cambios_propios()
            self.consultar_cambios()
            time.sleep(self.intervalo)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--install-service", action="store_true")
    parser.add_argument("--uninstall-service", action="store_true")
    parser.add_argument("-i", "--intervalo", type=int, default=5)
    args = parser.parse_args()
    if args.install_service:
        install_service()
    if args.uninstall_service:
        uninstall_service()
    cliente = ClienteSincronizador(URL_API, URL_API2, RUTA_LOCAL, EMAIL, intervalo=args.intervalo)
    cliente.iniciar()

if __name__ == "__main__":
    main()
