const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");
const { realizarQuery } = require("./modulos/mysql");

const app = express();
const PORT = process.env.PORT || 4000;
const crypto = require("crypto");
const turnos = new Map();
const salas = {}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true
}));

const server = app.listen(PORT, () => {
    console.log(`Servidor NodeJS corriendo en http://localhost:${PORT}/`);
});

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});


const sessionMiddleware = session({
    secret: "supersarasa",
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});


//Agarrar usuarios de la base de datos
app.get('/usuarios', async function (req, res) {
    try {

        let respuesta = await realizarQuery(`SELECT * FROM Usuarios`);
        res.send(respuesta);
    }

    catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.get('/games', async function (req, res) {
    try {

        let respuesta = await realizarQuery(`SELECT * FROM Games`);
        res.send(respuesta);
    }

    catch (error) {
        res.status(500).send({ error: error.message });
    }
})

app.post('/usuarios', async function (req, res) {
    try {

        let usuarioExistente = await realizarQuery(`SELECT * FROM Usuarios WHERE mail="${req.body.mail}"`);
        console.log(usuarioExistente)

        if (usuarioExistente.length > 0) {
            res.send("El usuario ya existe");

        } else {
            await realizarQuery(`INSERT INTO Usuarios (nombre_usuario,mail,contrasena, es_admin) VALUES ("${req.body.nombre_usuario}","${req.body.mail}","${req.body.contrasena}", false);`)
            res.send({ message: "usuario agregado" })
        }

    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.post("/partida",async function (req,res) {
    try {
        await realizarQuery(`INSERT INTO Games (gano,cant_pregunta,fecha,id_usuario) VALUES (${req.body.gano},${req.body.cant_pregunta},"${req.body.fecha}",${req.body.id_usuario})`)
        res.send({ message: "partida guardada" });
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})


app.post('/login', async function (req, res) {
    try {

        let usuario = await realizarQuery(`
            SELECT * FROM Usuarios WHERE mail="${req.body.mail}" AND contrasena="${req.body.contrasena}"`);

        if (usuario.length > 0) {
            res.send({
                message: "Login exitoso",
                id:usuario[0].id_usuario
            });

        } else {
            res.send({
                message: "Mail o contraseña incorrectos"
            });

        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



io.on("connection", (socket) => {
    const req = socket.request;

    // CREAR SALA
    socket.on("crearSala", (data) => {
        const categoria = data?.categoria;
        let codigo = crypto.randomBytes(3).toString("hex").toUpperCase();

        while (io.sockets.adapter.rooms.has(codigo)) {
            codigo = crypto.randomBytes(3).toString("hex").toUpperCase();
        }

        if (req.session.room != undefined && req.session.room.length > 0) {
            socket.leave(req.session.room);
        }

        req.session.room = codigo;
        socket.join(codigo);

        console.log("Sala creada:", codigo);
        salas[codigo] = { tablero: null, elegidas: new Set(), categoria };

        socket.emit("salaCreada", { room: codigo });
    });


    // UNIRSE A UNA SALA
 socket.on("joinRoom", (data) => {
        const codigo = data.room.toUpperCase();
        const sala = io.sockets.adapter.rooms.get(codigo);

        if (sala == undefined) {
            socket.emit("errorSala", "La sala no existe");
            return;
        }

        const yaEsta = socket.rooms.has(codigo);

        if (sala.size >= 2 && !yaEsta) {
            socket.emit("errorSala", "La sala está completa");
            return;
        }

        if (req.session.room != undefined && req.session.room.length > 0 && req.session.room != codigo) {
            socket.leave(req.session.room);
        }

        req.session.room = codigo;
        socket.join(codigo);



        // si el tablero ya existe (entré tarde o recargué), mandárselo solo a este socket
        if (salas[codigo].tablero) {
            socket.emit("tablero", { personajes: salas[codigo].tablero });
        }

        console.log("Jugador unido a:", codigo);

        const jugadores = io.sockets.adapter.rooms.get(codigo).size;
        console.log("Jugadores en la sala:", jugadores);

        if (jugadores == 2 && !yaEsta) {
            io.to(codigo).emit("partidaLista", { room: codigo });
        }
    });

socket.on("casillaElegida", () => {
    const codigo = req.session.room;
    const sala = salas[codigo];
    if (!sala) return;

    sala.elegidas.add(socket.id);
    console.log("sala:", codigo, "elegidas:", sala.elegidas.size);

    if (sala.elegidas.size === 2) {
        const ids = [...sala.elegidas]; 

        // sorteo: 50% de que se inviertan
        if (Math.random() < 0.5) ids.reverse();

        const [primero, segundo] = ids;

        io.to(primero).emit("empezar", { turno: true });   // pregunta
        io.to(segundo).emit("empezar", { turno: false });  // espera
    }
});

    // INICIAR JUEGO
socket.on("inicioJuego", async () => {
    async function generarTablero(categoria) {
    return await realizarQuery(
                `SELECT nombre_casilla,
                REPLACE(img, 'front/public', '') AS img
         FROM Personajes
         WHERE tabla="${categoria}"
         ORDER BY RAND()
         LIMIT 24`
    );
}
    try {
        const codigo = req.session.room;
        const sala = salas[codigo];
        if (!sala || sala.tablero || sala.generando) return;

        sala.generando = true;
        sala.tablero = await generarTablero(sala.categoria);
        sala.generando = false;

        io.to(codigo).emit("tablero", { personajes: sala.tablero });
    } catch (error) {
        console.error("Error en inicioJuego:", error);
        if (salas[req.session.room]) salas[req.session.room].generando = false;
    }
});


    socket.on("pregunta", (data) => {
        socket.to(req.session.room).emit("pregunta", { pregunta: data.pregunta });
    })

    socket.on("respuesta", (data) => {
        socket.to(req.session.room).emit("respuesta", data);
    })

    socket.on("descartado", (data) => {
        socket.to(req.session.room).emit("descartado", data);
    })

    socket.on("casillaAdivinada",(data)=>{
        socket.to(req.session.room).emit("casillaAdivinada", data);
    })

    socket.on("resultadoFinal",(data)=>{
        socket.to(req.session.room).emit("resultadoFinal", data);
    })


});

