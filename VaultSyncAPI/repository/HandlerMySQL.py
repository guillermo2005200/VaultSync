import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='password',
        database='mi_base_datos'
    )
    if connection.is_connected():
        print("conexión exitosa")

except Error as e:
    print(f"Error de conexión: {e}")

finally:
    if connection.is_connected():
        connection.close()
        print("conexíon cerrada")
