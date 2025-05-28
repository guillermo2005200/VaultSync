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


function EditarContenidoModal({ show, handleClose, cont, esPdf, base64Pdf }) {
  const [contenido, setContenido] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const { nodoActivo } = useContext(NodoContext);

  useEffect(() => {
    if (show) {
      setContenido(cont);
      if (esPdf && base64Pdf) {
        // Asegurarnos de que el base64 tenga el formato correcto
        const pdfPrefix = 'data:application/pdf;base64,';
        const formattedBase64 = base64Pdf.startsWith(pdfPrefix) 
          ? base64Pdf 
          : pdfPrefix + base64Pdf;
        setPdfData(formattedBase64);
      }
    }
  }, [show, cont, base64Pdf, esPdf]);

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
        <Modal.Title>{esPdf ? 'Visualizar PDF 📄' : 'Editar archivo 📝'}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark text-white">
        {esPdf ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
            {pdfData ? (
              <Document
                file={pdfData}
                onLoadError={(error) => console.error("Error cargando PDF:", error)}
                loading={<div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>}
                noData={<div style={{ color: 'red' }}>No se pudo cargar el PDF.</div>}
              >
                <Page 
                  pageNumber={1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>
            )}
          </div>
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
