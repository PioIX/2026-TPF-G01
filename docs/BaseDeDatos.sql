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

CREATE TABLE IF NOT EXISTS Usuarios(
id_usuario int auto_increment unique not null,
nombre_usuario varchar(255),
mail varchar(255),
contrasena varchar(255),
es_admin bool,
PRIMARY KEY (id_usuario)
);