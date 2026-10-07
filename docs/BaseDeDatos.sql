CREATE TABLE IF NOT EXISTS Games(
id_games int auto_increment unique not null,
gano bool,
cant_pregunta int,
fecha date,
adivino bool,
cant_vidas int,
id_usuario int,
PRIMARY KEY (id_games),
FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS Personajes(
id_casilla int auto_increment unique not null,
nombre_casilla varchar(255),
img varchar(255),
tabla varchar(255),
PRIMARY KEY (id_casilla)
);