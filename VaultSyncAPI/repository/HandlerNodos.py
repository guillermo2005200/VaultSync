import os
import shutil
from typing import List

from fastapi import UploadFile

from models.nodo import Nodo  # Asegúrate de tener esta clase en models/nodo.py
from fastapi.responses import FileResponse

class HandlerNodos:
    def __init__(self, ruta_base: str = "../Raiz"):
        self.ruta_base = ruta_base

    def obtener_nodos(self, nombre: str) -> List[Nodo]:
        nodos = []

        # Construimos la ruta completa combinando la base con el nombre recibido
        ruta_objetivo = os.path.join(self.ruta_base, nombre)

        if not os.path.exists(ruta_objetivo):
            print("La ruta no existe.")
            return nodos

        for item in os.listdir(ruta_objetivo):
            ruta_completa = os.path.join(ruta_objetivo, item)
            if os.path.isdir(ruta_completa):
                nodos.append(Nodo(nombre=item, contenido="", directorio=True))
            else:
                with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                    contenido = f.read()
                nodos.append(Nodo(nombre=item, contenido=contenido, directorio=False))

        return nodos

    def crear_carpeta(self,nombre: str):
        ruta_carpeta = os.path.join(self.ruta_base, nombre)
        try:
            os.makedirs(ruta_carpeta, exist_ok=True)
            print(f"Carpeta creada: {ruta_carpeta}")
            return True
        except Exception as e:
            print(f"Error al crear la carpeta: {e}")
            return False

    def descargar_archivo(self, email: str, archivo: str):
        ruta_archivo = os.path.join(self.ruta_base, email, archivo)
        if not os.path.exists(ruta_archivo):
            return {"mensaje": "Archivo no encontrado"}
        return FileResponse(ruta_archivo, media_type='application/octet-stream', filename=archivo)

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


    def eliminar_archivo(self, email: str, nombre_archivo: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, email, nombre_archivo)

        if not os.path.isfile(ruta_archivo):
            print("Archivo no encontrado.")
            return False

        try:
            os.remove(ruta_archivo)
            print(f"Archivo eliminado: {ruta_archivo}")
            return True
        except Exception as e:
            print(f"Error al eliminar archivo: {e}")
            return False

    def modificar_contenido(self, email: str, nombre_archivo: str, nuevo_contenido: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, email, nombre_archivo)

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

    def modificar_nombre(self, email: str, archivo: str, nombre: str) -> bool:
        ruta_archivo = os.path.join(self.ruta_base, email, archivo)
        nueva_ruta = os.path.join(self.ruta_base, email, nombre)

        if not os.path.isfile(ruta_archivo):
            print("Archivo no encontrado.")
            return False
        try:
            os.rename(ruta_archivo, nueva_ruta)
            print(f"Archivo renombrado a: {nueva_ruta}")
            return True
        except Exception as e:
            print(f"Error al modificar nombre: {e}")
            return False

    def crear_archivo(self, nombre: str):
        ruta_archivo = os.path.join(self.ruta_base, nombre)
        try:
            with open(ruta_archivo, "w") as archivo:
                archivo.write("")  # Archivo vacío o contenido inicial
            print(f"Archivo creado correctamente en: {ruta_archivo}")
            return True
        except Exception as e:
            print(f"Error al crear el archivo: {e}")
            return False
