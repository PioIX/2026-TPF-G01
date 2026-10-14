import Casilla from "./casilla";
import { useState } from "react";

export default function Tablero({ casillas }) {
  const columnas = casillas[0]?.length ?? 0;

    const [visibles,setVisibles] = useState([
        [true,true,true,true,true],
        [true,true,true,true,true],
        [true,true,true,true,true],
        [true,true,true,true,true],
    ])
    
    const alternar = (i, j) => {
    setVisibles((prev) =>
      prev.map((fila, y) =>
        y === i ? fila.map((valor, x) => (x === j ? !valor : valor)) : fila
      )
    );
  };

  return (
    <div
      className="tablero"
      style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}
    >
      {casillas.map((fila, i) =>
        fila.map((casilla, j) => (
          <Casilla
            key={`${i}-${j}`}
            casilla={casilla}
            se_ve={visibles[i][j]}
            onClick={() => alternar(i, j)}
          />
        ))
      )}
    </div>
  );
}