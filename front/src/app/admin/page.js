"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const URL = "http://localhost:4000";
const vacio = { nombre_casilla: "", img: "", tabla: "" };

export default function Admin() {
  const [modo, setModo] = useState("crear");
  const [idEditar, setIdEditar] = useState("");
  const [idEliminar, setIdEliminar] = useState("");
  const [form, setForm] = useState(vacio);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleEliminar() {
    if (!idEliminar) { alert("Ingresá un ID"); return; }
    await fetch(`${URL}/personajes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_casilla: Number(idEliminar) }),
    });
    alert("Personaje eliminado");
    setIdEliminar("");
  }

  async function handleGuardar() {
    if (!form.nombre_casilla || !form.img || !form.tabla) {
      alert("Rellene todos los campos");
      return;
    }
    if (modo == "editar" && !idEditar) {
      alert("Ingresá el ID a editar");
      return;
    }
    const datos = modo == "editar"
      ? { id_casilla: Number(idEditar), ...form }
      : form;

    await fetch(`${URL}/personajes`, {
      method: modo == "crear" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    alert(modo == "crear" ? "Personaje creado correctamente." : "Personaje editado correctamente.");
    setForm(vacio);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Panel de administración</h1>
        <p className={styles.descripcion}>Creá, editá o eliminá personajes del juego</p>

        <div className={styles.contenedor}>

          <div className={styles.tarjeta}>
            <span className={styles.icono}>✕</span>
            <h2>Eliminar personaje</h2>
            <input
              className={styles.input}
              type="number"
              placeholder="ID de la casilla"
              min="1"
              value={idEliminar}
              onChange={(e) => setIdEliminar(e.target.value)}
            />
            <button className={`${styles.boton} ${styles.botonEliminar}`} onClick={handleEliminar}>
              Eliminar
            </button>
          </div>

          <div className={styles.tarjeta}>
            <span className={styles.icono}>{modo == "crear" ? "⚡" : "✏️"}</span>
            <h2>{modo == "crear" ? "Crear personaje" : "Editar personaje"}</h2>

            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${modo == "crear" ? styles.activo : ""}`}
                onClick={() => setModo("crear")}
              >
                Crear
              </button>
              <button
                className={`${styles.toggleBtn} ${modo == "editar" ? styles.activo : ""}`}
                onClick={() => setModo("editar")}
              >
                Editar
              </button>
            </div>

            {modo == "editar" && (
              <input
                className={styles.input}
                type="number"
                placeholder="ID de la casilla"
                min="1"
                value={idEditar}
                onChange={(e) => setIdEditar(e.target.value)}
              />
            )}

            <input className={styles.input} type="text" name="nombre_casilla" placeholder="Nombre" value={form.nombre_casilla} onChange={handleChange} />
            <input className={styles.input} type="text" name="img" placeholder="URL de imagen" value={form.img} onChange={handleChange} />
            <input className={styles.input} type="text" name="tabla" placeholder="Tabla" value={form.tabla} onChange={handleChange} />

            <button className={styles.boton} onClick={handleGuardar}>Confirmar</button>
          </div>

        </div>

        <Link href="/" className={styles.volver}>← Volver al menú</Link>
      </main>
    </div>
  );
}