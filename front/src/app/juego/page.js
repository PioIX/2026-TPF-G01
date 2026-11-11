"use client"

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";

export default function JuegoPage() {
    const { socket } = useSocket();
    const [sala, setSala] = useState("");
    const [casillas, setCasillas] = useState([]);
    const [estado, setEstado] = useState("preguntar");
    const [pregunta, setPregunta] = useState("");
    const [chat, setChat] = useState([]);
    const [paraResponder, setParaResponder] = useState("");
    const [cantPreguntas,setCantpreguntas] = useState(0)
    const [casillaElegida,setCasillaElegida] = useState("")
    const [visibles,setVisibles] = useState([
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
        [true,true,true,true,true,true],
    ])

    const alternar = (i, j) => {
        if (casillaElegida===""){
            setCasillaElegida(casillas[i,j])
        }
    setVisibles((prev) =>
      prev.map((fila, y) =>
        y === i ? fila.map((valor, x) => (x === j ? !valor : valor)) : fila
      )
    );

  };

    useEffect(() => {
        if (!socket) return;

        // Código de la sala desde la URL (?room=...)
        const room = new URLSearchParams(window.location.search).get("room");

        if (!room) {
            console.log("No se encontro el codigo de la sala");
            return;
        }

        setSala(room);

        const unirse = () => {
            console.log("Entrando a la sala:", room);
            socket.emit("joinRoom", { room });
        };

        const onTablero = (data) => {
            console.log("tablero recibido:", data);
            setCasillas(data.personajes);
        };

        const onPregunta = (data) => {
            console.log("pregunta recibida");
            setChat((prev) => [...prev, data]);
            setParaResponder(data.pregunta);
            setEstado("responder");
        };

        socket.on("connect", unirse); // vuelve a unirse si el socket se reconecta
        socket.on("tablero", onTablero);
        socket.on("pregunta", onPregunta);

        if (socket.connected) unirse();

        return () => {
            socket.off("connect", unirse);
            socket.off("tablero", onTablero);
            socket.off("pregunta", onPregunta);
        };
    }, [socket]);

    function actpregunta(event) {
        setPregunta(event.target.value);
    }

    function enviar() {
        const texto = pregunta.trim();
        if (texto.length === 0 || texto.length > 120) return;

        socket.emit("pregunta", { pregunta: texto });
        setPregunta("");
        setEstado("");
        setPregunta(pregunta+1)
    }

    function responder(rta) {
        setChat((prev) => [...prev, { pregunta: paraResponder, respuesta: rta }]);
        socket.emit("respuesta", { respuesta: rta });
        setEstado("");
    }

    return (
        <div id="juego">
            <div id="arrba">
                <h2 id="sala">sala {sala}</h2>
                <h1>Adivinalichi</h1>
                {/* TEMPORAL: solo para pruebas */}
                <Boton onClick={() => socket.emit("inicioJuego", { categoria: "futbolistas" })}>
                    empezar
                </Boton>
            </div>

            <Tablero casillas={casillas} casillaElegida={casillaElegida} elegir={setCasillaElegida}></Tablero>

            <div id="derecha">
                <div id="personaje">
                    <img alt="casilla elegida" src={undefined}></img>
                    <p>pj</p>
                </div>

                <div id="chat">
                    {chat.map((msg, i) => (
                        <p key={i}>
                            {msg.pregunta}
                            {msg.respuesta !== undefined && (msg.respuesta ? " - SÍ" : " - NO")}
                        </p>
                    ))}
                </div>

                {estado === "preguntar" && (
                    <div id="pregunta">
                        <input
                            placeholder="Escriba su pregunta"
                            value={pregunta}
                            onChange={actpregunta}
                        ></input>
                        <Boton id="enviar" onClick={enviar}>Enviar</Boton>
                        {pregunta.length > 120 && <p>pregunta muy larga</p>}
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