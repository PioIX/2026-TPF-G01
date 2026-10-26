"use client"

import { useState } from "react";
import Boton from "@/components/Boton";
import styles from "./page.module.css";

export default function UsuariosPage() {

  const [nombre_usuario, setNombre_usuario] = useState("");
  const [mail, setMail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registro, setRegistro] = useState(false);

  const Login = () => {
    fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mail: mail,
        contrasena: contrasena
      })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
      })
      .catch(error => {
        console.log(error);
        setMensaje("Error al conectar con el servidor");
      });
  };

  const Registro = () => {
    fetch("http://localhost:4000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre_usuario: nombre_usuario,
        mail: mail,
        contrasena: contrasena
      })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
      })
      .catch(error => {
        console.log(error);
        setMensaje("Error al conectar con el servidor");
      });
  };

  return (
    <div className={styles.container}>
      {registro ? (
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Registrarse</h1>

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombre_usuario}
            onChange={(e) => setNombre_usuario(e.target.value)}
            className={styles.input}
          />

          <input
            type="email"
            placeholder="Mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={styles.input}
          />

          <button 
            onClick={Registro}
            className={styles.submitButton}
          >
            Registrarse
          </button>

          {mensaje && <p className={styles.message}>{mensaje}</p>}

          <button 
            onClick={() => setRegistro(false)}
            className={styles.toggleButton}
          >
            Ya tengo una cuenta
          </button>
        </div>
      ) : (
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Iniciar sesión</h1>

          <input
            type="email"
            placeholder="Mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className={styles.input}
          />

          <button 
            onClick={Login}
            className={styles.submitButton}
          >
            Iniciar sesión
          </button>

          {mensaje && <p className={styles.message}>{mensaje}</p>}

          <button 
            onClick={() => setRegistro(true)}
            className={styles.toggleButton}
          >
            No tengo una cuenta
          </button>
        </div>
      )}
    </div>
  );
}