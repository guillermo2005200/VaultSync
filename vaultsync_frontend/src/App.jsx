import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InicioSesion from './components/inicioSesion.jsx';
import CambiarContrasena from './components/recuperacionContraseña.jsx'; 
import NavBar from './components/navBar.jsx';
import Nodos from './components/Nodos.jsx';
import { ContactProvider } from './context/userContext';
import { RutaProvider } from './context/rutaContext';
import { NodoProvider } from './context/nodoContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <ContactProvider>
      <RutaProvider>
        <NodoProvider> {/* 👈 Nuevo provider */}
          <Router>
            <NavBar />
            <Routes>
              <Route path="/" element={<InicioSesion />} />
              <Route path="/cambiar/:email" element={<CambiarContrasena />} />
              <Route path="/nodos" element={<Nodos />} />
            </Routes>
          </Router>
        </NodoProvider>
      </RutaProvider>
    </ContactProvider>
  );
}
export default App;
