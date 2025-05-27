# services/email_sender.py

import smtplib
from email.message import EmailMessage


class EmailSender:
    def __init__(self):
        # Configura aquí tus credenciales reales o usa variables de entorno para mayor seguridad
        self.sender = 'barcenalopezguillermo@gmail.com'
        self.password = 'thos epga owci yqlo'
        self.server = smtplib.SMTP('smtp.gmail.com',587)

        with open("./logo.png", "rb") as image_file:
            import base64
            self.base64_imagen = base64.b64encode(image_file.read()).decode()

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
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="data:image/png;base64,{self.base64_imagen}" alt="VaultSync" style="width: 150px; height: auto;">
                </div>
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
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://ruta-del-logo.com/logo.png" alt="VaultSync" style="width: 150px; height: auto;">
                </div>
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
