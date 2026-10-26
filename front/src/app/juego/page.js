"use client"

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import { useSocket } from "../hooks/useSocket"
import { Socket } from "socket.io-client";

export default function JuegoPage() {
    const { socket, isConnected } = useSocket();
    const [casillas, setCasillas] = useState([])

    useEffect(() => {
        if (!socket)return; 
            socket.emit("inicioJuego", { categoria: "actores" });
    }, []);


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

