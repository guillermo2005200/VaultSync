import React, { useState } from 'react';
import './styles/navbar.css';
import logo from './images/logo.png';
import Anadir from './anadirmodal'; // importa aquí

function NavBar() {
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent fixed-top shadow">
        <div className="container-fluid justify-content-between">
          <ul className="navbar-nav d-flex flex-row gap-3">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={handleShow}>➕📄</a>
            </li>
            <li className="nav-item"><a className="nav-link" href="#">➕📁</a></li>
            <li className="nav-item"><a className="nav-link" href="#">🗑️</a></li>
            <li className="nav-item"><a className="nav-link" href="#">✏️</a></li>
            <li className="nav-item"><a className="nav-link" href="#">📝</a></li>
          </ul>

          <div className="mx-auto position-absolute start-50 translate-middle-x">
            <a className="navbar-brand" href="#">
              <img src={logo} alt="VaultSync" height="90" style={{ borderRadius: '8px' }} />
            </a>
          </div>

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

      {/* Modal separado */}
      <Anadir show={showModal} handleClose={handleClose} />
    </>
  );
}

export default NavBar;
