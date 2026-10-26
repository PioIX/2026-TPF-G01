"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import Message from "@/components/Message";
import Input from "@/components/Input";
import Boton from "@/components/Boton";

function ChatInterno() {
  const searchParams = useSearchParams();

  const idPartida = searchParams.get("id_partida") || "1";
  const nombre = searchParams.get("nombre") || "Jugador";

  const { socket } = useSocket();

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const finRef = useRef(null);

  // Me uno al chat de la partida y recibo los mensajes
  useEffect(() => {
    if (!socket) return;

    const unirse = () => {
      socket.emit("unirseChat", Number(idPartida));
    };

    const recibir = (mensaje) => {
      if (String(mensaje.id_partida) === String(idPartida)) {
        setMensajes((actuales) => [...actuales, mensaje]);
      }
    };

    if (socket.connected) unirse();

    socket.on("connect", unirse);
    socket.on("nuevoMensaje", recibir);

    return () => {
      socket.emit("salirChat", Number(idPartida));
      socket.off("connect", unirse);
      socket.off("nuevoMensaje", recibir);
    };
  }, [socket, idPartida]);

  // Bajar hasta el último mensaje
  useEffect(() => {
    if (finRef.current) {
      finRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes]);

  // Enviar mensaje
  function enviar() {
    if (!socket || !socket.connected || texto.trim() === "") return;

    socket.emit("enviarMensaje", {
      id_partida: Number(idPartida),
      nombre_usuario: nombre,
      texto: texto.trim(),
    });

    setTexto("");
  }

  // Enviar con Enter
  function teclado(event) {
    if (event.key === "Enter") enviar();
  }

  return (
    <div className="pantalla-chat">
      <header className="chat-header">
        <h2>Chat de la partida {idPartida}</h2>
        <p>{nombre}</p>
      </header>

      <div className="mensajes">
        {mensajes.map((m, i) => (
          <Message
            key={i}
            texto={m.texto}
            nombre={m.nombre}
            fecha={m.fecha}
            esMio={m.nombre === nombre}
          />
        ))}

        <div ref={finRef}></div>
      </div>

      <div className="barra-entrada">
        <Input
          tipo="text"
          placeholder="Escribí un mensaje"
          valor={texto}
          onChange={setTexto}
          onKeyDown={teclado}
        />

        <Boton onClick={enviar} texto="Enviar" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <ChatInterno />
    </Suspense>
  );
}