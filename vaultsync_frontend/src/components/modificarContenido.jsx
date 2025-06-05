import { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './styles/modal.css';
import VaultSyncService from '../services/VaultSyncService';
import { ContactContext } from '../context/userContext';
import { RutaContext } from '../context/rutaContext';
import { NodoContext } from '../context/nodoContext';
import { Document, Page, pdfjs } from 'react-pdf';

// Esto es importante: para Vite, import.meta.url te permite importar archivos locales
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();



function EditarContenidoModal({ show, handleClose, cont, esPdf }) {
  const [contenido, setContenido] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const { nodoActivo } = useContext(NodoContext);

  useEffect(() => {
    if (show) {
      setContenido(cont);
      if (esPdf && nodoActivo) {
        setIsLoading(true);
        setError(null);
        setPdfData(null);
        
        const archivo = `${userInfo.email}/${ruta}/${nodoActivo}`;
        console.log('Descargando PDF:', archivo);
        
        VaultSyncService.descargarPDF(archivo)
          .then(response => {
            console.log('PDF descargado, tamaño:', response.data.byteLength, 'bytes');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfData(url);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error al descargar PDF:', error);
            setError('Error al cargar el PDF. Por favor, inténtelo de nuevo.');
            setIsLoading(false);
            setPdfData(null);
          });
      }
    }

    return () => {
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [show, esPdf, nodoActivo, userInfo.email, ruta]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    console.log('PDF cargado exitosamente:', numPages, 'páginas');
  };

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
            {isLoading ? (
              <div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : pdfData ? (
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error("Error cargando PDF:", error);
                  setError('Error al renderizar el PDF');
                }}
                loading={<div style={{ color: 'orange', fontWeight: 'bold' }}>Renderizando PDF...</div>}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    scale={1.5}
                  />
                ))}
              </Document>
            ) : (
              <div style={{ color: 'red' }}>No se pudo cargar el PDF</div>
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
