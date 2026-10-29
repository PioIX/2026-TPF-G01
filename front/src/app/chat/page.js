"use client";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/app/hooks/useSocket";
import styles from "./page.module.css";

// Datos del chat: cambialos por los de tu app (ej: el usuario logueado)
const USUARIO = "Invitado";
const SALA = "general";

export default function ChatPage() {
  const { socket } = useSocket(); // conexión WebSocket con el backend (puerto 4000)
  const [mensaje, setMensaje] = useState("");   // texto del input
  const [mensajes, setMensajes] = useState([]); // historial + mensajes en vivo
  const finalRef = useRef(null);  // marca para el scroll automático
  const unidoRef = useRef(false); // para unirse a la sala una sola vez

  // 1) Escuchar lo que manda el backend
  useEffect(() => {
    if (!socket) return;

    // Historial de la sala: llega una sola vez, al entrar (joinRoom)
    const onHistory = (data) => setMensajes(data);

    // Mensaje nuevo en vivo: le llega a todos los sockets de la sala
    const onNewMessage = (data) => setMensajes((prev) => [...prev, data.message]);

    socket.on("chat-history", onHistory);
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("chat-history", onHistory);
      socket.off("newMessage", onNewMessage);
    };
  }, [socket]);

  // 2) Entrar a la sala una sola vez
  useEffect(() => {
    if (!socket || unidoRef.current) return;
    unidoRef.current = true;
    socket.emit("joinRoom", { room: SALA, user: USUARIO });
  }, [socket]);

  // 3) Scroll al último mensaje
  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 4) Botón de mandar: emite sendMessage y el backend se lo pasa al otro socket
  function enviar() {
    if (!mensaje.trim()) return;
    socket.emit("sendMessage", { message: mensaje, user: USUARIO, id: socket.id });
    setMensaje("");
  }

  return (
    <div className={styles.chat}>
      <div className={styles.mensajes}>
        {mensajes.map((m, i) => (
          <p key={i} className={m.id === socket.id ? styles.mio : styles.otro}>
            <b>{m.id === socket.id ? "Vos" : m.user}: </b>
            {m.message}
          </p>
        ))}
        <div ref={finalRef} />
      </div>

      {/* Input y botón directo en la página (NO son componentes aparte) */}
      <input
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") enviar();
        }}
        placeholder="Escribí un mensaje..."
      />
      <button onClick={enviar}>Enviar</button>
    </div>
  );
}