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

  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  const navigate = useNavigate();
  const { setUserInfo } = useContext(ContactContext);

  function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Por favor, completa el email y la contraseña.");
      return;
    }

    const login = { email, contrasena: password };

    VaultSyncService.iniciarSesion(login)
      .then(response => {
        console.log(response.data);
        setUserInfo({ email, contrasena: password });
        navigate("/nodos");
      })
      .catch(error => {
        console.error("Error en login:", error);
        setLoginError("Credenciales incorrectas o error en el servidor.");
      });
  }

  function handleSingUp(event) {
    event.preventDefault();
    setSignupError("");

    if (!email2 || !password2 || !nombre || !apellido || !direccion) {
      setSignupError("Por favor, rellena todos los campos del registro.");
      return;
    }

    const singUp = { email: email2, contraseña: password2, nombre, apellido, direccion };

    VaultSyncService.registrar(singUp)
      .then(response => {
        console.log(response.data);
        setSignupError("Registro exitoso. Ahora puedes iniciar sesión.");
        // Vaciar campos
        setEmail2("");
        setPassword2("");
        setNombre("");
        setApellido("");
        setDireccion("");
      })
      .catch(error => {
        console.error("Error en registro:", error);
        setSignupError("Error en el registro. Inténtalo de nuevo más tarde.");
      });
  }

  function handlePassword(event) {
    event.preventDefault();
    setRecoveryError("");

    if (!email) {
      setRecoveryError("Introduce tu email para recuperar la contraseña.");
      return;
    }

    VaultSyncService.peticionPassword(email)
      .then(response => {
        console.log(response.data);
        setRecoveryError("Correo enviado. Revisa tu bandeja.");
        setEmail(""); // Limpiar email tras éxito
      })
      .catch(error => {
        console.error("Error en recuperación:", error);
        setRecoveryError("No se pudo enviar el correo de recuperación.");
      });
  }

  return (
    <div className="maininicio">
      <input type="checkbox" id="chkinicio" aria-hidden="true" />

      <div className="signupinicio">
        <form>
          <label htmlFor="chkinicio" className="labelinicio" aria-hidden="true">Sign up</label>
          <input type="text" placeholder="nombre" className="inputinicio" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input type="text" placeholder="Apellidos" className="inputinicio" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          <input type="email" placeholder="Email" className="inputinicio" value={email2} onChange={(e) => setEmail2(e.target.value)} />
          <input type="text" placeholder="Direccion" className="inputinicio" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="inputinicio" value={password2} onChange={(e) => setPassword2(e.target.value)} />
          {signupError && <div className="text-danger text-center mt-2">{signupError}</div>}
          <button onClick={handleSingUp} className="buttoninicio">Sign up</button>
        </form>
      </div>

      <div className="logininicio">
        <form>
          <label htmlFor="chkinicio" className="labelinicio" aria-hidden="true">Login</label>
          <input type="email" placeholder="Email" className="inputinicio" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="inputinicio" value={password} onChange={(e) => setPassword(e.target.value)} />
          {loginError && <div className="text-danger text-center mt-2">{loginError}</div>}
          <button onClick={handleLogin} className="buttoninicio">Login</button>
          <button onClick={handlePassword} className="buttoninicio">Cambiar contraseña</button>
          {recoveryError && <div className="text-danger text-center mt-2">{recoveryError}</div>}
        </form>
      </div>
    </div>
  );
}

export default InicioSesion;
