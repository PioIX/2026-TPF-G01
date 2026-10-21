"use client"

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";

export default function JuegoPage() {


const [casillas,setCasillas] = useState([])

useEffect(() => {

fetch(`http://localhost:4000/personajes?categoria=actores`)
.then(response => response.json())
.then(data => {
    setCasillas(data.personajes) 
})



}, []); // Array vacío
console.log(casillas[0])
return(

    <>
    <Tablero casillas={casillas}></Tablero>
    </>

)

}

