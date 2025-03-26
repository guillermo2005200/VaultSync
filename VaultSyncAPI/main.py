from fastapi import FastAPI
from models.usuario import Usuario
from repository.HandlerMySQL import DatabaseConnection
from models.login_request import LoginRequest
from services.email_handler import EmailSender
from repository.HandlerNodos import HandlerNodos

app = FastAPI()

root_link = "/api/v1"
@app.post(root_link + "/registrar")
async def registrar(usuario: Usuario):
    db = DatabaseConnection()
    salida=db.insertar_usuario(usuario)
    handler_nodos = HandlerNodos()
    handler_nodos.crear_carpeta(usuario.email)
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

@app.get(root_link + "/nodos")
async def obtener_usuario(email: str):
    handler_nodos = HandlerNodos()
    nodos = handler_nodos.obtener_nodos(email)
    return nodos
