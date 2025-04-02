import React from 'react';
import './styles/navbar.css'; // por si quieres añadir estilo personalizado
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './images/logo.png';



function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-transparent fixed-top shadow">
      <div className="container-fluid justify-content-between">

        {/* Menú izquierdo */}
        <ul className="navbar-nav d-flex flex-row gap-3">
          <li className="nav-item">
            <a className="nav-link active" href="#">Inicio</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Mis Archivos</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Ajustes</a>
          </li>
        </ul>
 {/* Logo centrado */}
 <div className="mx-auto position-absolute start-50 translate-middle-x">
      <a className="navbar-brand" href="#">
        <img
          src={logo}
          alt="VaultSync"
          height="90"
          style={{ borderRadius: '8px' }}
        />
      </a>
    </div>

        {/* Imagen de usuario a la derecha */}
        <div className="d-flex align-items-center">
          <img
            src="https://randomuser.me/api/portraits/men/75.jpg"
            alt="Perfil"
            height="40"
            width="40"
            className="rounded-circle"
          />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
