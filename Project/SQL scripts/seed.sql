-- Create a new database
CREATE DATABASE fake_agenda;

-- Use the newly created database
USE fake_agenda;

-- Create tables similar to the ones in the original database
CREATE TABLE modalidades (
    mod_id_modalidad VARCHAR(50),
    mod_descripcion VARCHAR(100),
    mod_status INT
);

CREATE TABLE salas (
    sal_id_sala VARCHAR(50),
    sal_id_gabinete VARCHAR(50),
    sal_numero INT,
    sal_descripcion VARCHAR(100),
    sal_activo VARCHAR(5),
    sal_status VARCHAR(20),
    sal_prefijo VARCHAR(5),
    sal_mod_ptm VARCHAR(5),
    sal_online INT
);

CREATE TABLE estudios (
    est_id_estudio INT,
    est_descripcion VARCHAR(255),
    est_id_sala VARCHAR(50),
    est_precio DECIMAL(10, 2),
    est_especificaciones VARCHAR(255),
    est_duracion INT,
    est_status INT,
    est_tipo VARCHAR(50),
    est_id_modalidad VARCHAR(50),
    est_codigo VARCHAR(50)
);

CREATE TABLE horas (
    hor_hora TIME,
    hor_posicion INT
);

CREATE TABLE agenda (
    age_id_cita INT,
    age_id_sala VARCHAR(50),
    age_id_paciente INT,
    age_id_medico INT,
    age_id_clinica INT,
    age_fecha DATE,
    age_hora_inicio TIME,
    age_hora_final TIME,
    age_duracion INT,
    age_folio_ref VARCHAR(50),
    age_orden INT,
    age_refcobro VARCHAR(50),
    age_status INT,
    age_observaciones VARCHAR(255),
    age_id_usuario INT,
    age_fecha_agendada DATE,
    age_urgencia VARCHAR(5),
    age_hospitalizado VARCHAR(5),
    age_hora_arribo TIME,
    age_num_afiliacion VARCHAR(50),
    age_id_usr_arribo INT,
    age_est_previos INT,
    age_promotora VARCHAR(50),
    age_hora_proceso DATETIME,
    age_hora_proceso_finalizado DATETIME,
    age_hora_estudio_entregado DATETIME,
    age_confirmacion INT
);

CREATE TABLE indicaciones (
    ind_id_indicacion INT,
    ind_clave VARCHAR(50),
    ind_status INT,
    ind_registro DATETIME,
    ind_url VARCHAR(255)
);

CREATE TABLE procesos (
    pro_id_proceso INT,
    pro_id_cita INT,
    pro_id_estudio VARCHAR(50),
    pro_id_tecnico VARCHAR(50),
    pro_fechaentrega DATETIME,
    pro_status INT,
    pro_impreso INT
);

CREATE TABLE cancelaciones (
    can_id_cancelacion INT,
    can_id_cita INT,
    can_id_usuario INT,
    can_fecha DATE,
    can_descripcion VARCHAR(255)
);

-- Create 'interpretaciones' table
CREATE TABLE interpretaciones (
    int_id_interpretacion INT AUTO_INCREMENT PRIMARY KEY,
    int_id_tecnico VARCHAR(50),
    int_orden INT,
    int_descripcion TEXT,
    int_id_estudio VARCHAR(50),
    int_anexos VARCHAR(50),
    int_fecha DATETIME,
    int_status INT
);

CREATE TABLE clouddicomviewer (
    cdv_id INT AUTO_INCREMENT PRIMARY KEY,
    cdv_datetime DATE,
    cdv_id_cita INT,
    cdv_id_usuario VARCHAR(50),
    cdv_status INT,
    cdv_url VARCHAR(255)
);

-- Create 'pacientes' table
CREATE TABLE pacientes (
    pac_id_paciente VARCHAR(20),
    pac_appaterno VARCHAR(50),
    pac_apmaterno VARCHAR(50),
    pac_nombre VARCHAR(50),
    pac_fecnac DATE,
    pac_sexo VARCHAR(10),
    pac_direccion VARCHAR(100),
    pac_tel_casa VARCHAR(20),
    pac_tel_oficina VARCHAR(20),
    pac_tel_movil VARCHAR(20),
    pac_email VARCHAR(50),
    pac_id_identificacion VARCHAR(50),
    pac_codigo_barras INT,
    pac_num_referencia VARCHAR(50),
    pac_registrado INT,
    pac_encuesta VARCHAR(50),
    pac_publicidad INT
);

-- Insert fabricated data into the 'modalidades' table
INSERT INTO modalidades (mod_id_modalidad, mod_descripcion, mod_status)
VALUES 
    ('MOD1', 'Angiology', 1),
    ('MOD2', 'Densitometry', 1),
    -- Add more fictional data for modalidades...

-- Insert fabricated data into the 'clouddicomviewer' table
INSERT INTO clouddicomviewer (cdv_datetime, cdv_id_cita, cdv_id_usuario, cdv_status, cdv_url)
VALUES
    ('2023-01-01', 123456, 'fake_user1', 1, 'https://www.example.com/dicom1'),
    ('2023-01-02', 789012, 'fake_user2', 1, 'https://www.example.com/dicom2'),
    -- Add more fictional data for clouddicomviewer...

-- Insert fabricated data into the 'salas' table
INSERT INTO salas (sal_id_sala, sal_id_gabinete, sal_numero, sal_descripcion, sal_activo, sal_status, sal_prefijo, sal_mod_ptm, sal_online)
VALUES 
    ('SAL1', 'GB1', 1, 'Radiology', 'YES', 'active', 'RAD', 'MRI', 1),
    ('SAL2', 'GB2', 2, 'Mammography', 'YES', 'active', 'MAM', 'MGR', 1),
    -- Add more fictional data for salas...

-- Insert fabricated data into the 'interpretaciones' table
INSERT INTO interpretaciones (int_id_tecnico, int_orden, int_descripcion, int_id_estudio, int_anexos, int_fecha, int_status)
VALUES
    ('tech1', 1001, 'Fake interpretation text for study 1', 'STUDY1', '', '2023-01-05 10:00:00', 1),
    ('tech2', 1002, 'Fake interpretation text for study 2', 'STUDY2', '', '2023-01-06 11:00:00', 1),
    -- Add more fictional data for interpretaciones...

-- Insert fabricated data into the 'pacientes' table
INSERT INTO pacientes (pac_id_paciente, pac_appaterno, pac_apmaterno, pac_nombre, pac_fecnac, pac_sexo, pac_direccion, pac_tel_casa, pac_tel_oficina, pac_tel_movil, pac_email, pac_id_identificacion, pac_codigo_barras, pac_num_referencia, pac_registrado, pac_encuesta, pac_publicidad)
VALUES
    ('PID1', 'Doe', 'Smith', 'John', '1985-06-15', 'MALE', '123 Fake St.', '1234567890', '', '9876543210', 'john.doe@example.com', 'ID123456', 789, 'survey1', 1),
    ('PID2', 'Johnson', 'Brown', 'Emma', '1990-03-20', 'FEMALE', '456 Mock Ave.', '5678901234', '', '8765432109', 'emma.johnson@example.com', 'ID654321', 987, 'survey2', 1),
    -- Add more fictional data for pacientes...