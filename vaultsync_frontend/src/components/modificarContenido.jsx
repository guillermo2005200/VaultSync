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
  const [numPages, setNumPages] = useState(null);
  const { userInfo } = useContext(ContactContext);
  const { ruta } = useContext(RutaContext);
  const { nodoActivo } = useContext(NodoContext);

  const convertToBase64 = (pdfContent) => {
    try {
      // Si pdfContent es un ArrayBuffer (lo que obtenemos de un PDF binario)
      if (pdfContent instanceof ArrayBuffer) {
        const bytes = new Uint8Array(pdfContent);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        // Usar encodeURIComponent para manejar caracteres no-Latin1
        const base64 = btoa(encodeURIComponent(binary).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
          }));
        return `data:application/pdf;base64,${base64}`;
      }
      
      // Si es un string que comienza con %PDF
      if (typeof pdfContent === 'string' && pdfContent.startsWith('%PDF')) {
        const base64 = btoa(encodeURIComponent(pdfContent).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
          }));
        return `data:application/pdf;base64,${base64}`;
      }
      
      // Si ya es una URL de datos base64
      const pdfPrefix = 'data:application/pdf;base64,';
      if (typeof pdfContent === 'string' && pdfContent.startsWith(pdfPrefix)) {
        return pdfContent;
      }
      
      // Si es base64 sin el prefijo
      return `${pdfPrefix}${pdfContent}`;
    } catch (error) {
      console.error('Error converting PDF:', error);
      return null;
    }
  };

  useEffect(() => {
    if (show) {
      setContenido(cont);
      if (esPdf) {
        console.log('Tipo de contenido PDF:', typeof cont);
        const data = base64Pdf || cont;
        if (data) {
          const pdfDataUrl = convertToBase64(data);
          console.log('PDF data URL generada', pdfDataUrl ? pdfDataUrl.substring(0, 100) : 'null');
          setPdfData(pdfDataUrl);
        }
      }
    }
  }, [show, cont, base64Pdf, esPdf]);

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
            {pdfData ? (
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error("Error cargando PDF:", error);
                  console.log("PDF data:", pdfData.substring(0, 100)); // Log primeros 100 caracteres
                }}
                loading={<div style={{ color: 'orange', fontWeight: 'bold' }}>Cargando PDF...</div>}
                noData={<div style={{ color: 'red' }}>No se pudo cargar el PDF.</div>}
              >
                {numPages && <Page 
                  pageNumber={1} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  scale={1.5}
                />}
              </Document>
            ) : (
              <div style={{ color: 'orange', fontWeight: 'bold' }}>Procesando PDF...</div>
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
