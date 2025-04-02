import './styles/contrasena.css'
import React, { useState } from 'react'
import VaultSyncService from '../services/VaultSyncService'
import { useParams, useNavigate } from "react-router-dom";

function CambiarContrasena() {
  const [password, setPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const { email } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== repetirPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    VaultSyncService.cambiarContrasena(email, password)
      .then((response) => {
        if (response.status === 200) {
          alert("Contraseña cambiada correctamente");
          navigate("/");
        } else {
          alert("Error al cambiar la contraseña");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error al cambiar la contraseña");
      });
  };

  return (
    <div className="maincontr">
      <form onSubmit={handleSubmit} className="signupcontr">
        <label className="contr-label">Introduce nueva contraseña</label>
        <input
          type="password"
          className="contr-input"
          placeholder="Contraseña"
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="contr-label">Repite la contraseña</label>
        <input
          type="password"
          className="contr-input"
          placeholder="Repetir contraseña"
          required
          onChange={(e) => setRepetirPassword(e.target.value)}
        />

        <button type="submit" className="contr-button">Cambiar contraseña</button>
      </form>
    </div>
  );
}

export default CambiarContrasena;
