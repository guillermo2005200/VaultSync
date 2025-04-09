import React, { useState, useEffect, useContext } from 'react';
import VaultSyncService from '../services/VaultSyncService';
import './styles/carta.css';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';
import ModificarCEditarContenidoModal from './modificarContenido';


function Nodos() {
  const [nodos, setNodos] = useState([]);
  const { userInfo } = useContext(ContactContext);
  const { ruta, setRuta } = useContext(RutaContext);
  const {nodoActivo, setNodoActivo } = useContext(NodoContext);
  const [showModal, setShowModal] = useState(false);
  const [contenido, setContenido] = useState("");


  useEffect(() => {
    retrieveNodos();
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
          setContenido(nodos[i].contenido);
          encontrado = true;
        }
      }
      setShowModal(true);
      console.log(`Abriendo archivo: ${nodo.nombre}`);

    }
  };

  const clickSimple = (nodo) => {
    setNodoActivo(nodo.nombre);
  };
  
  
  const directorios = nodos.filter(n => n.directorio);
  const archivos = nodos.filter(n => !n.directorio);

  const renderCards = (lista) => (   
    lista.map((nodo, index) => (
      <div className="col-md-2 my-1" key={`${nodo.nombre}-${index}`}>
        <div
          className={`card text-white carta-transparente ${nodoActivo === nodo.nombre ? 'carta-activa' : ''}`}
          onClick={() => clickSimple(nodo)}
          onDoubleClick={() => abrirNodo(nodo)}
        >
          <div className="card-body py-2">
            <p className="mb-0">{nodo.directorio ? `📁 ${nodo.nombre}` : `📄 ${nodo.nombre}`}</p>
          </div>
        </div>
      </div>
    ))
  );
  
  return (
    <>
    <div className="container color1 text-white min-vh-100 min-vw-100 mt-5 pt-5" style={{ fontFamily: 'Cursive' }}>
      <div className="row justify-content-center">
        {renderCards(directorios)}
      </div>

      <hr className="bg-white my-4" />

      <div className="row justify-content-center">
        {renderCards(archivos)}
      </div>
    </div>
    <ModificarCEditarContenidoModal show={showModal} handleClose={handleClose} cont={contenido} />
    </>
  );
}

export default Nodos;
