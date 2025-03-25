from pydantic import BaseModel

class Nodo(BaseModel):
    nombre: str
    contenido: str
    directorio: bool
