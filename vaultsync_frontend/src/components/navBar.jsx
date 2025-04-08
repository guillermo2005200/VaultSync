import React, { useState, useContext } from 'react';
import './styles/navbar.css';
import logo from './images/logo.png';
import Anadir from './anadirmodal'; // importa aquí
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';

function NavBar() {
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState("");
  const {nodoActivo} = useContext(NodoContext);
  const { ruta } = useContext(RutaContext);
  const { userInfo } = useContext(ContactContext);

  const handleShow = (nuevoTipo) => {
    setTipo(nuevoTipo);           // 1. Establece el tipo (archivo o carpeta)
    setShowModal(true);           // 2. Luego muestra el modal
  };  
  const handleClose = () => {
    setShowModal(false);
    window.location.reload();
  };

  const handleliminar = () => {
    const path = `${userInfo.email}/${ruta}/${nodoActivo}`;
    console.log(path);
    VaultSyncService.eliminarArchivo(path)
      .then(response => {
        console.log("Archivo eliminado:", response.data);
        window.location.reload();
      })
      .catch(e => {
        console.log(e);
      });
  }
  

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent fixed-top shadow">
        <div className="container-fluid justify-content-between">
          <ul className="navbar-nav d-flex flex-row gap-3">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => handleShow("archivo")}>➕📄</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => handleShow("carpeta")}>➕📁</a>
              </li>
            <li className="nav-item"><a className="nav-link" href="#" onClick={() => handleliminar()}>🗑️</a></li>
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
      <Anadir show={showModal} handleClose={handleClose} tipo={tipo}/>
    </>
  );
}

export default NavBar;
