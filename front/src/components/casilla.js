export default function Casilla({casilla,se_ve}) {
  return (
    <div>
        {se_ve ?
         <img src="front\public\reverso_casilla.png"></img> 
         : 
         (<><img src={casilla.img}></img>
         <br></br>
         <p>{casilla.personaje}</p></>)}
        
    </div>
  );
}
