from pydantic import BaseModel
"""Modelo para validar los usuarios"""
class Usuario(BaseModel):
    email: str
    contraseña: str
    nombre: str
    apellido: str
    direccion: str
    activo: bool = True
    foto: str
