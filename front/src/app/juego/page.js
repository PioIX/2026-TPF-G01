"use client"

import { use, useEffect, useState } from "react";
import Boton from "@/components/Boton";
import { useSearchParams } from "next/navigation";
export default function JuegoPage() {

const searchParams = useSearchParams();
const categoria = searchParams.get("categoria")

const [tablaVista,setTablaVista] = useState([
    [true,true,true,true,true],
    [true,true,true,true,true],
    [true,true,true,true,true],
    [true,true,true,true,true],
])

const [tablaCasillas,setTablaCasillas] = useState([])

useEffect(() => {

fetch(`http://localhost:4000/personajes?categoria=${categoria}`)
.then(response => response.json())
.then(data => {
    let resultado=[]
    for (let i = 0; i < data.length; i += 5) {
    resultado.push(lista.slice(i, i + 5));
  }
    setTablaCasillas(resultado)
});

}, []); // Array vacío



}
