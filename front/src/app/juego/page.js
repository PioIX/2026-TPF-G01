"use client"

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";

export default function JuegoPage() {
    const { socket, isConnected } = useSocket();
    const [casillas, setCasillas] = useState([])
    const [empezado, setEmpezado] = useState(false)

    useEffect(() => {
        if (!socket){return}; 
        if (!empezado){
            socket.emit("inicioJuego", { categoria: "actores" });
            setEmpezado(true)
        }
    }, [socket]);


    useEffect(() => {
        if (!socket) return;
        socket.on("tablero", (data) => {
            console.log("aa",data)
            setCasillas(data.personajes)
        })

    }, [socket]); // Array vacío
    
    return (

        <>
            <Tablero casillas={casillas}></Tablero>
            <div id="preguntas">
                <input></input>
                <div id="respuestas">
                    <Boton></Boton>
                    <Boton></Boton>
                </div>
            </div>
        </>

    )

}

