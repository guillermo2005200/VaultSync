import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css'; // Para los estilos personalizados
import VaultSyncService from '../services/VaultSyncService';

function Anadir({ show, handleClose }) {
  const [nombreArchivo, setNombreArchivo] = useState("");

  const handleCrear = () => {
   
    setNombreArchivo("");
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="modal-transparente"
    >
      <Modal.Header closeButton>
        <Modal.Title>Crear archivo 📄</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Nombre del archivo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: documento.txt"
              value={nombreArchivo}
              onChange={(e) => setNombreArchivo(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleCrear} disabled={!nombreArchivo.trim()}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Anadir;
