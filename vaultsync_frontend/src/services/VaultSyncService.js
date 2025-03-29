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
}

export default new VaultSyncService();  