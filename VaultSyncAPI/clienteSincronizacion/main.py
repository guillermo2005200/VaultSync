from inotify_simple import INotify, flags
import os
from repository.HandlerMySQL import DatabaseConnection
from repository.HandlerNodos import HandlerNodos

# Inicializa INotify
inotify = INotify()
watch_flags = flags.CREATE | flags.MODIFY | flags.DELETE | flags.MOVED_FROM | flags.MOVED_TO

# Instancias de conexión y lógica
db = DatabaseConnection()
handler_nodos = HandlerNodos()

# Ruta base común (ajústala si estás en otra ubicación)
ruta_base = os.path.abspath("../../Raiz")

# Lista para guardar rutas vigiladas
rutas_vigiladas = []
watch_to_path = {}

# Al agregar los watches, guardamos la relación
for email in db.recuperarCorreos():
    if handler_nodos.verificar_cliente(email):
        ruta_usuario = os.path.join(ruta_base, email)
        rutas_vigiladas.append(ruta_usuario)
        wd = inotify.add_watch(ruta_usuario, watch_flags)
        watch_to_path[wd] = ruta_usuario
        print(f"Añadido a vigilancia: {ruta_usuario}")
    else:
        print(f"No se encontró .cliente en: {email}")

print("Vigilando carpetas de usuarios válidos...")

# Escucha eventos en todas las carpetas vigiladas
watch_to_path = {}

# Al agregar los watches, guardamos la relación
for email in db.recuperarCorreos():
    if handler_nodos.verificar_cliente(email):
        ruta_usuario = os.path.join(ruta_base, email)
        rutas_vigiladas.append(ruta_usuario)
        wd = inotify.add_watch(ruta_usuario, watch_flags)
        watch_to_path[wd] = ruta_usuario
        print(f"Añadido a vigilancia: {ruta_usuario}")
    else:
        print(f"No se encontró .cliente en: {email}")

print("Vigilando carpetas de usuarios válidos...")

# Escucha eventos en todas las carpetas vigiladas
while True:
    for event in inotify.read():
        ruta_base_evento = watch_to_path.get(event.wd, "Desconocido")
        ruta_completa = os.path.join(ruta_base_evento, event.name)
        # Extraemos el email de la ruta (último directorio de la ruta base)
        email = os.path.basename(ruta_base_evento)
        print(f"Email del usuario: {email}")
        handler_nodos.obtener_nodos(email)