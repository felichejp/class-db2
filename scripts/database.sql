CREATE DATABASE classdb2;

-- Tabla de usuarios
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de contraseñas
CREATE TABLE "password" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);

-- Tabla de accesos
CREATE TABLE "access" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);