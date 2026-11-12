const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");
const { realizarQuery } = require("./modulos/mysql");

const app = express();
const PORT = process.env.PORT || 4000;
const crypto = require("crypto");
const turnos = new Map();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
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

app.post('/usuarios', async function (req, res) {
    try {

        let usuarioExistente = await realizarQuery(`SELECT * FROM Usuarios WHERE mail="${req.body.mail}"`);
        console.log(usuarioExistente)

        if (usuarioExistente.length > 0) {
            res.send("El usuario ya existe");

        } else {
            await realizarQuery(`INSERT INTO Usuarios (nombre_usuario,mail,contrasena, es_admin) VALUES ("${req.body.nombre_usuario}","${req.body.mail}","${req.body.contrasena}", false);`)
            res.send({message:"usuario agregado"})
        }

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
                message: "Login exitoso"
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
    socket.on("crearSala", () => {
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

        console.log("Jugador unido a:", codigo);

        io.to(codigo).emit("chat-messages", {
            user: req.session.user,
            room: codigo
        });

        const jugadores = io.sockets.adapter.rooms.get(codigo).size;

        console.log("Jugadores en la sala:", jugadores);

        if (jugadores == 2 && !yaEsta) {
            io.to(codigo).emit("partidaLista", { room: codigo });
        }
    });
    socket.on("casillaElegida",()=>{
        
    });

    // INICIAR JUEGO
    socket.on("inicioJuego", async (data) => {
        async function obtenerPersonajes(categoria) {
            return await realizarQuery(`SELECT nombre_casilla, img FROM Personajes WHERE tabla="${categoria}" ORDER BY RAND() LIMIT 24`);
        }

        const personajes = await obtenerPersonajes(data.categoria);

        console.log("empezo el juego");

        io.to(req.session.room).emit("tablero", { personajes });
    });

    
    socket.on("pregunta", (data)=>{
            socket.to(req.session.room).emit("pregunta", {pregunta: data.pregunta});
    })

    socket.on("casillaElegida",(data)=>{
        socket.to(req.session.room).emit("casillaElegida",{})
    })
});

