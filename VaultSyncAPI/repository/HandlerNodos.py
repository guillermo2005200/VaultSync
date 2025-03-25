import os
from typing import List
from models.nodo import Nodo  # Asegúrate de tener esta clase en models/nodo.py

class HandlerNodos:
    def __init__(self, ruta_base: str = "./nodos"):
        self.ruta_base = ruta_base

    def obtener_nodos(self) -> List[Nodo]:
        nodos = []
        if not os.path.exists(self.ruta_base):
            print("La ruta no existe.")
            return nodos

        for nombre in os.listdir(self.ruta_base):
            ruta_completa = os.path.join(self.ruta_base, nombre)
            if os.path.isdir(ruta_completa):
                nodos.append(Nodo(nombre=nombre, directorio=True))
            else:
                with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                    contenido = f.read()
                nodos.append(Nodo(nombre=nombre, contenido=contenido, directorio=False))
        return nodos

    def crear_carpeta(nombre: str, ruta_base: str = "./nodos"):
        ruta_carpeta = os.path.join(ruta_base, nombre)

        try:
            os.makedirs(ruta_carpeta, exist_ok=True)
            print(f"Carpeta creada: {ruta_carpeta}")
            return True
        except Exception as e:
            print(f"Error al crear la carpeta: {e}")
            return False
