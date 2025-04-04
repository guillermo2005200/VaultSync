import './styles/iniciosesion.css';
import React, { useState, useContext } from 'react';
import VaultSyncService from '../services/VaultSyncService';
import { useNavigate } from 'react-router-dom';
import { ContactContext } from '../context/userContext';

function InicioSesion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [email2, setEmail2] = useState("");
  const [password2, setPassword2] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [direccion, setDireccion] = useState("");
  const navigate = useNavigate();
  const { setUserInfo } = useContext(ContactContext);


  function handleLogin(event) {
    event.preventDefault();
    const login = {
      email: email,
      contrasena: password
    };
  
    VaultSyncService.iniciarSesion(login)
      .then(response => {
        console.log(response.data);
        setUserInfo({
          email: email,
          contrasena: password
        });
        navigate("/nodos"); // redirige a la ruta /nodos si el login es exitoso
      })
      .catch(error => {
        console.error("Error en login:", error);
      });
  }

  function handleSingUp(event) {
    event.preventDefault();
    const singUp = {
      email: email2,
      contraseña: password2,
      nombre: nombre,
      apellido: apellido,
      direccion: direccion
    };
    VaultSyncService.registrar(singUp)
      .then(response => console.log(response.data))
      .catch(error => console.error("Error en registro:", error));
  }

  function handlePassword(event) {
    event.preventDefault();
    VaultSyncService.peticionPassword(email)
      .then(response => console.log(response.data))
      .catch(error => console.error("Error en recuperación:", error));
  }

  return (
    <div className="maininicio">
      <input type="checkbox" id="chkinicio" aria-hidden="true" />

      <div className="signupinicio">
        <form>
          <label htmlFor="chkinicio" className="labelinicio" aria-hidden="true">Sign up</label>
          <input type="text" placeholder="nombre" className="inputinicio" required onChange={(e) => setNombre(e.target.value)} />
          <input type="text" placeholder="Apellidos" className="inputinicio" required onChange={(e) => setApellido(e.target.value)} />
          <input type="email" placeholder="Email" className="inputinicio" required onChange={(e) => setEmail2(e.target.value)} />
          <input type="text" placeholder="Direccion" className="inputinicio" required onChange={(e) => setDireccion(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="inputinicio" required onChange={(e) => setPassword2(e.target.value)} />
          <button onClick={handleSingUp} className="buttoninicio">Sign up</button>
        </form>
      </div>

      <div className="logininicio">
        <form>
          <label htmlFor="chkinicio" className="labelinicio" aria-hidden="true">Login</label>
          <input type="email" placeholder="Email" className="inputinicio" required onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="inputinicio" required onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="buttoninicio">Login</button>
          <button onClick={handlePassword} className="buttoninicio">Cambiar contraseña</button>
        </form>
      </div>
    </div>
  );
}

export default InicioSesion;
