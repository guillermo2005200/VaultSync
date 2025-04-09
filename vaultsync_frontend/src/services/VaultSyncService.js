import http from "../http-common";

class VaultSyncService {
  iniciarSesion(data) {
    return http.post("/iniciar",data);
  }
  registrar(data) {
    return http.post("/registrar",data);
  }
  peticionPassword(email) {
    return http.post(`/peticioncontrasena?mail=${encodeURIComponent(email)}`);
  }
  cambiarContrasena(email, contrasena) {
    return http.post(`/cambiarcontrasena?email=${encodeURIComponent(email)}&contrasena=${encodeURIComponent(contrasena)}`);
  }
  obtenerNodos(email) {
    return http.get(`/nodos?email=${encodeURIComponent(email)}`);
  }
  crearArchivo(archivo){
    return http.put(`/creararchivo?archivo=${encodeURIComponent(archivo)}`);
  };
  crearCarpeta(carpeta){
    return http.put(`/crearcarpeta?archivo=${encodeURIComponent(carpeta)}`);
  };
  eliminarArchivo(archivo) {
    return http.delete(`/eliminar?archivo=${encodeURIComponent(archivo)}`);
  }  
  modificarNombre(archivo, nombre) {
    return http.put(`/modificarnombre?archivo=${encodeURIComponent(archivo)}&nombre=${encodeURIComponent(nombre)}`);
  }  
  modificarContenido(archivo, contenido) {
    return http.put(`/modificar?archivo=${encodeURIComponent(archivo)}`, contenido, {
      headers: {
        "Content-Type": "text/plain"  // Ya que estás enviando texto puro
      }
    });
  }
  
}


export default new VaultSyncService();  