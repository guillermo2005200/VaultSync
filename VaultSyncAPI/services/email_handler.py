# services/email_sender.py

import smtplib
from email.message import EmailMessage


class EmailSender:
    def __init__(self):
        # Configura aquí tus credenciales reales o usa variables de entorno para mayor seguridad
        self.sender = 'barcenalopezguillermo@gmail.com'
        self.password = 'thos epga owci yqlo'
        self.server = smtplib.SMTP('smtp.gmail.com',587)

    def enviar_bienvenida(self, destinatario, nombre):
        # Crear el mensaje
        message = EmailMessage()
        message["Subject"] = "Bienvenido/a a VaultSync"
        message["From"] = self.sender
        message["To"] = destinatario

        # Cuerpo del mensaje
        body = f"""
            Hola {nombre},

            Gracias por registrarte en VaultSync.

            Accede a tu espacio en la nube desde: https://vaultsync.com

            ¡Esperamos que disfrutes del servicio!
        """

        message.set_content(body)
        # Envío
        try:
            self.server.ehlo()
            self.server.starttls()
            self.server.login(self.sender, self.password)
            self.server.send_message(message)
            self.server.quit()
            print("Correo enviado correctamente.")
        except Exception as ex:
            print("Error al enviar correo:", ex)
