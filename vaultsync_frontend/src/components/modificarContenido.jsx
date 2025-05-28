import { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';
import { Document, Page, pdfjs } from 'react-pdf';

// Vite requiere @vite-ignore para workerSrc dinámico
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs`;


function base64ToUint8Array(base64) {
  // Remove data URI prefix if present
  let cleaned = base64.replace(/^data:application\/pdf;base64,/, '');
  // Convert from URL-safe base64 to standard base64
  cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if necessary
  while (cleaned.length % 4 !== 0) {
    cleaned += '=';
  }
  const binaryString = window.atob(cleaned);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function EditarContenidoModal({ show, handleClose, cont, esPdf, base64Pdf }) {
  const [contenido, setContenido] = useState("");
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const { nodoActivo } = useContext(NodoContext);

  useEffect(() => {
    if (show) {
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
    >
      <Modal.Body className="bg-dark">
        {esPdf ? (
          base64Pdf ? (
            <Document
              file={{ data: base64ToUint8Array(base64Pdf) }}
              onLoadError={(error) => console.error("Error cargando PDF:", error)}
              loading={<div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>}
              noData={<div style={{ color: 'red' }}>No se proporcionó PDF.</div>}
            >
              <Page pageNumber={1} />
            </Document>
          ) : (
            <div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>
          )
        ) : (
          <Form>
            <Form.Group controlId="contenidoArchivo">
              <Form.Control
                as="textarea"
                rows={20}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                style={{
                  fontFamily: 'monospace',
                  resize: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-dark">
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="success" onClick={handleGuardar} disabled={esPdf}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditarContenidoModal;
