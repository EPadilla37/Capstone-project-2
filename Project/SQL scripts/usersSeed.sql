-- Create 'fake_db_usuarios' database
CREATE DATABASE IF NOT EXISTS fake_db_usuarios;

-- Use the newly created database
USE fake_db_usuarios;

-- Create 'usuarios' table
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(100),
    mobile VARCHAR(20),
    idTipoUsuario VARCHAR(20),
    createAt DATETIME,
    updateAt DATETIME,
    isActive INT,
    idPersona INT
);

-- Insert fabricated data into 'usuarios' table with fake values

-- Example:
INSERT INTO usuarios (usuario, email, password, mobile, idTipoUsuario, createAt, updateAt, isActive, idPersona)
VALUES
('fakename1', 'fakeemail1@fake.com', 'fakepassword1', '111-111-1111', 'ICADM', '2023-06-12 13:56:19', '2020-03-12 16:23:01', 1, 1),
('fakename2', 'fakeemail2@fake.com', 'fakepassword2', '222-222-2222', 'ICPAC', '2022-07-15 15:16:59', '0000-00-00 00:00:00', 1, 52),
('fakename3', 'fakeemail3@fake.com', 'fakepassword3', '333-333-3333', 'ICPAC', '2023-06-13 13:45:26', '0000-00-00 00:00:00', 1, 57),
('fakename4', 'fakeemail4@fake.com', 'fakepassword4', '444-444-4444', 'ICPAC', '2022-11-18 12:09:04', '0000-00-00 00:00:00', 1, 58),
('fakename5', 'fakeemail5@fake.com', 'fakepassword5', '555-555-5555', 'ICINS', '2023-05-31 11:35:25', '0000-00-00 00:00:00', 1, 59);

-- Create 'persona' table with fake data

-- Example:
CREATE TABLE persona (
    idPersona INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    direccion VARCHAR(100),
    informacion VARCHAR(100),
    idReferencia VARCHAR(50),
    registro DATETIME,
    status INT,
    tel_casa VARCHAR(20),
    tel_celular VARCHAR(20),
    reg_update DATETIME
);

INSERT INTO persona (nombre, direccion, informacion, idReferencia, registro, status, tel_casa, tel_celular, reg_update)
VALUES
('Fake Name1', 'Fake Address1', 'Fake Info1', 'Fake Ref1', '2021-10-23 12:25:00', 1, '111-111-1111', '111-111-1111', '2021-11-19 16:25:53'),
('Fake Name2', 'Fake Address2', 'Fake Info2', 'Fake Ref2', '2022-05-30 14:10:38', 1, '222-222-2222', '222-222-2222', NULL),
('Fake Name3', 'Fake Address3', 'Fake Info3', 'Fake Ref3', '2022-06-15 13:22:55', 1, '333-333-3333', '333-333-3333', NULL),
('Fake Name4', 'Fake Address4', 'Fake Info4', 'Fake Ref4', '2022-06-23 11:37:07', 1, '444-444-4444', '444-444-4444', NULL),
('Fake Name5', 'Fake Address5', 'Fake Info5', 'Fake Ref5', '2022-06-24 11:06:38', 1, '555-555-5555', '555-555-5555', NULL);
