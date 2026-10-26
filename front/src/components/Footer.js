import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.contenedor}>
          <p className={styles.texto}>
            <span className={styles.nombreProyecto}>Proyecto Integrador Final</span>
          </p>
          <p className={styles.texto}>Borda, Garcea, Piscolichi y Rey</p>
        </div>
      </footer>
    </>
  );
}