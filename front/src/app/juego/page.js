"use client"

import { use, useEffect, useState } from "react";
import Boton from "@/components/Boton";
import { useSearchParams } from "next/navigation";
import Tablero from "@/components/Tablero";

export default function JuegoPage() {


const [tablaCasillas,setTablaCasillas] = useState([])
const [casillas,setCasillas] = useState([])

useEffect(() => {

fetch(`http://localhost:4000/personajes?categoria=actores`)
.then(response => response.json())
.then(data => {
    setCasillas(data.personajes) 
})



}, []); // Array vacío

return(

    <>
    <Tablero casillas={casillas}></Tablero>
     
    </>

)

}

