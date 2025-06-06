import React, { useState, useEffect, useContext } from 'react';
import VaultSyncService from '../services/VaultSyncService';
import './styles/carta.css';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';
import ModificarCEditarContenidoModal from './modificarContenido';
import { TerminalContext } from '../context/terminalContext';
import TerminalSimulada from './Terminal';



function Nodos() {
  const [nodos, setNodos] = useState([]);
  const { userInfo } = useContext(ContactContext);
  const { ruta, setRuta } = useContext(RutaContext);
  const {nodoActivo, setNodoActivo } = useContext(NodoContext);
  const [showModal, setShowModal] = useState(false);
  const [contenido, setContenido] = useState("");
  const { setTerminal } = useContext(TerminalContext);
  const { terminal } = useContext(TerminalContext);
  const [esPdf, setEsPdf] = useState(false);
  const [contenidoPdf, setContenidoPdf] = useState('');



  useEffect(() => {
    retrieveNodos();
    const interval = setInterval(() => {
      retrieveNodos();
    }, 2000); // cada 5 segundos

    return () => clearInterval(interval);
  }, [ruta]); // se ejecuta cada vez que cambia la ruta
  
  const handleClose = () => {
    setShowModal(false); 
    window.location.reload();
  };

  const retrieveNodos = () => {
    VaultSyncService.obtenerNodos(userInfo.email+ruta)
      .then(response => {
        const nodoAtras = {
          nombre: "..",
          directorio: true
        };
        setNodos([nodoAtras, ...response.data]);
      })
      .catch(e => {
        console.log(e);
      });
  };
  
 const abrirNodo = (nodo) => {
  if (nodo.directorio) {
    if (nodo.nombre === "..") {
      const nuevaRuta = ruta.substring(0, ruta.lastIndexOf("/"));
      setRuta(nuevaRuta || ""); // vuelve atrás
    } else {
      const nuevaRuta = `${ruta}/${nodo.nombre}`;
      setRuta(nuevaRuta); // avanza a carpeta
      console.log(nuevaRuta);
    }
  } else {
    let encontrado = false;

    for (let i = 0; i < nodos.length && !encontrado; i++) {
      if (nodos[i].nombre === nodo.nombre) {
        const contenido = nodos[i].contenido;

        // Detectamos si es un PDF
        if (nodo.nombre.toLowerCase().endsWith(".pdf")) {
          setContenidoPdf(contenido);     // contenido en base64 con cabecera
          setEsPdf(true);
        } else {
          setContenido(contenido);        // contenido de texto u otro
          setEsPdf(false);
        }

        encontrado = true;
      }
    }

    setShowModal(true); // muestra el modal sea texto o PDF
    console.log(`Abriendo archivo: ${nodo.nombre}`);
  }
};

  const clickSimple = (nodo) => {
    setNodoActivo(nodo.nombre);
  };
  
  
  const directorios = nodos.filter(n => n.directorio);
  const archivos = nodos.filter(n => !n.directorio && !n.nombre.startsWith('.'));

  const renderCards = (lista) => (   
    lista.map((nodo, index) => (
      <div className="col-md-2 my-1" key={`${nodo.nombre}-${index}`}>
        <div
          className={`card text-white carta-transparente ${nodoActivo === nodo.nombre ? 'carta-activa' : ''}`}
          onClick={() => clickSimple(nodo)}
          onDoubleClick={() => abrirNodo(nodo)}
        >
          <div className="card-body py-2">
            <p className="mb-0 nombre-recortada">{nodo.directorio ? `📁 ${nodo.nombre}` : `📄 ${nodo.nombre}`}</p>
          </div>
        </div>
      </div>
    ))
  );
  
  return (
    <>
      {terminal ? (
        <TerminalSimulada ruta={ruta} />
      ) : (
        <div className="container color1 text-white min-vh-100 min-vw-100 mt-5 pt-5">
          
          {/* RUTA ACTUAL */}
          <div className="text-center mb-4">
            <span className="badge bg-secondary fs-6 px-3 py-2">
              Ruta actual: /{userInfo.email+ruta}
            </span>
          </div>
  
          <div className="row justify-content-center">
            {renderCards(directorios)}
          </div>
  
          <hr className="bg-dark my-4" />
  
          <div className="row justify-content-center">
            {renderCards(archivos)}
          </div>
        </div>
      )}
  
      <ModificarCEditarContenidoModal show={showModal} handleClose={handleClose} cont={contenido} esPdf={esPdf} base64Pdf={contenidoPdf}/>
    </>
  );  
}

export default Nodos;
