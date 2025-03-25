from pydantic import BaseModel

class Usuario(BaseModel):
    email: str
    contraseña: str
    nombre: str
    apellido: str
    direccion: str
    activo: bool = True
