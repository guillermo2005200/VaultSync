import os
from typing import List
from models.nodo import Nodo  # Asegúrate de tener esta clase en models/nodo.py

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
