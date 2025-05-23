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
        """Inicia la vigilancia de las carpetas de usuarios y sus subdirectorios"""
        for email in self.db.recuperarCorreos():
            if self.handler_nodos.verificar_cliente(email):
                ruta_usuario = os.path.join(self.ruta_base, email)
                self._vigilar_directorio_recursivo(ruta_usuario)
                print(f"Añadido a vigilancia: {ruta_usuario} y sus subdirectorios")
            else:
                print(f"No se encontró .cliente en: {email}")

        print("Vigilando carpetas de usuarios válidos y sus subdirectorios...")

    def _vigilar_directorio_recursivo(self, ruta):
        """Añade vigilancia recursivamente a un directorio y sus subdirectorios"""
        # Vigilar el directorio actual
        self.rutas_vigiladas.append(ruta)
        wd = self.inotify.add_watch(ruta, self.watch_flags)
        self.watch_to_path[wd] = ruta

        # Recorrer recursivamente todos los subdirectorios
        try:
            for item in os.listdir(ruta):
                ruta_item = os.path.join(ruta, item)
                if os.path.isdir(ruta_item):
                    self._vigilar_directorio_recursivo(ruta_item)
        except PermissionError:
            print(f"Sin permiso para acceder a: {ruta}")

    def monitorear_cambios(self):
        """Monitorea continuamente los cambios en las carpetas vigiladas"""
        while True:
            for event in self.inotify.read():
                ruta_base_evento = self.watch_to_path.get(event.wd, "Desconocido")
                ruta_completa = os.path.join(ruta_base_evento, event.name)

                # Extraemos el segmento entre la 6ª y la 7ª '/'
                # -> el email según tu ruta fija
                partes = ruta_base_evento.split(os.sep)
                if len(partes) > 6:
                    email = partes[6]
                else:
                    email = os.path.basename(ruta_base_evento)

                print(f"Ruta base detectada: {ruta_base_evento} -> Email: {email}")

                if self.realizar and email not in self.emails:
                    self.emails.append(email)

                self.nodos = self.handler_nodos.obtener_nodos_recursivo(email, False)

    def get_nodos(self):
        return self.nodos

    def get_emails(self):
        return self.emails

    def set_emails(self, emails):
        self.emails = emails

    def set_realizar(self, realizar):
        self.realizar = realizar
