import mysql.connector
from mysql.connector import Error
import os
import bcrypt
"""Clase para manejar la conexión a la base de datos MySQL y realizar operaciones CRUD sobre la tabla 'usuarios'."""
class DatabaseConnection:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', '3306')),
            'user': os.getenv('DB_USER', 'VaultSync'),
            'password': os.getenv('DB_PASSWORD', 'VaultSync123!'),
            'database': os.getenv('DB_NAME', 'vaultsync_db'),
        }
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                print("Conexión exitosa a la base de datos")
        except Error as e:
            print(f"Error de conexión: {e}")

    def close(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Conexión cerrada")

    def insertar_usuario(self, usuario):
        try:
            self.connect()
            cursor = self.connection.cursor()
            # Generar el hash de la contraseña
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(usuario.contraseña.encode('utf-8'), salt)

            sql = """INSERT INTO usuarios (email, contraseña, nombre, apellido, direccion, activo, foto)
                     VALUES (%s, %s, %s, %s, %s, %s, %s)"""
            valores = (
                usuario.email,
                hashed_password,  # Guardamos el hash en lugar de la contraseña en texto plano
                usuario.nombre,
                usuario.apellido,
                usuario.direccion,
                usuario.activo,
                usuario.foto
            )
            cursor.execute(sql, valores)
            self.connection.commit()
            print("Usuario insertado correctamente.")
            return True
        except Error as e:
            print(f"Error al insertar usuario: {e}")
            return False
        finally:
            self.close()

    def verificar_credenciales(self, email, contrasena):
        try:
            self.connect()
            cursor = self.connection.cursor(dictionary=True)
            sql = "SELECT * FROM usuarios WHERE email = %s"
            cursor.execute(sql, (email,))
            usuario = cursor.fetchone()

            if usuario is None:
                print("Usuario no encontrado.")
                return False

            # Verificar el hash de la contraseña
            if bcrypt.checkpw(contrasena.encode('utf-8'), usuario["contraseña"].encode('utf-8')):
                print("Credenciales válidas.")
                return True
            else:
                print("Contraseña incorrecta.")
                return False

        except Error as e:
            print(f"Error al verificar credenciales: {e}")
            return False
        finally:
            self.close()

    def cambiar_contrasena(self, email, contrasena):
        try:
            self.connect()
            cursor = self.connection.cursor(dictionary=True)

            sql_select = "SELECT * FROM usuarios WHERE email = %s"
            cursor.execute(sql_select, (email,))
            usuario = cursor.fetchone()

            if usuario is None:
                print("Usuario no encontrado.")
                return False
            else:
                # Generar nuevo hash para la nueva contraseña
                salt = bcrypt.gensalt()
                hashed_password = bcrypt.hashpw(contrasena.encode('utf-8'), salt)

                sql_update = "UPDATE usuarios SET contraseña = %s WHERE email = %s"
                cursor.execute(sql_update, (hashed_password, email))
                self.connection.commit()
                print("Contraseña actualizada correctamente.")
                return True

        except Error as e:
            print(f"Error al cambiar la contraseña: {e}")
            return False
        finally:
            self.close()

    def recuperarCorreos(self):
            try:
                self.connect()
                cursor = self.connection.cursor(dictionary=True)
                sql = "SELECT email FROM usuarios"
                cursor.execute(sql)
                correos = [row["email"] for row in cursor.fetchall()]
                return correos
            except Error as e:
                print(f"Error al recuperar correos: {e}")
                return []
            finally:
                self.close()

    def recuperar_foto(self, email):
        try:
            self.connect()
            cursor = self.connection.cursor(dictionary=True)
            sql = "SELECT foto FROM usuarios WHERE email = %s"
            cursor.execute(sql, (email,))
            usuario = cursor.fetchone()

            if usuario is None:
                print("Usuario no encontrado.")
                return None
            else:
                return usuario["foto"]

        except Error as e:
            print(f"Error al recuperar la foto: {e}")
            return None
        finally:
            self.close()
