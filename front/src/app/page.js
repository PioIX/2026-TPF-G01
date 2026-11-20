
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {

  const [idUsuario, setIdUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    setIdUsuario(localStorage.getItem("id"));
    setEsAdmin(localStorage.getItem("es_admin") == 1);
  }, []);

  const CerrarSesion = () => {
    localStorage.removeItem("id");
    localStorage.removeItem("es_admin");

    setIdUsuario(null);
    setEsAdmin(false);
  };

  return (
    <div className={styles.pageWrapper}>

      <div className={styles.backgroundContainer}>
        <div className={styles.buttonsContainer}>

          {/* Iniciar sesión / Registrarse */}
          <Link href="/usuarios" className={`${styles.button} ${styles.buttonLogin}`}>
            <span className={styles.buttonIcon}>👤</span>
            <span className={styles.buttonText}>Iniciar sesión / Registrarse</span>
            <span className={styles.buttonArrow}>→</span>
          </Link>

          {/* Cerrar sesión */}
          {idUsuario && (
            <button
              onClick={CerrarSesion}
              className={`${styles.button} ${styles.buttonCategories}`}
            >
              <span className={styles.buttonIcon}>🚪</span>
              <span className={styles.buttonText}>Cerrar sesión</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          )}

          {/* Jugar */}
          {idUsuario ? (
            <Link href={"/partidas?id=" + idUsuario} className={`${styles.button} ${styles.buttonCategories}`}>
              <span className={styles.buttonIcon}>🎮</span>
              <span className={styles.buttonText}>Jugar</span>
              <span className={styles.buttonArrow}>→</span>
            </Link>
          ) : (
            <button
              onClick={() => alert("Tenés que iniciar sesión para jugar")}
              className={`${styles.button} ${styles.buttonCategories}`}
            >
              <span className={styles.buttonIcon}>🎮</span>
              <span className={styles.buttonText}>Jugar</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          )}

          {/* Historial */}
          {idUsuario ? (
            <Link href={"/historial?id=" + idUsuario} className={`${styles.button} ${styles.buttonHistory}`}>
              <span className={styles.buttonIcon}>🕒</span>
              <span className={styles.buttonText}>Historial de partidas</span>
              <span className={styles.buttonArrow}>→</span>
            </Link>
          ) : (
            <button
              onClick={() => alert("Tenés que iniciar sesión para ver el historial")}
              className={`${styles.button} ${styles.buttonHistory}`}
            >
              <span className={styles.buttonIcon}>🕒</span>
              <span className={styles.buttonText}>Historial de partidas</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          )}

          {/* Administración */}
          {idUsuario && esAdmin && (
            <Link href="/admin" className={`${styles.button} ${styles.buttonHistory}`}>
              <span className={styles.buttonIcon}>⚙️</span>
              <span className={styles.buttonText}>Administración</span>
              <span className={styles.buttonArrow}>→</span>
            </Link>
          )}

        </div>
      </div>

    </div>
  );
}
