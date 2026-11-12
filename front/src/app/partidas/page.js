
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/app/hooks/useSocket";
import styles from "./page.module.css";

export default function PartidasPage() {

    const { socket } = useSocket();
    const router = useRouter();

    const [codigo, setCodigo] = useState("");
    const [miCodigo, setMiCodigo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [conectado, setConectado] = useState(false);
    useEffect(() => {

        if (!socket) return;

        const conectar = () => {
            setConectado(true);
        };

        const desconectar = () => {
            setConectado(false);
        };

        const salaCreada = (data) => {
            setMiCodigo(data.room);
            setMensaje("Esperando al otro jugador...");
        };

        const partidaLista = (data) => {
            setMensaje("¡Partida encontrada!");

            router.push("/juego?room=" + data.room);
        };

        const errorSala = (mensaje) => {
            setMensaje(mensaje);
        };

        if (socket.connected) {
            setConectado(true);
        }

        socket.on("connect", conectar);
        socket.on("disconnect", desconectar);

        socket.on("salaCreada", salaCreada);
        socket.on("partidaLista", partidaLista);
        socket.on("errorSala", errorSala);

        return () => {

            socket.off("connect", conectar);
            socket.off("disconnect", desconectar);

            socket.off("salaCreada", salaCreada);
            socket.off("partidaLista", partidaLista);
            socket.off("errorSala", errorSala);

        };

    }, [socket, router]);


    // CREAR UNA SALA
    const crearSala = () => {

        if (!socket || !socket.connected) {
            setMensaje("No hay conexión con el servidor");
            return;
        }

        setMensaje("Creando sala...");
        socket.emit("crearSala");

    };


    // UNIRSE A UNA SALA
    const unirseSala = () => {

        if (!socket || !socket.connected) {
            setMensaje("No hay conexión con el servidor");
            return;
        }

        if (codigo.trim() === "") {
            setMensaje("Ingresá un código");
            return;
        }
        

        setMensaje("Buscando sala...");
        socket.emit("joinRoom", {
            room: codigo.trim().toUpperCase()
        });
        
    };


    return (

        <main className={styles.page}>

            <div className={styles.main}>

                <h1>Adivinalichi</h1>

                <p className={styles.descripcion}>
                    ¡Elegí cómo querés jugar!
                </p>

                <div className={styles.contenedor}>

                    {/* CREAR SALA */}

                    <div className={styles.tarjeta}>

                        <div className={styles.icono}>🎮</div>

                        <h2>Crear partida</h2>

                        <p>
                            Creá una sala y compartí el código
                            con otro jugador.
                        </p>

                        <button
                            className={styles.boton}
                            onClick={crearSala}
                            disabled={!conectado || miCodigo !== ""}
                        >
                            Crear sala
                        </button>

                        {miCodigo && (
                            <>
                                <p>Tu código de partida:</p>

                                <div className={styles.codigo}>
                                    {miCodigo}
                                </div>

                                <p>
                                    Compartilo con el otro jugador.
                                </p>
                            </>
                        )}

                    </div>


                    {/* UNIRSE A UNA SALA */}

                    <div className={styles.tarjeta}>

                        <div className={styles.icono}>👥</div>

                        <h2>Unirse a partida</h2>

                        <p>
                            ¿Tenés un código? Ingresalo
                            para jugar con otro usuario.
                        </p>

                        <input
                            className={styles.input}
                            type="text"
                            placeholder="CÓDIGO"
                            value={codigo}
                            maxLength={6}
                            onChange={(e) =>
                                setCodigo(e.target.value.toUpperCase())
                            }
                        />

                        <button
                            className={styles.boton}
                            onClick={unirseSala}
                            disabled={!conectado}
                        >
                            Unirse
                        </button>

                    </div>

                </div>

                <p className={styles.mensaje}>
                    {mensaje}
                </p>

            </div>

        </main>

    );

}
