import './styles/inicio.css'
import React from 'react'
import VaultSyncService from '../services/VaultSyncService'
import { useState } from 'react'

function inicioSesion() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [email2, setEmail2] = useState("");
    const [password2, setPassword2] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [direccion, setDireccion] = useState("");


function handleLogin(event) {
    event.preventDefault();
    const login = {
      email: email,
      contrasena: password
    };
    console.log(login);
    VaultSyncService.iniciarSesion(login)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error("There was an error logging in!", error);
        // Handle error here
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
        console.log(singUp);
        VaultSyncService.registrar(singUp)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error("There was an error logging in!", error);
            // Handle error here
          });
    
        }

      function handlePassword(event) {
        event.preventDefault();
        VaultSyncService.peticionPassword(email)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error("There was an error logging in!", error);
            // Handle error here
          });
    
        }

  return (
    <div className="main">  	
      <input type="checkbox" id="chk" aria-hidden="true" />

      <div className="signup">
        <form>
          <label htmlFor="chk" aria-hidden="true">Sign up</label>
          <input type="text" name="nombre" placeholder="nombre" required  onChange={(e) => setNombre(e.target.value)}/>
          <input type="text" name="apellido" placeholder="Apellidos" required  onChange={(e) => setApellido(e.target.value)}/>
          <input type="email" name="email" placeholder="Email" required  onChange={(e) => setEmail2(e.target.value)}/>
          <input type="text" name="direccion" placeholder="Direccion" required  onChange={(e) => setDireccion(e.target.value)}/>
          <input type="password" name="pswd" placeholder="Contraseña" required  onChange={(e) => setPassword2(e.target.value)}/>
          <button onClick={handleSingUp}>Sign up</button>
        </form>
      </div>

      <div className="login">
        <form>
          <label htmlFor="chk" aria-hidden="true">Login</label>
          <input type="email" name="email" placeholder="Email" required  onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" name="pswd" placeholder="Contraseña" required  onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handlePassword}>Cambiar contraseña</button>
        </form>
      </div>
    </div>
  );
}

export default inicioSesion