"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { API_URL } from "@/app/config";

export default function HistorialPage() {

    const [partidas, setPartidas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) {
            setMensaje("No se encontró el usuario");
            setCargando(false);
            return;
        }

        fetch(`${API_URL}/partida/historial?id=` + id)
            .then(res => res.json())
            .then(data => {
                setPartidas(data);
                setCargando(false);
            })
            .catch(error => {
                console.log(error);
                setMensaje("Error al cargar el historial");
                setCargando(false);
            });
    }, []);

    return (
        <main className={styles.contenedor}>
            {cargando ? (
                <p>Cargando partidas...</p>
            ) : mensaje ? (
                <p>{mensaje}</p>
            ) : (
                <div className={styles.tablaContenedor}>
                    <table className={styles.tabla}>
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Fecha</th>
                                <th>Preguntas</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {partidas.length > 0 ? (
                                partidas.map((partida, index) => (
                                    <tr key={index}>
                                        <td>{partida.usuario}</td>
                                        <td>{String(partida.fecha).slice(0, 10)}</td>
                                        <td>{partida.cant_pregunta}</td>
                                        <td>
                                            {partida.gano == 1 ? "Ganó" : "Perdió"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No hay partidas registradas.</td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            )}

            <Link href="/" className={styles.volver}>
                ← Volver al menú
            </Link>
        </main>
    );
}
