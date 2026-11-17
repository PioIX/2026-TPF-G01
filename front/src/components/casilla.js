import styles from "@/app/juego/page.module.css";

export default function Casilla({ casilla, se_ve, onClick }) {
  return (
    <div className={styles.casilla} onClick={onClick}>
      <div className={`${styles.casillaInner} ${se_ve ? "" : styles.volteada}`}>
        <div className={`${styles.cara} ${styles.frente}`}>
          <img src={casilla?.img} alt={casilla?.nombre_casilla ?? ""} />
          <p>{casilla?.nombre_casilla}</p>
        </div>

        <div className={`${styles.cara} ${styles.reverso}`}>
          <img src="/reverso_casilla.png" alt="reverso" />
        </div>
      </div>
    </div>
  );
}