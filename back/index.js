const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 4000;

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

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

//Registro para agregar un usuario a la base de datos, o sea que el usuario ponga un nombre en el campo, un mail, una contraseña y cuando toca el boton registro se guarde ese usuario y se sume a la base de datos
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

//Iniciar sesion (login)
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

app.get("/personajes",async function (req,res) {
    try {
        const personajes=await realizarQuery(`Select nombre_casilla,img FROM Personajes WHERE tabla="${req.query.categoria}" ORDER BY RAND() limit 20`)
        res.send({personajes:personajes})
    } catch (error) {
        res.status(500).send({ error: error.message });

    }
    
})

io.on("connection", (socket) => {
const req = socket.request;

    socket.on("joinRoom", (data) => {
        console.log("🚀 ~ io.on ~ req.session.room:", req.session.room);
        if (req.session.room != undefined && req.session.room.length > 0)
            socket.leave(req.session.room);
        req.session.room = data.room;
        socket.join(req.session.room);


        io.to(req.session.room).emit("chat-messages", {
            user: req.session.user,
            room: req.session.room,
    });

    socket.on("inicioJuego", (data) => {
        let casillas
        fetch(`http://localhost:4000/personajes?categoria=${data.categoria}`)
        .then(response => response.json())
        .then(result => {casillas= {personjes:result.personajes} })
        console.log("empezo el juego 67")
        io.emit("tablero",{casillas})
        });

    });
});