"use client";

import { useEffect, useRef, useState } from "react";
import Boton from "@/components/Boton";
import Tablero from "@/components/Tablero";
import useSocket from "@/app/hooks/useSocket";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/config";



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
  const [resultado, setResultado] = useState(null);
  const [casillaOtro, setCasillaOtro] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const router = useRouter();
  const [id, setId] = useState(null);

  // ref para que los listeners del socket vean siempre la casilla actual
  const casillaRef = useRef("");
  const chatRef = useRef(null);

  

  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  // crear un delay de 2 segundos para mostrar el modal
  useEffect(() => {
    if (estado !== "fin") return;

    const timer = setTimeout(() => setMostrarModal(true), 2000);
    return () => clearTimeout(timer); // limpia si el componente se desmonta
  }, [estado]);

  // Baja el chat hasta el último mensaje
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

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

    // El otro jugador me hizo una pregunta
    const onPregunta = (data) => {
      console.log("pregunta recibida");
      setChat((prev) => [...prev, { ...data, propia: false }]);
      setParaResponder(data.pregunta);
      setEstado("responder");
    };

    const onEmpezar = (data) => {
      setEstado(data.turno ? "preguntar" : "esperar");
    };

    const onDescartado = () => {
      setEstado("preguntar");
    };

    // Me respondieron mi pregunta: se completa el último mensaje del chat
    const onRespuesta = (data) => {
      console.log("respuesta recibida");
      setChat((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], ...data, propia: true },
      ]);
      setEstado("descartar");
    };

    // El otro jugador intentó adivinar mi personaje
    const onCasillaAdivinada = (data) => {
      const acerto =
        data.casillaElegida.nombre_casilla === casillaRef.current.nombre_casilla;

      socket.emit("resultadoFinal", { result: acerto, casillaPropia: casillaRef.current });
      setResultado(!acerto);
      setCasillaOtro(data.casillaPropia)

      setChat((prev) => [
        ...prev,
        {
          sistema: true,
          gano: !acerto,
          pregunta: acerto ? "has perdido la partida" : "has ganado la partida",
        },
      ]);
      setEstado("fin");
    };

    // Resultado de mi intento de adivinar
    const onResultadoFinal = (data) => {
      setChat((prev) => [
        ...prev,
        {
          sistema: true,
          gano: data.result,
          pregunta: data.result
            ? "has ganado la partida"
            : "has perdido la partida",
        },
      ]);
      setResultado(data.result);
      setEstado("fin");
      setCasillaOtro(data.casillaPropia)
    };

    socket.on("connect", unirse); // vuelve a unirse si el socket se reconecta
    socket.on("tablero", onTablero);
    socket.on("pregunta", onPregunta);
    socket.on("empezar", onEmpezar);
    socket.on("respuesta", onRespuesta);
    socket.on("descartado", onDescartado);
    socket.on("casillaAdivinada", onCasillaAdivinada);
    socket.on("resultadoFinal", onResultadoFinal);

    if (socket.connected) unirse();

    return () => {
      socket.off("connect", unirse);
      socket.off("tablero", onTablero);
      socket.off("pregunta", onPregunta);
      socket.off("empezar", onEmpezar);
      socket.off("respuesta", onRespuesta);
      socket.off("descartado", onDescartado);
      socket.off("casillaAdivinada", onCasillaAdivinada);
      socket.off("resultadoFinal", onResultadoFinal);
    };
  }, [socket]);

  const elegirCasilla = (casilla) => {
    if (estado === "adivinar") {
      socket.emit("casillaAdivinada", { casillaElegida: casilla, casillaPropia: casillaRef.current });
    } else {
      setCasillaElegida(casilla);
      casillaRef.current = casilla;
      setEstado("esperar");
      socket.emit("casillaElegida", {});
    }
  };

  function actpregunta(event) {
    setPregunta(event.target.value);
  }

  function enviar() {
    const texto = pregunta.trim();
    if (texto.length === 0 || texto.length > 120) return;

    setChat((prev) => [...prev, { pregunta: texto, propia: true }]);
    socket.emit("pregunta", { pregunta: texto });

    setPregunta("");
    setEstado("esperar");
    setCantPreguntas((prev) => prev + 1);
  }

  function responder(rta) {
    setChat((prev) => [
      ...prev.slice(0, -1),
      { pregunta: paraResponder, respuesta: rta, propia: false },
    ]);
    socket.emit("respuesta", { pregunta: paraResponder, respuesta: rta });
    setEstado("esperar");
  }

  function terminarDescartar() {
    setEstado("esperar");
    socket.emit("descartado", {});
  }

  function alternarAdivinar() {
    setEstado(estado === "adivinar" ? "preguntar" : "adivinar");
  }

