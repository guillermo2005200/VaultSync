import React, { useState, useContext } from 'react';
import './styles/navbar.css';
import image from './images/image.png';
import Anadir from './anadirmodal';
import ModificarNombre from './cambiarNombreModal';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';
import { TerminalContext } from '../context/terminalContext.jsx';
import SubirArchivoModal from './SubirArchivoModal';
import { useLocation } from 'react-router-dom'; // <-- importar

function NavBar() {
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [tipo, setTipo] = useState("");

  const { nodoActivo } = useContext(NodoContext);
  const { ruta } = useContext(RutaContext);
  const { setRuta } = useContext(RutaContext);
  const { userInfo } = useContext(ContactContext);
  const { setTerminal, terminal } = useContext(TerminalContext);
  const location = useLocation();

  if (terminal || location.pathname === "/") return null;

  const handleShow = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setShowModal(true);
  };

  const handleShow2 = () => setShowModal2(true);
  const handleShow3 = () => setShowModal3(true);

  const handleClose = () => {
    setShowModal(false);
    setShowModal2(false);
    setShowModal3(false);
    window.location.reload();
  };

  const handleliminar = () => {
    const path = `${userInfo.email}/${ruta}/${nodoActivo}`;
    VaultSyncService.eliminarArchivo(path)
      .then(response => {
        console.log("Archivo eliminado:", response.data);
        window.location.reload();
      })
      .catch(e => {
        console.log(e);
      });
  };

  const handleDescargar = () => {
    if (!nodoActivo) {
      alert("No hay archivo seleccionado para descargar");
      return;
    }
    const path = `${userInfo.email}/${ruta}/${nodoActivo}`;
    VaultSyncService.descargarArchivo(path)
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const nombreArchivo = nodoActivo || 'archivo.txt';
        link.setAttribute('download', nombreArchivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(e => {
        console.error("Error al descargar archivo:", e);
        alert("No se pudo descargar el archivo");
      });
  };

  const handleTerminal = () => {
    setTerminal(true);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top shadow">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContenido"
            aria-controls="navbarContenido"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="position-absolute start-50 translate-middle-x">
            <a className="navbar-brand" href="#" onClick={() => setRuta("")}>
              <img src={image} alt="VaultSync" height="90" style={{ borderRadius: '8px' }} />
            </a>
          </div>

          <div className="collapse navbar-collapse" id="navbarContenido">
            <ul className="navbar-nav d-flex flex-row gap-3">
              <li className="nav-item">
                <a className="fw-bold nav-link" href="#" onClick={() => handleShow("archivo")}>➕📄</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={() => handleShow("carpeta")}>➕📁</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={handleliminar}>🗑️</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={handleShow2}>✏️</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={handleDescargar}>📥</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={handleShow3}>📤</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="" onClick={handleTerminal}>📟</a>
              </li>
            </ul>
          </div>

          <div className="d-flex align-items-center ms-auto me-3 dropdown">
            <img
              src={userInfo.foto || "https://via.placeholder.com/40"}
              alt="Perfil"
              height="40"
              width="40"
              className="rounded-circle dropdown-toggle"
              id="perfilDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: 'pointer' }}
            />
            <ul className="dropdown-menu dropdown-menu-end" style={{ background: "rgba(104, 104, 104, 0.5)" }} aria-labelledby="perfilDropdown">
              <li>
                <a className="dropdown-item text-dark" href="#" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
                  Cerrar sesión 👨
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modales */}
      <Anadir show={showModal} handleClose={handleClose} tipo={tipo} />
      <ModificarNombre show={showModal2} handleClose={handleClose} />
      <SubirArchivoModal show={showModal3} handleClose={handleClose} />
    </>
  );
}

export default NavBar;
