from fastapi import FastAPI
from models.usuario import Usuario
from repository.HandlerMySQL import DatabaseConnection
from models.login_request import LoginRequest
from services.email_handler import EmailSender

app = FastAPI()

root_link = "/api/v1"
@app.post(root_link + "/registrar")
async def registrar(usuario: Usuario):
    db = DatabaseConnection()
    salida=db.insertar_usuario(usuario)

    if salida:
        email = EmailSender()
        email.enviar_bienvenida(usuario.email, usuario.nombre)
        return {
            "mensaje": "Usuario registrado correctamente",
            "usuario": usuario
        }
    else:
        return "Error al registrar usuario"

@app.post(root_link + "/iniciar")
async def iniciar_sesion(datos: LoginRequest):
    db = DatabaseConnection()
    if db.verificar_credenciales(datos.email, datos.contrasena):
        return {"mensaje": "Inicio de sesión exitoso"}
    else:
        return {"mensaje": "Credenciales incorrectas"}
