import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      
      {/* Header */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      {/* Fondo con botones */}
      <div className={styles.backgroundContainer}>
        <div className={styles.buttonsContainer}>
          
          <Link href="/login" className={`${styles.button} ${styles.buttonLogin}`}>
            <span className={styles.buttonIcon}>👤</span>
            <span className={styles.buttonText}>Iniciar sesión / Registrarse</span>
            <span className={styles.buttonArrow}>→</span>
          </Link>

          <Link href="/categorias" className={`${styles.button} ${styles.buttonCategories}`}>
            <span className={styles.buttonIcon}>⊞</span>
            <span className={styles.buttonText}>Categorías</span>
            <span className={styles.buttonArrow}>→</span>
          </Link>

          <Link href="/historial" className={`${styles.button} ${styles.buttonHistory}`}>
            <span className={styles.buttonIcon}>🕒</span>
            <span className={styles.buttonText}>Historial de partidas</span>
            <span className={styles.buttonArrow}>→</span>
          </Link>

        </div>
      </div>

      {/* Footer */}
      <div className={styles.footerWrapper}>
        <Footer />
      </div>

    </div>
  );
}