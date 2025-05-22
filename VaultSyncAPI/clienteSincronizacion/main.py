from inotify_simple import INotify, flags
import os
from repository.HandlerMySQL import DatabaseConnection
from repository.HandlerNodos import HandlerNodos

class MonitorArchivos:
    def __init__(self, ruta_base="../Raiz/"):
        # Inicializa INotify
        self.inotify = INotify()
        self.watch_flags = flags.CREATE | flags.MODIFY | flags.DELETE | flags.MOVED_FROM | flags.MOVED_TO
        self.nodos = []
        self.emails = []

        # Instancias de conexión y lógica
        self.db = DatabaseConnection()
        self.handler_nodos = HandlerNodos()


        # Ruta base común
        self.ruta_base = os.path.abspath(ruta_base)
        self.realizar = True

        # Lista para guardar rutas vigiladas
        self.rutas_vigiladas = []
        self.watch_to_path = {}

    def iniciar_vigilancia(self):
        """Inicia la vigilancia de las carpetas de usuarios"""
        for email in self.db.recuperarCorreos():
            if self.handler_nodos.verificar_cliente(email):
                ruta_usuario = os.path.join(self.ruta_base, email)
                self.rutas_vigiladas.append(ruta_usuario)
                wd = self.inotify.add_watch(ruta_usuario, self.watch_flags)
                self.watch_to_path[wd] = ruta_usuario
                print(f"Añadido a vigilancia: {ruta_usuario}")
            else:
                print(f"No se encontró .cliente en: {email}")

        print("Vigilando carpetas de usuarios válidos...")

    def monitorear_cambios(self):
        """Monitorea continuamente los cambios en las carpetas vigiladas"""
        while True:
            for event in self.inotify.read():
                ruta_base_evento = self.watch_to_path.get(event.wd, "Desconocido")
                ruta_completa = os.path.join(ruta_base_evento, event.name)
                # Extraemos el email de la ruta (último directorio de la ruta base)
                email = os.path.basename(ruta_base_evento)
                if self.realizar and email not in self.emails:
                    self.emails.append(email)
                self.nodos=self.handler_nodos.obtener_nodos_recursivo(email, False)

    def get_nodos(self):
        return self.nodos

    def get_emails(self):
        return self.emails

    def set_emails(self, emails):
        self.emails=emails

    def set_realizar(self, realizar):
        self.realizar=realizar
