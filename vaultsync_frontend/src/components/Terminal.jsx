import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/terminal.css';
import { RutaContext } from '../context/rutaContext';
import { TerminalContext } from '../context/terminalContext';
import { ContactContext } from '../context/userContext';
import { useEffect } from 'react';
import VaultSyncService from '../services/VaultSyncService';

function TerminalSimulada() {
  const [comando, setComando] = useState('');
  const [historial, setHistorial] = useState([]);
  const { ruta, setRuta } = useContext(RutaContext);
  const { setTerminal } = useContext(TerminalContext);
  const { userInfo } = useContext(ContactContext);
  const [nodos, setNodos] = useState([]);


  useEffect(() => {
      retrieveNodos();
    }, [ruta]);
    useEffect(() => {
      const comandos = historial[historial.length - 1];
      if (comandos && typeof comandos === 'string' && comandos.startsWith('$ ')) {
      retrieveNodos();
      }
    }, [historial, ruta]);

    const retrieveNodos = () => {
        VaultSyncService.obtenerNodos(userInfo.email+ruta)
          .then(response => {
            const nodoAtras = {
              nombre: "..",
              directorio: true
            };
            setNodos([nodoAtras, ...response.data]);
          })
          .catch(e => {
            console.log(e);
          });
      };

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

        const path = `${userInfo.email}/${ruta}/${argumentos[0]}`;
        console.log(path);
        VaultSyncService.crearCarpeta(path)
          .then(() => {
            setHistorial(h => [...h, `✅ Carpeta creada exitosamente en el servidor.`]);
          })
          .catch((error) => {
            setHistorial(h => [...h, `❌ Error al crear la carpeta: ${error.message}`]);
          });
        break;

      case "mkfile":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar un nombre para el archivo."]);
          return;
        }

        const filePath = `${userInfo.email}/${ruta}/${argumentos[0]}`;
        console.log(filePath);
        VaultSyncService.crearArchivo(filePath)
          .then(() => {
        setHistorial(h => [...h, `✅ Archivo creado exitosamente en el servidor.`]);
          })
          .catch((error) => {
        setHistorial(h => [...h, `❌ Error al crear el archivo: ${error.message}`]);
          });
        break;

      case "cd":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar la carpeta a la que deseas acceder."]);
          return;
        }

        if (argumentos[0] === "..") {
          const nuevaRuta = ruta.substring(0, ruta.lastIndexOf("/"));
          setRuta(nuevaRuta);
          setHistorial(h => [...h, `📂 Ruta actual: ${nuevaRuta}`]);
          return;
        }

        const targetDir = nodos.find(nodo => nodo.nombre === argumentos[0] && nodo.directorio);
        if (!targetDir) {
          setHistorial(h => [...h, `❌ Error: La carpeta '${argumentos[0]}' no existe.`]);
          return;
        }

        const nuevaRuta = ruta ? `${ruta}/${argumentos[0]}` : argumentos[0];
        if (ruta === "") {
          setRuta("/"+nuevaRuta);
        } else {
          setRuta(nuevaRuta);
        }
        setHistorial(h => [...h, `📂 Ruta actual: ${nuevaRuta}`]);
        break;

      case "ls":
        if (nodos.length === 0) {
          setHistorial(h => [...h, "📂 No hay archivos ni carpetas en este directorio."]);
        } else {
          const carpetas = nodos.filter(nodo => nodo.directorio).map(nodo => `📁 ${nodo.nombre}`).join('\n');
          const archivos = nodos.filter(nodo => !nodo.directorio).map(nodo => `📄 ${nodo.nombre}`).join('\n');
          const contenido = <>
        Carpetas:<br/><br/>
        {carpetas || "Ninguna"}<br/><br/>
        ---<br/><br/>
        Archivos:<br/><br/>
        {archivos || "Ninguno"}
          </>;
          setHistorial(h => [...h, <>🔍 Contenido de {ruta}:<br/>{contenido}</>]);
        }
        break;

      case "pwd":
        setHistorial(h => [...h, `📍 ${userInfo.email+ruta}`]);
        break;

      case "descargar":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar el archivo a descargar."]);
          return;
        }

        const downloadPath = `${userInfo.email}/${ruta}/${argumentos[0]}`;
        VaultSyncService.descargarArchivo(downloadPath)
          .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', argumentos[0]);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setHistorial(h => [...h, `✅ Archivo ${argumentos[0]} descargado exitosamente.`]);
          })
          .catch(error => {
        setHistorial(h => [...h, `❌ Error al descargar el archivo: ${error.message}`]);
          });
        break;

      case "subir":
        if (argumentos.length === 0) {
          setHistorial(h => [...h, "Error: Debes indicar el archivo a subir."]);
          return;
        }

        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Trigger click and handle file selection
        fileInput.click();
        fileInput.onchange = (event) => {
          const file = event.target.files[0];
          const formData = new FormData();
          formData.append("email", `${userInfo.email}/${ruta}`);
          formData.append("archivo", file);

          VaultSyncService.subirArchivo(formData)
        .then(response => {
          setHistorial(h => [...h, `✅ Archivo ${file.name} subido exitosamente.`]);
          retrieveNodos();
          document.body.removeChild(fileInput);
        })
        .catch(error => {
          setHistorial(h => [...h, `❌ Error al subir el archivo: ${error.message}`]);
          document.body.removeChild(fileInput);
        });
        };
        break;
        case "cambiar":
          if (argumentos[0] !== "nombre" || argumentos.length < 3) {
            setHistorial(h => [...h, "Uso: cambiar nombre <archivo> <nuevo_nombre>"]);
            return;
          }
          
          const oldPath = `${userInfo.email}/${ruta}/${argumentos[1]}`;
          const newPath = `${argumentos[2]}`;
          
          VaultSyncService.modificarNombre(oldPath, newPath)
            .then(() => {
          setHistorial(h => [...h, `✅ Archivo renombrado exitosamente de '${argumentos[1]}' a '${argumentos[2]}'`]);
          retrieveNodos();
            })
            .catch((error) => {
          setHistorial(h => [...h, `❌ Error al renombrar el archivo: ${error.message}`]);
            });
          break;

      case "modificar":
        if (argumentos[0] !== "contenido" || argumentos.length < 2) {
          setHistorial(h => [...h, "Uso: modificar contenido <archivo>"]);
          return;
        }

        const nodoEncontrado = nodos.find(nodo => nodo.nombre === argumentos[1]);
        
        if (!nodoEncontrado) {
          setHistorial(h => [...h, `❌ Error: No se encontró el archivo ${argumentos[1]}`]);
          return;
        }

        setHistorial(h => [...h, 
          <>
        <div className="nano-editor vw-100">
          <div className="nano-header">
            Editor de texto - {argumentos[1]}
            <small> (Ctrl-S para guardar, Esc para cancelar)</small>
          </div>
          <textarea 
            className="nano-textarea"
            style={{ width: '90vw', height: '70vh' }}
            defaultValue={nodoEncontrado.contenido}
            onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const newContent = e.target.value;
            const contentPath = `${userInfo.email}/${ruta}/${argumentos[1]}`;
            VaultSyncService.modificarContenido(contentPath, newContent)
              .then(() => {
            setHistorial(h => [...h, "✅ Archivo guardado exitosamente"]);
            retrieveNodos();
              })
              .catch(error => {
            setHistorial(h => [...h, `❌ Error al guardar: ${error.message}`]);
              });
          } else if (e.key === 'Escape') {
            setHistorial(h => [...h, "❌ Edición cancelada"]);
          }
            }}
            autoFocus
          />
        </div>
          </>
        ]);
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
          <span className="text-success me-3 terminal-input">{"$ " + userInfo.email + ruta+" -> "}</span>
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
