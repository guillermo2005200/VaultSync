# services/email_sender.py

import smtplib
from email.message import EmailMessage

"""Clase que se encarga de enviar correos electrónicos de bienvenida y recuperación de contraseña."""
class EmailSender:
    def __init__(self):
        # Configuración del servidor SMTP
        self.sender = 'barcenalopezguillermo@gmail.com'
        self.password = 'thos epga owci yqlo'
        self.server = smtplib.SMTP('smtp.gmail.com',587)

    # cuando el usuario se registre, se le enviará un correo de bienvenida
    def enviar_bienvenida(self, destinatario, nombre):
        # Crear el mensaje
        message = EmailMessage()
        message["Subject"] = "Bienvenido/a a VaultSync"
        message["From"] = self.sender
        message["To"] = destinatario

        # Cuerpo del mensaje en HTML
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0056b3;">Hola {nombre},</h2>
                <p>
                    Gracias por registrarte en <strong>VaultSync</strong>. Estamos encantados de tenerte con nosotros.
                </p>
                <p>
                    Accede a tu espacio en la nube desde:
                    <a href="https://vaultsync.es" style="color: #0056b3; text-decoration: none;">vaultsync.es</a>
                </p>
                <p>
                    Si tienes alguna pregunta, no dudes en contactarnos.
                </p>
                <p>Atentamente,<br>El equipo de VaultSync</p>
            </body>
        </html>
        """

        message.add_alternative(body, subtype="html")

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


    # cuando el usuario solicite recuperar su contraseña, se le enviará un correo con un enlace para cambiarla
    def recuperacion_contrasena(self, destinatario):
        print(destinatario)
        # Crear el mensaje
        message = EmailMessage()
        message["Subject"] = "Bienvenido/a a VaultSync"
        message["From"] = self.sender
        message["To"] = destinatario

        # Cuerpo del mensaje
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0056b3;">Recuperación de Contraseña</h2>
                <p>
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>VaultSync</strong>.
                </p>
                <p>
                    Para continuar con el proceso, haz clic en el siguiente enlace:
                    <a href="https://vaultsync.es/cambiar/{destinatario}" style="color: #0056b3; text-decoration: none;">
                        Restablecer contraseña
                    </a>
                </p>
                <p>
                    Si no has solicitado este cambio, puedes ignorar este mensaje.
                </p>
                <p>Atentamente,<br>El equipo de VaultSync</p>
            </body>
        </html>
        """

        message.add_alternative(body, subtype="html")

        # Envío
        try:
            self.server.ehlo()
            self.server.starttls()
            self.server.login(self.sender, self.password)
            self.server.send_message(message)
            self.server.quit()
            return "Correo enviado correctamente."
        except Exception as ex:
            return "Error al enviar correo:", ex
