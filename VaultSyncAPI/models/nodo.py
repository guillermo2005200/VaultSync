from pydantic import BaseModel
"""Modelo para validar los nodos"""
class Nodo(BaseModel):
    nombre: str
    contenido: str
    directorio: bool
    ruta_relativa: str
