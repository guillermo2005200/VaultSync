import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';

function Anadir({ show, handleClose, tipo }) {
  const [nombre, setNombre] = useState("");
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);

  const handleCrear = () => {
    const path = `${userInfo.email}/${ruta}/${nombre}`;

    const accion =
      tipo === "archivo"
        ? VaultSyncService.crearArchivo(path)
        : tipo === "carpeta"
        ? VaultSyncService.crearCarpeta(path)
        : null;

    if (!accion) return;

    accion
      .then((response) => {
        console.log(`${tipo} creado:`, response.data);
      })
      .catch((error) => {
        console.error(`Error al crear el ${tipo}:`, error);
      });

    handleClose();
  };

  if (tipo !== "archivo" && tipo !== "carpeta") return null; // no renderiza nada

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="modal-transparente"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Crear {tipo} {tipo === "archivo" ? "📄" : "📁"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Nombre del {tipo}</Form.Label>
            <Form.Control
              type="text"
              placeholder={
                tipo === "archivo" ? "Ej: documento.txt" : "Ej: nueva_carpeta"
              }
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleCrear}
          disabled={!nombre.trim()}
        >
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Anadir;
