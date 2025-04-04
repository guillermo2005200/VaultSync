import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InicioSesion from './components/inicioSesion.jsx';
import CambiarContrasena from './components/recuperacionContraseña.jsx'; 
import NavBar from './components/navBar.jsx';
import Nodos from './components/Nodos.jsx';
import { ContactProvider } from './context/userContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap'

function App() {
  return (
    <ContactProvider>
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/cambiar/:email" element={<CambiarContrasena />} />
        <Route path="/nodos" element={<Nodos/>} />
      </Routes>
    </Router>
    </ContactProvider>
  );
}

export default App;
