"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export function useSocket() {
  const [conexion, setConexion] = useState(null);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:4000");
    }

    setConexion(socket);
  }, []);

  return { socket: conexion };
}