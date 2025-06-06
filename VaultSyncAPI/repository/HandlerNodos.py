import os
import shutil
from typing import List
import sys
from fastapi import UploadFile
from models.nodo import Nodo

from models.nodo import Nodo  # Asegúrate de tener esta clase en models/nodo.py
from fastapi.responses import FileResponse
import tempfile
import subprocess

"""Clase para manejar operaciones de nodos en el sistema de archivos."""
class HandlerNodos:
    def __init__(self, ruta_base: str = "../Raiz/"):
        self.ruta_base = ruta_base
        self.CLIENTE_TEMPLATE = "clienteSincronizacion/cliente_template.py"

    # Funcion para obtener nodos de un directorio específico (usado en el frontend)
    def obtener_nodos(self, nombre: str, cliente) -> List[Nodo]:
        nodos = []

        if not cliente:
            ruta_objetivo = os.path.join(self.ruta_base, nombre)
        else:
            ruta_objetivo = os.path.join("../", self.ruta_base, nombre)

        if not os.path.exists(ruta_objetivo):
            print("La ruta no existe.")
            return nodos

        for item in os.listdir(ruta_objetivo):
            ruta_completa = os.path.join(ruta_objetivo, item)
            ruta_relativa = os.path.join(nombre, item)

            if os.path.isdir(ruta_completa):
                nodo = Nodo(
                    nombre=item,
                    contenido="",
                    directorio=True,
                    ruta_relativa=ruta_relativa
                )
            else:
                with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                    contenido = f.read()
                nodo = Nodo(
                    nombre=item,
                    contenido=contenido,
                    directorio=False,
                    ruta_relativa=ruta_relativa
                )

            nodos.append(nodo)

        return nodos

    # Funcion para obtener nodos de un directorio específico de forma recursiva (usado para el cliente sincronización)
    def obtener_nodos_recursivo(self, nombre: str, cliente) -> List[Nodo]:
        nodos = []

        if not cliente:
            ruta_objetivo = os.path.join(self.ruta_base, nombre)
        else:
            ruta_objetivo = os.path.join("../", self.ruta_base, nombre)

        if not os.path.exists(ruta_objetivo):
            print("La ruta no existe.")
            return nodos

        for raiz, dirs, archivos in os.walk(ruta_objetivo):
            # Calculamos ruta relativa a partir del usuario
            ruta_relativa_base = os.path.relpath(raiz, self.ruta_base)

            # Añadir carpetas
            for dir_nombre in dirs:
                ruta_relativa = os.path.join(ruta_relativa_base, dir_nombre)
                nodo = Nodo(
                    nombre=dir_nombre,
                    contenido="",
                    directorio=True,
                    ruta_relativa=ruta_relativa
                )
                nodos.append(nodo)

            # Añadir archivos
            for archivo in archivos:
                ruta_completa = os.path.join(raiz, archivo)
                ruta_relativa = os.path.join(ruta_relativa_base, archivo)
                try:
                    with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read()
                except Exception as e:
                    print(f"No se pudo leer {ruta_completa}: {e}")
                    contenido = ""

                nodo = Nodo(
                    nombre=archivo,
                    contenido=contenido,
                    directorio=False,
                    ruta_relativa=ruta_relativa
                )
                nodos.append(nodo)

        return nodos

    # Funcion para crear una carpeta
    def crear_carpeta(self, nombre: str):
        ruta_carpeta = os.path.join(self.ruta_base, nombre)
        try:
            os.makedirs(ruta_carpeta, exist_ok=True)
            print(f"Carpeta creada: {ruta_carpeta}")
            return True
        except Exception as e:
            print(f"Error al crear la carpeta: {e}")
            return False

    # Funcion para descargar un archivo
    def descargar_archivo(self, archivo: str):
        ruta_archivo = os.path.join(self.ruta_base, archivo)
        if not os.path.exists(ruta_archivo):
            return {"mensaje": "Archivo no encontrado"}
        return FileResponse(ruta_archivo, media_type='application/octet-stream', filename=archivo)

    # Funcion para subir un archivo
    def subir_archivo(self, email: str, archivo: UploadFile) -> bool:
        try:
            ruta_usuario = os.path.join(self.ruta_base, email)
            os.makedirs(ruta_usuario, exist_ok=True)

            ruta_destino = os.path.join(ruta_usuario, archivo.filename)

            with open(ruta_destino, "wb") as buffer:
                shutil.copyfileobj(archivo.file, buffer)

            return True
        except Exception as e:
            print(f"Error al subir archivo: {e}")
            return False

    # Funcion para eliminar un archivo o carpeta
    def eliminar_archivo(self, nombre_archivo: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, nombre_archivo)

        if not os.path.exists(ruta_archivo):
            print("Archivo o carpeta no encontrado.")
            return False

        try:
            if os.path.isfile(ruta_archivo):
                os.remove(ruta_archivo)
                print(f"Archivo eliminado: {ruta_archivo}")
            elif os.path.isdir(ruta_archivo):
                shutil.rmtree(ruta_archivo)
                print(f"Carpeta eliminada recursivamente: {ruta_archivo}")
            return True
        except Exception as e:
            print(f"Error al eliminar: {e}")
            return False

    # Funcion para modificar el contenido de un archivo
    def modificar_contenido(self, nombre_archivo: str, nuevo_contenido: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, nombre_archivo)

        if not os.path.isfile(ruta_archivo):
            print("Archivo no encontrado.")
            return False

        try:
            with open(ruta_archivo, "w", encoding="utf-8") as archivo:
                archivo.write(nuevo_contenido)
            print(f"Contenido actualizado en: {ruta_archivo}")
            return True
        except Exception as e:
            print(f"Error al modificar contenido: {e}")
            return False

    # Funcion para modificar el nombre de un archivo o carpeta
    def modificar_nombre(self, archivo: str, nombre: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, archivo)

        nueva_ruta = "/".join(archivo.split("/")[:-1])

        # Unir la ruta base con el nuevo nombre dentro del mismo directorio
        ruta_nueva = os.path.join(self.ruta_base, nueva_ruta, nombre)

        print(f"Ruta original: {ruta_archivo}")
        print(f"Ruta nueva: {ruta_nueva}")

        if not os.path.exists(ruta_archivo):
            print("Archivo o carpeta no encontrada.")
            return False

        try:
            os.rename(ruta_archivo, ruta_nueva)
            print(f"Renombrado a: {ruta_nueva}")
            return True
        except Exception as e:
            print(f"Error al modificar nombre: {e}")
            return False

    # Funcion para crear un archivo vacío
    def crear_archivo(self, nombre: str):
        ruta_archivo = os.path.join(self.ruta_base, nombre)
        print(ruta_archivo)
        try:
            with open(ruta_archivo, "w") as archivo:
                archivo.write("")  # Archivo vacío o contenido inicial
            print(f"Archivo creado correctamente en: {ruta_archivo}")
            return True
        except Exception as e:
            print(f"Error al crear el archivo: {e}")
            return False

    # Funcion para verificar si el cliente tiene activado el sincronizador
    def verificar_cliente(self, ruta: str) -> bool:
        try:
            ruta_completa = os.path.join(self.ruta_base, ruta, ".cliente")
            print(ruta_completa)
            return os.path.exists(ruta_completa)
        except Exception as e:
            print(f"Error al verificar archivo .cliente: {e}")
            return False

    # Funcion para sincronizar los archivos locales del usuario con el servidor
    def sincronizar(self, nodos, email):
        ruta_objetivo = os.path.join(self.ruta_base)
        ruta_objetivo2 = os.path.join(self.ruta_base, email)
        shutil.rmtree(ruta_objetivo2)
        print(nodos)
        for nodo in nodos:
            ruta_relativa = nodo["ruta_relativa"]
            contenido = nodo.get("contenido", "")
            es_directorio = nodo.get("directorio", False)

            ruta_completa = os.path.join(ruta_objetivo, ruta_relativa)

            if es_directorio:
                os.makedirs(ruta_completa, exist_ok=True)
                print(f"Carpeta creada: {ruta_relativa}")
            else:
                os.makedirs(os.path.dirname(ruta_completa), exist_ok=True)
                with open(ruta_completa, "w", encoding="utf-8") as archivo:
                    archivo.write(contenido)
                print(f"Archivo creado: {ruta_relativa}")


    #clase para generar el cliente de sincronización
    def generar_cliente(self, email: str) -> FileResponse:

        ruta_usuario = os.path.join(self.ruta_base, email,".cliente")
        with open(ruta_usuario, "w") as archivo:
            archivo.write("")
        tmpdir = tempfile.mkdtemp(prefix="cliente_build_")
        try:
            # 1) Leer plantilla y sustituir email
            tpl = open(self.CLIENTE_TEMPLATE, "r", encoding="utf-8").read()
            src_py = os.path.join(tmpdir, "cliente_tmp.py")
            with open(src_py, "w", encoding="utf-8") as f:
                f.write(tpl.replace("{{EMAIL}}", email))

            # 2) Preparar dist/build/spec dirs
            dist_dir = os.path.join(tmpdir, "dist")
            build_dir = os.path.join(tmpdir, "build")
            spec_dir = tmpdir

            # 3) Llamar a PyInstaller
            cmd = [
                sys.executable, "-m", "PyInstaller",
                "--onefile",
                "--name", "cliente",
                "--distpath", dist_dir,
                "--workpath", build_dir,
                "--specpath", spec_dir,
                "--clean",
                src_py
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True)
            if proc.returncode != 0:
                # Falló la compilación: lanza con logs completos
                raise RuntimeError(
                    f"PyInstaller error:\nSTDOUT:\n{proc.stdout}\n\nSTDERR:\n{proc.stderr}"
                )

            # 4) Buscar el ejecutable en dist/
            archivos = os.listdir(dist_dir)
            if not archivos:
                raise FileNotFoundError(f"No se encontró binario en {dist_dir}")
            # Habitualmente será "cliente" o "cliente.exe"
            bin_name = archivos[0]
            bin_path = os.path.join(dist_dir, bin_name)
            # 5) Devolverlo como descarga
            return FileResponse(
                path=bin_path,
                media_type="application/octet-stream",
                filename=bin_name
            )


        except Exception as e:
            print(f"Error al generar el cliente: {e}")
            raise e
