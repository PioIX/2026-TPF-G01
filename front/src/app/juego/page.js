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

        const onTablero = (data) => {
            console.log("tablero recibido:", data);
            setCasillas(data.personajes);
        };
        socket.on("tablero", onTablero);

        // Solo emito una vez, aunque el efecto se re-ejecute
        if (!juegoIniciado.current) {
            juegoIniciado.current = true;
            socket.emit("joinRoom",{room:"pio"})
            socket.emit("inicioJuego", { categoria: "actores" });
        }

        return () => {
            socket.off("tablero", onTablero);
        };
    }, [socket]);

return (
    <div id="juego">
        <Tablero casillas={casillas}></Tablero>

        <div id="derecha">
            <div id="personaje">
                <img alt="casilla elegida" src=""></img>
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