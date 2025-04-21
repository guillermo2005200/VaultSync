import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/terminal.css';
import { RutaContext } from '../context/rutaContext';
import { TerminalContext } from '../context/terminalContext';
import { ContactContext } from '../context/userContext';

function TerminalSimulada() {
  const [comando, setComando] = useState('');
  const [historial, setHistorial] = useState([]);
  const { ruta, setRuta } = useContext(RutaContext);
  const { setTerminal } = useContext(TerminalContext);
  const { userInfo } = useContext(ContactContext);

  const ejecutarComando = (entrada) => {
    const args = entrada.trim().split(" ");
    const comandoBase = args[0];
    const argumentos = args.slice(1);

    setHistorial(h => [...h, `$ ${entrada}`]);

    switch (comandoBase) {
      case "clear":
        setHistorial([]);
        break;

      case "mkdir":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar un nombre para la carpeta."]);
          return;
        }
        setHistorial(h => [...h, `📁 Carpeta creada: ${argumentos[0]}`]);
        break;

      case "mkfile":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar un nombre para el archivo."]);
          return;
        }
        setHistorial(h => [...h, `📄 Archivo creado: ${argumentos[0]}`]);
        break;

      case "cd":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar la carpeta a la que deseas acceder."]);
          return;
        }
        const nuevaRuta = argumentos[0] === ".."
          ? ruta.substring(0, ruta.lastIndexOf("/"))
          : ruta ? `${ruta}/${argumentos[0]}` : argumentos[0];
        setRuta(nuevaRuta);
        setHistorial(h => [...h, `📂 Ruta actual: ${nuevaRuta}`]);
        break;

      case "ls":
        setHistorial(h => [...h, `🔍 Listando archivos en ${ruta}... (simulado)`]);
        break;

      case "pwd":
        setHistorial(h => [...h, `📍 ${ruta || "/"}`]);
        break;

      case "descargar":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar el archivo a descargar."]);
          return;
        }
        setHistorial(h => [...h, `📥 Descargando: ${argumentos[0]}`]);
        break;

      case "subir":
        setHistorial(h => [...h, "📤 La subida debe hacerse desde la interfaz."]);
        break;

      case "cambiar":
        if (argumentos[0] !== "nombre" || argumentos.length < 3) {
          setHistorial(h => [...h, "Uso: cambiar nombre <archivo> <nuevo_nombre>"]);
          return;
        }
        setHistorial(h => [...h, `✏️ Renombrado '${argumentos[1]}' a '${argumentos[2]}'`]);
        break;

      case "modificar":
        if (argumentos[0] !== "contenido" || argumentos.length < 2) {
          setHistorial(h => [...h, "Uso: modificar contenido <archivo>"]);
          return;
        }
        setHistorial(h => [...h, `📝 Editando contenido de ${argumentos[1]} (simulado)`]);
        break;

      case "exit":
        setTerminal(false);
        break;

      case "cerrar":
        if (argumentos[0] === "sesion") {
          localStorage.clear();
          window.location.href = "/";
        } else {
          setHistorial(h => [...h, "¿Querías decir 'cerrar sesion'?"]);
        }
        break;

      default:
        setHistorial(h => [...h, `❌ Comando no reconocido: ${comandoBase}`]);
    }
  };

  const manejarEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (comando.trim() !== '') {
        ejecutarComando(comando);
        setComando('');
      }
    }
  };

  return (
    <div className="container-fluid p-0 vh-100 vw-100 d-flex flex-column bg-dark text-white terminal-fondo">
      <div className="bg-secondary py-2 px-3 d-flex align-items-center justify-content-between">
        <div>
          <span className="me-2 terminal-circulo bg-danger"></span>
        </div>
        <span className="text-muted small">VaultSync Terminal</span>
        <span></span>
      </div>

      <div className="flex-grow-1 p-3 overflow-auto" id="terminal-scroll">
        {historial.map((linea, index) => (
          <div key={index}><span className="text-success">$</span> {linea}</div>
        ))}
        <div className="d-flex">
          <span className="text-success me-3 terminal-input">{"$ " + userInfo.email + "/" + ruta+" -> "}</span>
          <input
            type="text"
            className="form-control bg-transparent border-0 text-white shadow-none p-0"
            value={comando}
            onChange={(e) => setComando(e.target.value)}
            onKeyDown={manejarEnter}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

export default TerminalSimulada;
