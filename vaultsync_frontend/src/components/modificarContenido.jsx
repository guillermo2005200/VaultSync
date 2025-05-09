import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';

function EditarContenidoModal({ show, handleClose, cont }) {
  const [contenido, setContenido] = useState("");
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const {nodoActivo} = useContext(NodoContext);

  useEffect(() => {
    if (show) {
      // Aquí puedes cargar el contenido si tienes un endpoint para leer el archivo
      console.log("Editando:");
        setContenido(cont);
    }
  }, [show]);

  const handleGuardar = () => {
    const archivo = `${userInfo.email}/${ruta}/${nodoActivo}`;
    VaultSyncService.modificarContenido(archivo, contenido)
      .then(response => {
        console.log("Contenido modificado:", response.data);
        handleClose();
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="modal-editar"
    >
      <Modal.Header closeButton className="modal-header-dark" onClick={handleClose}>
        <Modal.Title>Editar archivo 📝</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        <Form>
          <Form.Group controlId="contenidoArchivo">
            <Form.Control
              as="textarea"
              rows={20}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              style={{ fontFamily: 'monospace', resize: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-dark">
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleGuardar}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditarContenidoModal;