async function terminarPartida() {
  const fechaSQL = new Date().toISOString().slice(0, 19).replace("T", " ");

  const partida = {
    gano: resultado,
    cant_pregunta: cantPreguntas,
    fecha: fechaSQL,
    id_usuario: id,
  };

  try {
    const res = await fetch(`${API_URL}/partida`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partida),
    });

    if (!res.ok) throw new Error("Error " + res.status);
    console.log("se guardo la partida");
  } catch (error) {
    console.error("No se pudo guardar la partida:", error);
  }
  socket.emit("terminarPartida");
  router.push("/?id=" + id);
}

  return (
    <div className={styles.juego}>
      {/* ENCABEZADO */}
      <div className={styles.arriba}>
        <h2 className={styles.contador}>
          cantidad de preguntas {cantPreguntas}
        </h2>
        <h1>Adivinalichi</h1>

        {(estado === "preguntar" || estado === "adivinar") && (
          <Boton onClick={alternarAdivinar}>
            {estado === "adivinar" ? "Cancelar" : "Adivinar"}
          </Boton>
        )}
      </div>

      {/* TABLERO */}
      <Tablero
        casillas={casillas}
        casillaElegida={casillaElegida}
        elegir={elegirCasilla}
        adivinar={estado === "adivinar"}
      />

      {/* PANEL DERECHO */}
      <div className={styles.derecha}>
        <div className={styles.personaje}>
          {casillaElegida ? (
            <img alt="casilla elegida" src={casillaElegida.img} />
          ) : (
            <div className={styles.placeholder}>?</div>
          )}
          <p>{casillaElegida?.nombre_casilla ?? "Sin elegir"}</p>
        </div>

        <div className={styles.chat} ref={chatRef}>
          {chat.map((msg, i) => {
            const clases = [styles.mensaje];

            if (msg.sistema) {
              clases.push(styles.sistema, msg.gano ? styles.si : styles.no);
            } else {
              clases.push(msg.propia ? styles.propia : styles.ajena);
              if (msg.respuesta === undefined) clases.push(styles.pendiente);
              else clases.push(msg.respuesta ? styles.si : styles.no);
            }

            return (
              <div key={i} className={clases.join(" ")}>
                {msg.pregunta}
                {msg.respuesta !== undefined && (
                  <span className={styles.etiqueta}>
                    {msg.respuesta ? "Sí" : "No"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {estado === "elegir" && (
          <div className={styles.aviso}>
            <h2>Elige una casilla antes de empezar</h2>
          </div>
        )}

        {estado === "preguntar" && (
          <div className={styles.pregunta}>
            <input
              placeholder="Escriba su pregunta"
              value={pregunta}
              onChange={actpregunta}
            />
            <Boton onClick={enviar}>Enviar</Boton>
            {pregunta.length > 120 && <p>pregunta muy larga</p>}
          </div>
        )}

        {estado === "responder" && (
          <div className={styles.respuesta}>
            <h3>{paraResponder}</h3>
            <div className={styles.botones}>
              <Boton onClick={() => responder(true)}>SÍ</Boton>
              <Boton onClick={() => responder(false)}>NO</Boton>
            </div>
          </div>
        )}

        {estado === "esperar" && (
          <div className={`${styles.aviso} ${styles.esperando}`}>
            <h2>Esperando al otro jugador...</h2>
          </div>
        )}

        {estado === "descartar" && (
          <div className={styles.aviso}>
            <h3>Descarta casillas</h3>
            <Boton onClick={terminarDescartar}>Listo</Boton>
          </div>
        )}
      </div>

      {estado === "fin" && mostrarModal && (
        <div className={styles.modalFondo}>
          {resultado &&
            Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                className={styles.confeti}
                style={{
                  left: `${(i * 37) % 100}%`,
                  background: ["#ffd23f", "#4be25d", "#1fa2ff", "#ff5c68"][i % 4],
                  animationDuration: `${2.5 + (i % 5) * 0.6}s`,
                  animationDelay: `${(i % 10) * 0.25}s`,
                }}
              />
            ))}

          <div
            className={`${styles.modal} ${resultado ? styles.modalGanaste : styles.modalPerdiste
              }`}
          >
            <div className={styles.modalEmoji}>{resultado ? "🏆" : "😢"}</div>
            <h2>{resultado ? "¡Ganaste!" : "Perdiste"}</h2>

            <div className={styles.modalPersonajes}>
              <div className={styles.modalPersonaje}>
                <span>Tu personaje</span>
                <img src={casillaElegida?.img} alt={casillaElegida?.nombre_casilla} />
                <strong>{casillaElegida?.nombre_casilla}</strong>
              </div>

              <div className={styles.modalVs}>VS</div>

              <div className={styles.modalPersonaje}>
                <span>Su personaje</span>
                <img src={casillaOtro?.img} alt={casillaOtro?.nombre_casilla} />
                <strong>{casillaOtro?.nombre_casilla}</strong>
              </div>
            </div>

            <div className={styles.modalStats}>
              <b>{cantPreguntas}</b>
              <small>preguntas realizadas</small>
            </div>

            <Boton onClick={() => terminarPartida()}>Volver al menú</Boton>
          </div>
        </div>
      )}
    </div>
  );
}