import clsx from "clsx";
import styles from "./Header.module.css";

export default function Header({ activo = true }) {
  return (
    <>
      <header
        className={clsx(styles.header, {
          [styles.activo]: activo,
          [styles.inactivo]: !activo,
        })}
      >
        <div className={styles.contenedor}>
          {/* Botón Salir - Izquierda */}
          <button className={styles.botonSalir}>Salir</button>

          {/* Título - Centro */}
          <h1 className={styles.titulo}>Adivinalichi</h1>

          {/* Logo - Derecha */}
          <div className={styles.logoContainer}>
            <img
              src="/Logo.png"
              alt="Logo"
              className={styles.logo}
            />
          </div>
        </div>
      </header>
    </>
  );
}