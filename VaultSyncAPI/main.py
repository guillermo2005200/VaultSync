from fastapi import FastAPI, UploadFile
from fastapi.params import Form, File
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware

from models.usuario import Usuario
from repository.HandlerMySQL import DatabaseConnection
from models.login_request import LoginRequest
from services.email_handler import EmailSender
from repository.HandlerNodos import HandlerNodos


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # o ["*"] para permitir todo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post(root_link + "/peticioncontrasena")
async def petición_cambiar_contrasena(mail: str):
    email = EmailSender()
    print(mail)
    return email.recuperacion_contrasena(mail)


@app.post(root_link + "/cambiarcontrasena")
async def cambiar_contrasena(email: str,contrasena:str):
    db = DatabaseConnection()
    if db.cambiar_contrasena(email,contrasena):
        return {"mensaje": "Cambio exitoso"}
    else:
        return {"mensaje": "Cambio fallido"}

@app.get(root_link + "/nodos")
async def obtener_usuario(email: str):
    handler_nodos = HandlerNodos()
    nodos = handler_nodos.obtener_nodos(email)
    return nodos


@app.get(root_link + "/descargar")
async def descargar_archivo(email: str, archivo: str):
    handler_nodos = HandlerNodos()
    return handler_nodos.descargar_archivo(email, archivo)


@app.post(root_link + "/subir")
async def subir(email: str = Form(...), archivo: UploadFile = File(...)):
    handler_nodos = HandlerNodos()
    if handler_nodos.subir_archivo(email, archivo):
        return {"mensaje": "Archivo subido correctamente"}
    else:
        return {"mensaje": "Error al subir el archivo"}

@app.delete(root_link + "/eliminar")
async def subir(email: str, archivo: str):
    handler_nodos = HandlerNodos()
    if handler_nodos.eliminar_archivo(email, archivo):
        return {"mensaje": "Archivo eliminado correctamente"}
    else:
        return {"mensaje": "Error al eliminar el archivo"}

@app.put(root_link + "/modificar")
async def modificar_archivo(email: str, archivo: str, contenido: str = Body(...)):
    handler_nodos = HandlerNodos()
    if handler_nodos.modificar_contenido(email, archivo, contenido):
        return {"mensaje": f"Contenido de '{archivo}' modificado correctamente"}
    else:
        return {"mensaje": "Archivo no encontrado o error al modificarlo"}

@app.put(root_link + "/modificarnombre")
async def modificarnombre(email: str,archivo: str, nombre: str):
    handler_nodos = HandlerNodos()
    if handler_nodos.modificar_nombre(email, archivo, nombre):
        return {"mensaje":  f"nombre de '{archivo}' modificado correctamente"}
    else:
        return {"mensaje": "Error al modificar nombre"}
