"use client"; 
import { useState, useEffect } from "react";
import { useSocket } from "@/app/hooks/useSocket"; 
import styles from "./Chat.module.css"; 


export default function Chat({ usuario = "Invitado", sala = "general" }) {
  const { socket } = useSocket();

  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);

  
  useEffect(() => {
    if (!socket) return;

    // Le avisa al backend que este usuario entra a la sala (evento joinRoom del apunte)
    socket.emit("joinRoom", { room: sala, user: usuario });

    // Queda escuchando el evento "newMessage": cuando el backend reenvía un mensaje
    // (de este socket o del otro), lo agrega al final de la lista de mensajes
    socket.on("newMessage", (data) => setMensajes((prev) => [...prev, data.message]));

    // Limpieza: si el componente se desmonta, deja de escuchar (evita mensajes duplicados)
    return () => socket.off("newMessage");
  }, [socket]); // Solo se vuelve a ejecutar si cambia el socket

  
  function enviar() {
    if (!mensaje.trim()) return; // Si el texto está vacío o son solo espacios, no envía nada

    // Manda el evento "sendMessage" al backend con el texto, el nombre y el id de ESTE socket.
    // El backend hace io.to(sala).emit("newMessage", ...) → le llega al OTRO socket y también a este
    socket.emit("sendMessage", { message: mensaje, user: usuario, id: socket.id });

    setMensaje(""); // Deja el input limpio para el próximo mensaje
  }

  return (
    <div className={styles.chat}>        {/* Contenedor / tarjeta del chat */}
      <div className={styles.mensajes}>  {/* Zona con scroll donde se dibujan los mensajes */}
        {/* Recorre la lista y dibuja un globo (<p>) por cada mensaje */}
        {mensajes.map((m, i) => (
          <p
            key={i} // Identificador de la lista para que React re-renderice bien
            // Si el id del mensaje es el de ESTE socket → es MÍO (verde, derecha);
            // si no → es del OTRO usuario (blanco, izquierda)
            className={m.id === socket.id ? styles.mio : styles.otro}
          >
            <b>{m.id === socket.id ? "Vos" : m.user}: </b> {/* Nombre del autor del mensaje */}
            {m.message} {/* Texto del mensaje */}
          </p>
        ))}
      </div>

      {/* Input controlado: lo que se escribe vive en el estado "mensaje" */}
      <input
        value={mensaje}                              // Muestra el valor actual del estado
        onChange={(e) => setMensaje(e.target.value)} // Cada tecla que tipeás actualiza el estado
        placeholder="Escribí un mensaje..."
      />

      {/* Al hacer clic ejecuta enviar(), que emite el evento hacia el otro socket */}
      <button onClick={enviar}>Enviar</button>
    </div>
  );
}