"use client"

import { useEffect, useRef, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";

export default function JuegoPage() {
    const { socket, isConnected } = useSocket();
    const [casillas, setCasillas] = useState([]);
    const juegoIniciado = useRef(false);
    const [estado,setEstado] = useState("preguntar")
    const [pregunta,setPregunta] = useState("")
    const [chat,setChat] = useState([])
    const [paraResponder,setParaResponder]=useState("")

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
           /* socket.emit("inicioJuego", { categoria: "futbolistas" }); */
        }

        const onPregunta = (data)=>{
            console.log("pregunta recibida")
            setChat((prev) => [...prev, data]);
            setParaResponder(data.pregunta)
            setEstado("responder")
        }

        socket.on("pregunta",onPregunta)

        return () => {
            socket.off("tablero", onTablero);
            socket.off("pregunta", onPregunta);
        };
    }, [socket]);

    function actpregunta(event){
        setPregunta(event.target.value)
    }

    function enviar(){
        if(pregunta.length>120){return}
        socket.emit("pregunta",{pregunta:pregunta})
        setEstado("")
    }

    function responder(rta){
        setChat((prev) => [...prev, {pregunta:paraResponder.pregunta,respuesta:rta}]);
        socket.emit("respuesta",{})
    }
return (
    <div id="juego">
        <div id="arrba">
            <h2 id="sala">sala</h2>
            <h1>Adivinalichi</h1>
            <Boton onClick={()=>{socket.emit("inicioJuego", { categoria: "futbolistas" });}}> empezar</Boton>
        </div>
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
                    <input placeholder="Escriba su pregunta" onChange={actpregunta}></input>
                    <Boton id="enviar" onClick={enviar}></Boton>
                    {pregunta.length>120 && <p>pregunta muy larga</p>}
                </div>
            )}

            {estado === "responder" && (
            <div id="respuesta">
                <h3>{paraResponder}</h3>
                <div className="botones">
                <Boton onClick={() => responder(true)}>SÍ</Boton>
                <Boton onClick={() => responder(false)}>NO</Boton>
                </div>
            </div>
            )}
        </div>
    </div>
);
}