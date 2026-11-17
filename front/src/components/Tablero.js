"use client";

import { useState } from "react";
import Casilla from "./casilla";
import styles from "@/app/juego/page.module.css";

const COLUMNAS = 6;

function dividirEnGrupos(lista, tamano) {
  const resultado = [];
  for (let i = 0; i < lista.length; i += tamano) {
    resultado.push(lista.slice(i, i + tamano));
  }
  return resultado;
}

export default function Tablero({ casillas, casillaElegida, elegir, adivinar }) {
  // { "fila-columna": false } -> casilla descartada (dada vuelta)
  const [visibles, setVisibles] = useState({});

  const tablero = dividirEnGrupos(casillas, COLUMNAS);

  const alternar = (clave) => {
    setVisibles((prev) => ({ ...prev, [clave]: prev[clave] === false }));
  };

  return (
    <div className={`${styles.tablero} ${adivinar ? styles.adivinando : ""}`}>
      {tablero.map((fila, i) =>
        fila.map((casilla, j) => {
          const clave = `${i}-${j}`;
          return (
            <Casilla
              key={clave}
              casilla={casilla}
              se_ve={visibles[clave] !== false}
              onClick={() => {
                // sin casilla elegida, o adivinando: el click elige
                if (!casillaElegida || adivinar) elegir(casilla);
                else alternar(clave);
              }}
            />
          );
        })
      )}
    </div>
  );
}