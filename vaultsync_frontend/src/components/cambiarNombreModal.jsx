import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';

function ModificarNombre({ show, handleClose}) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const {nodoActivo} = useContext(NodoContext);

  const handleModificar = () => {
    const email = userInfo.email;
    const archivo = `${ruta}/${nodoActivo}`;
    const nombreNuevo = nuevoNombre;

    VaultSyncService.modificarNombre(email, archivo, nombreNuevo)
      .then((response) => {
        console.log("Nombre modificado:", response.data);
      })
      .catch((error) => {
        console.error("Error al modificar el nombre:", error);
      });

    handleClose();
  };

  if (!nodoActivo) return null;

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="modal-transparente">
      <Modal.Header closeButton>
        <Modal.Title>Modificar nombre 📝</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Nuevo nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: archivo_modificado.txt"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleModificar} disabled={!nuevoNombre.trim()}>
          Modificar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModificarNombre;
