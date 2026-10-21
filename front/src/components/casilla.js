export default function Casilla({ casilla, se_ve, onClick }) {
  return (
    <div className="casilla" onClick={onClick}>
      <div className={`casilla-inner ${se_ve ? "" : "volteada"}`}>
        <div className="cara frente">
          <img src={casilla?.img} alt={casilla?.nombre_casilla ?? ""} />
          <p>{casilla?.nombre_casilla}</p>
        </div>

        <div className="cara reverso">
          <img src="/reverso_casilla.png" alt="reverso" />
        </div>
      </div>
    </div>
  );
}