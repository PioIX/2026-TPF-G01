"use client"

import { useEffect, useRef, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";

export default function JuegoPage() {
    const { socket, isConnected } = useSocket();
    const [casillas, setCasillas] = useState([]);
    const juegoIniciado = useRef(false);
    const [estado,setEstado] = useState("responder")

    
useEffect(() => {
    if (!socket) return;

    // Obtener el codigo de la sala desde la URL
    const room = new URLSearchParams(window.location.search).get("room");

    if (!room) {
        console.log("No se encontro el codigo de la sala");
        return;
    }

    const onTablero = (data) => {
        console.log("tablero recibido:", data);
        setCasillas(data.personajes);
    };

    socket.on("tablero", onTablero);

    console.log("Entrando a la sala:", room);

    socket.emit("joinRoom", { room: room });

    socket.emit("inicioJuego", { categoria: "actores" });

    return () => {
        socket.off("tablero", onTablero);
    };

}, [socket]);


return (
    <div id="juego">
        <Tablero casillas={casillas}></Tablero>

        <div id="derecha">
            <div id="personaje">
                <img alt="casilla elegida" src={undefined}></img>
                <p>pj</p>
            </div>

            <div id="chat">

            </div>

            {estado === "preguntar" && (
                <div id="pregunta">
                    <input placeholder="Escriba su pregunta"></input>
                    <Boton id="enviar"></Boton>
                </div>
            )}

            {estado === "responder" && (
                <div id="respuesta">
                    <Boton onClick={() => responder(true)}></Boton>
                    <Boton onClick={() => responder(false)}></Boton>
                </div>
            )}
        </div>
    </div>
);
}