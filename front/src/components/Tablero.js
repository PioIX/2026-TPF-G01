"use client";

import Casilla from "./casilla";
import { useEffect, useState } from "react";

export default function Tablero({ casillas, casillaElegida, elegir }) {
  const [visibles, setVisibles] = useState([
    [true, true, true, true, true, true],
    [true, true, true, true, true, true],
    [true, true, true, true, true, true],
    [true, true, true, true, true, true],
  ]);

  function dividirEnGrupos(lista) {
    const resultado = [];
    for (let i = 0; i < lista.length; i += 6) {
      resultado.push(lista.slice(i, i + 6));
    }
    return resultado;
  }

  const tablero = dividirEnGrupos(casillas);

  const alternar = (clave) => {
    setVisibles((prev) => ({ ...prev, [clave]: prev[clave] === false }));
  };

  return (
    <div className="tablero" style={{ gridTemplateColumns: `repeat(6, 1fr)` }}>
      {tablero.map((fila, i) =>
        fila.map((casilla, j) => {
          const clave = `${i}-${j}`;
          return (
            <Casilla
              key={clave}
              casilla={casilla}
              se_ve={visibles[clave] !== false}
              onClick={() => {
                if (casillaElegida === "") elegir(casilla);
                else alternar(clave);
              }}
            />
          );
        })
      )}
    </div>
  );
}
