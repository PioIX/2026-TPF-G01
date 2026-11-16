"use client";

import { useEffect, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";

export default function JuegoPage() {
  const { socket } = useSocket();
  const [sala, setSala] = useState("");
  const [casillas, setCasillas] = useState([]);
  const [estado, setEstado] = useState("elegir");
  const [pregunta, setPregunta] = useState("");
  const [chat, setChat] = useState([]);
  const [paraResponder, setParaResponder] = useState("");
  const [cantPreguntas, setCantPreguntas] = useState(0);
  const [casillaElegida, setCasillaElegida] = useState("");




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
      socket.emit("joinRoom", { room });
      socket.emit("inicioJuego", { categoria: "futbolistas" });
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

    const onEmpezar = (data) => {
      setEstado(data.turno ? "preguntar" : "esperar");
    };

    const onDescartado = (data) => {
      setEstado("preguntar")
    }

    const onRespuesta = (data) => {
      console.log("respuesta recibida");
      setChat((prev) => [...prev.slice(0, -1), data]);
      setEstado("descartar")
    }

    const onCasillaAdivinada= (data)=>{
      if (data.casilla==casillaElegida){
        socket.emit("resultadoFinal",{result:true});
        setChat((prev) => [prev, {pregunta:"has perdido la partida"}]);
      }else{
        socket.emit("resultadoFinal",{result:false})
        setChat((prev) => [prev, {pregunta:"has ganado la partida"}]);
      }
    }

    const onResultadoFinal= (data)=>{
      setChat((prev)=>[prev, data.result ?{pregunta:"has ganado la partida"}:{pregunta:"has perdido la partida"} ])
    }

    socket.on("connect", unirse); // vuelve a unirse si el socket se reconecta
    socket.on("tablero", onTablero);
    socket.on("pregunta", onPregunta);
    socket.on("empezar", onEmpezar);
    socket.on("respuesta", onRespuesta);
    socket.on("descartado", onDescartado)
    socket.on("casillaAdivinada", onCasillaAdivinada);
    socket.on("resultadoFinal",onResultadoFinal)

    if (socket.connected) unirse();

    return () => {
      socket.off("connect", unirse);
      socket.off("tablero", onTablero);
      socket.off("pregunta", onPregunta);
      socket.off("empezar", onEmpezar);
      socket.off("respuesta", onRespuesta);
      socket.off("descartado", onDescartado)
      socket.off("casillaAdivinada", onCasillaAdivinada);
      socket.off("resultadoFinal",onResultadoFinal)
    };
  }, [socket]);


  const elegirCasilla = (casilla) => {
    if (estado == "adivinar") {
      socket.emit("casillaAdivinada", { casilla: casilla })
    } else{
    setCasillaElegida(casilla);
    setEstado("");

    socket.emit("casillaElegida", {});
    }

  };

  function actpregunta(event) {
    setPregunta(event.target.value);
  }

  function enviar() {
    const texto = pregunta.trim();
    if (texto.length === 0 || texto.length > 120) return;

    setChat((prev) => [...prev, { pregunta: texto }]);

    socket.emit("pregunta", { pregunta: texto });

    setPregunta("");
    setEstado("");
    setCantPreguntas(cantPreguntas + 1);
  }

  function responder(rta) {
    setChat((prev) => [...prev.slice(0, -1), { pregunta: paraResponder, respuesta: rta }]);
    socket.emit("respuesta", { pregunta: paraResponder, respuesta: rta });
    setEstado("");
  }

  function terminarDescartar() {
    setEstado("esperar")
    socket.emit("descartado")
  }

  return (
    <div id="juego">
      <div id="arrba">
        <h2 id="cantPreguntas">cantidad de preguntas {cantPreguntas}</h2>
        <h1>Adivinalichi</h1>

        {(estado === "preguntar" || estado==="adivinar") && 
        <Boton id="adivinar" 
          onClick={() => {
            if(estado==="adivinar"){
              setEstado("preguntar");
              return
            }
            setEstado("adivinar")
          }}
        >
          Adivinar
        </Boton>}

      </div>

      {/*EL TABLERO */}
      <Tablero
        casillas={casillas}
        casillaElegida={casillaElegida}
        elegir={elegirCasilla}
        adivinar={estado=="adivinar"}
      ></Tablero>

      <div id="derecha">
        <div id="personaje">
          <img alt="casilla elegida" src={casillaElegida.img}></img>
          <p>{casillaElegida.nombre_casilla} </p>
        </div>

        <div id="chat">
          {chat.map((msg, i) => (
            <p key={i}>
              {msg.pregunta}
              {msg.respuesta !== undefined &&
                (msg.respuesta ? " - SÍ" : " - NO")}
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
            <Boton id="enviar" onClick={enviar}>
              Enviar
            </Boton>
            {pregunta.length > 120 && <p>pregunta muy larga</p>}
          </div>
        )}

        {estado === "elegir" && <h2>Elige una casilla antes de empezar</h2>}

        {estado === "responder" && (
          <div id="respuesta">
            <h3>{paraResponder}</h3>
            <div className="botones">
              <Boton onClick={() => responder(true)}>SÍ</Boton>
              <Boton onClick={() => responder(false)}>NO</Boton>
            </div>
          </div>
        )}
        {estado === "esperar" && <h2>Esperando al otro jugador...</h2>}
        {estado === "descartar" && (
          <>
            <h3>Descarta casillas</h3>
            <Boton onClick={() => terminarDescartar()}>Listo</Boton>

          </>
        )}
      </div>
    </div>
  );
}
