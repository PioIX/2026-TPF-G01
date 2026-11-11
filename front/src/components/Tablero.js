"use client"

import Casilla from "./casilla";
import { useEffect, useState } from "react";

export default function Tablero({ casillas,paraCasillas }) {


  function dividirEnGrupos(lista) {
  const resultado = [];
  for (let i = 0; i < lista.length; i += 6) {
    resultado.push(lista.slice(i, i + 6));
  }
  return resultado;
}


  const tablero= dividirEnGrupos(casillas)



  const columnas = tablero[0]?.length ?? 0;

  const [visibles,setVisibles] = useState([
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
    ])
    


  return (
    <div
      className="tablero"
      style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
    >
      {tablero.map((fila, i) =>
        fila.map((casilla, j) => (
          <Casilla
            key={`${i}-${j}`}
            casilla={casilla}
            se_ve={visibles[i][j]}
            onClick={paraCasillas}
          />
        ))
      )}
    </div>
  );
}