import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import InicioSesion from './components/inicioSesion.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
   <InicioSesion></InicioSesion>
  )
}

export default App
