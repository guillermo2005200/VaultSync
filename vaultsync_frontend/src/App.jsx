import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InicioSesion from './components/inicioSesion.jsx';
import CambiarContrasena from './components/recuperacionContraseña.jsx'; 
import NavBar from './components/navBar.jsx';
import Nodos from './components/Nodos.jsx';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<InicioSesion />} />
        <Route path="/cambiar/:email" element={<CambiarContrasena />} />
        <Route path="/nodos" element={<Nodos/>} />
      </Routes>
    </Router>
  );
}

export default App;
