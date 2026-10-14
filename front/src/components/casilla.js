export default function Casilla({ casilla, se_ve,onClick }) {
  
  
  return se_ve ? (
    <div className="casilla frente" onClick={onClick}>
      <img src={casilla.img} alt={casilla.personaje} />
      <p>{casilla.nombre}</p>
    </div>
  ) : (
    <div className="casilla" onClick={onClick}>
      <img src="/reverso_casilla.png" alt="reverso" />
    </div>
  );
}
