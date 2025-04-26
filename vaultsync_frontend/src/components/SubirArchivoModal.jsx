import React, { useContext, useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import './styles/modal.css';

function SubirArchivoModal({ show, handleClose }) {
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const inputRef = useRef();
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const handleInputChange = (event) => {
    setArchivoSeleccionado(event.target.files[0]);
  };

  const handleSubirArchivo = async () => {
    if (!archivoSeleccionado) {
      alert("Por favor selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("email", `${userInfo.email}/${ruta}`);
    formData.append("archivo", archivoSeleccionado);

    try {
      const response = await VaultSyncService.subirArchivo(formData);
      console.log(response.data);
      alert("Archivo subido correctamente");
      setArchivoSeleccionado(null);
      handleClose();
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Error al subir archivo");
    }

    inputRef.current.value = "";
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="modal-transparente"
    >
      <Modal.Header closeButton className="modal-header-dark" onClick={handleClose}>
        <Modal.Title>📤 Subir archivo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formArchivo">
          <Form.Label>Selecciona un archivo para subir:</Form.Label>
          <Form.Control
            type="file"
            onChange={handleInputChange}
            ref={inputRef}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubirArchivo} disabled={!archivoSeleccionado}>
          Subir
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SubirArchivoModal;
