from pydantic import BaseModel
"""Modelo para validar el login"""
class LoginRequest(BaseModel):
    email: str
    contrasena: str
