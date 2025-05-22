from fastapi import FastAPI, UploadFile
from fastapi.params import Form, File
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, HTTPException
import threading

from models.usuario import Usuario
from models.nodo import Nodo
from repository.HandlerMySQL import DatabaseConnection
from models.login_request import LoginRequest
from services.email_handler import EmailSender
from repository.HandlerNodos import HandlerNodos
from services.modelo import ModeloComandosBERT
from clienteSincronizacion.main import MonitorArchivos



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O puedes poner ["http://vaultsync.hopto.org"] si quieres más seguro
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

root_link = "/api/v1"
modelo = ModeloComandosBERT("services/comandos_12000_intercalado.csv")
#modelo.entrenar()
monitorArchivos = MonitorArchivos()
monitorArchivos.iniciar_vigilancia()
threading.Thread(target=monitorArchivos.monitorear_cambios, daemon=True).start()
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
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

@app.post(root_link + "/peticioncontrasena")
async def petición_cambiar_contrasena(mail: str):
    email = EmailSender()
    print(mail)
    return email.recuperacion_contrasena(mail)


@app.post(root_link + "/cambiarcontrasena")
async def cambiar_contrasena(email: str,contrasena:str):
    print(email+contrasena)
    db = DatabaseConnection()
    if db.cambiar_contrasena(email,contrasena):
        return {"mensaje": "Cambio exitoso"}
    else:
        return {"mensaje": "Cambio fallido"}

@app.get(root_link + "/nodos")
async def obtener_usuario(email: str):
    handler_nodos = HandlerNodos()
    nodos = handler_nodos.obtener_nodos(email,False)
    return nodos


@app.get(root_link + "/descargar")
async def descargar_archivo(archivo: str):
    handler_nodos = HandlerNodos()
    return handler_nodos.descargar_archivo(archivo)


@app.post(root_link + "/subir")
async def subir(email: str = Form(...), archivo: UploadFile = File(...)):
    handler_nodos = HandlerNodos()
    if handler_nodos.subir_archivo(email, archivo):
        return {"mensaje": "Archivo subido correctamente"}
    else:
        return {"mensaje": "Error al subir el archivo"}

@app.delete(root_link + "/eliminar")
async def eliminar(archivo: str):
    handler_nodos = HandlerNodos()
    print(archivo)
    if handler_nodos.eliminar_archivo(archivo):
        return {"mensaje": "Archivo eliminado correctamente"}
    else:
        return {"mensaje": "Error al eliminar el archivo"}

@app.put(root_link + "/modificar")
async def modificar_archivo(archivo: str, contenido: str = Body(...)):
    handler_nodos = HandlerNodos()
    if handler_nodos.modificar_contenido(archivo, contenido):
        return {"mensaje": f"Contenido de '{archivo}' modificado correctamente"}
    else:
        return {"mensaje": "Archivo no encontrado o error al modificarlo"}

@app.put(root_link + "/modificarnombre")
async def modificarnombre(archivo: str, nombre: str):
    handler_nodos = HandlerNodos()
    if handler_nodos.modificar_nombre(archivo, nombre):
        return {"mensaje":  f"nombre de '{archivo}' modificado correctamente"}
    else:
        return {"mensaje": "Error al modificar nombre"}

@app.put(root_link + "/creararchivo")
async def crear_archivo(archivo: str):
    handler_nodos = HandlerNodos()
    if handler_nodos.crear_archivo(archivo):
        return {"mensaje": "Archivo creado correctamente"}
    else:
        return {"mensaje": "Error al crear archivo"}

@app.put(root_link + "/crearcarpeta")
async def crearcarpeta(archivo: str):
    handler_nodos = HandlerNodos()
    if handler_nodos.crear_carpeta(archivo):
        return {"mensaje": "Carpeta creado correctamente"}
    else:
        return {"mensaje": "Error al crear carpeta"}

@app.post(root_link + "/predecir")
async def predecir_comando(comando: str):
    try:
        prediccion = modelo.predecir(comando)
        return {"comando_original": comando, "comando_corregido": prediccion}
    except Exception as e:
        return {"error": f"Error al procesar el comando: {str(e)}"}

@app.post(root_link + "/cambios")
async def comprobarCambios(email: str):
    try:
        emails = monitorArchivos.get_emails()
        print(emails)
        if email in emails:
            emails.remove(email)
            monitorArchivos.set_emails(emails)
            print("Estoy llegando")
            return {"nodos": monitorArchivos.get_nodos()}
        return {"mensaje": "No hay cambios nuevos"}
    except Exception as e:
        return {"error": f"Error al iniciar el monitoreo: {str(e)}"}

@app.post(root_link + "/cambios2")
async def recibir_cambios(datos: list[dict], email: str):
    try:
        monitorArchivos.set_realizar(False)
        handler_nodos = HandlerNodos()
        handler_nodos.sincronizar(datos,email)
        monitorArchivos.iniciar_vigilancia()
        monitorArchivos.set_realizar(True)  # Reactivamos la detección de cambios
        return {"mensaje": "Sincronización exitosa"}
    except Exception as e:
        print(e)
        monitorArchivos.set_realizar(True)  # También lo reactivamos en caso de error
        return {"error": f"Error al sincronizar"}


