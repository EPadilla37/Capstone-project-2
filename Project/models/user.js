import { promisify } from "util";
import { db_usuarios, db_agenda } from "../db.js";
const db_usuarios_query = promisify(db_usuarios.query).bind(db_usuarios);
const db_agenda_query = promisify(db_agenda.query).bind(db_agenda);
import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config.js";

// Function to format date in YYYY-MM-DD format
function formatDate(date) {
  const inputDate = new Date(date);
  if (isNaN(inputDate)) {
    return ""; 
  }
  const formattedDate = inputDate.toISOString().split("T")[0];
  return formattedDate;
}

class User {
	static async authenticate(username, password) {
		const result = await db_usuarios_query(
			"SELECT password FROM usuarios WHERE email = ?",
			[username]
		);
		if (result.length > 0) {
			let user = result[0];
			return username && password;
			// return user && (await bcrypt.compare(password, user.password));
		} else {
			return;
		}
	}

	static async getUser(username) {
		try {
			const result = await db_usuarios_query(
				"SELECT * FROM usuarios u, persona p WHERE u.idPersona = p.idPersona AND u.usuario = ?",
				[username]
			);

			if (result.length === 0) {
				throw new Error("No se pudo obtener el usuario de la base de datos");
			}

			return result;
		} catch (error) {
			error.title = "Perfil de Usuario";
			throw error;
		}
	}

	// //Solo pacientes de la Institucion Activa
	// static async getPatientInfo(criteria, searchTerm, idClinic) {
	// 	let query = `
	// SELECT
	//   DISTINCT
	//   p.pac_id_paciente AS id,
	//   CONCAT(p.pac_apmaterno, ' ', p.pac_appaterno, ' ', p.pac_nombre) AS nombre,
	//   p.pac_fecnac AS fecha_nacimiento,
	//   p.pac_sexo AS sexo
	// FROM
	//   pacientes p
	//   JOIN agenda a ON p.pac_id_paciente = a.age_id_paciente
	//   WHERE a.age_id_clinica = ${idClinic} AND p.pac_fecnac != '0000-00-00' `;

	// 	if (criteria && searchTerm) {
	// 		switch (criteria) {
	// 			case "nombre":
	// 				const nameTerms = searchTerm.split(" ");
	// 				const terms = nameTerms
	// 					.map(
	// 						(term) =>
	// 							`(p.pac_nombre LIKE '%${term}%' OR p.pac_apmaterno LIKE '%${term}%' OR p.pac_appaterno LIKE '%${term}%')`
	// 					)
	// 					.join(" AND ");
	// 				query += ` AND ${terms}`;
	// 				break;
	// 			case "email":
	// 				query += ` AND p.pac_email LIKE '%${searchTerm}%'`;
	// 				break;
	// 		}
	// 		query += ` LIMIT 10`;
	// 	}

	// 	const result = await db_agenda_query(query);
	// 	const formattedResult = result.map((row) => ({
	// 		id: row.id,
	// 		nombre: row.nombre,
	// 		fecha_nacimiento: formatDate(row.fecha_nacimiento),
	// 	}));
	// 	return formattedResult;
	// }

	static async getPatientInfo(criteria, searchTerm, idClinic) {
		let query = `
        SELECT
        DISTINCT
        p.pac_id_paciente AS id,
        CONCAT(p.pac_apmaterno, ' ', p.pac_appaterno, ' ', p.pac_nombre) AS nombre,
        p.pac_fecnac AS fecha_nacimiento,
        p.pac_sexo AS sexo
        FROM
        pacientes p
        JOIN agenda a ON p.pac_id_paciente = a.age_id_paciente
        WHERE p.pac_fecnac != '0000-00-00'`;

		const result = await db_agenda_query(query);
		console.log(JSON.stringify(result));
		const formattedResult = result.map((row) => ({
			id: row.id,
			nombre: row.nombre,
			fecha_nacimiento: formatDate(row.fecha_nacimiento),
		}));
		return formattedResult;
	}
	
	static async getPatientInfoAll(idClinic) {
		let query = `
        SELECT
        p.pac_id_paciente AS id,
        CONCAT(p.pac_apmaterno, ' ', p.pac_appaterno, ' ', p.pac_nombre) AS nombre,
        p.pac_fecnac AS fecha_nacimiento,
        p.pac_sexo AS sexo
        FROM
        pacientes p
        JOIN agenda a ON p.pac_id_paciente = a.age_id_paciente`;

		const result = await db_agenda_query(query);
		console.log(JSON.stringify(result));
		const formattedResult = result.map((row) => ({
			id: row.id,
			nombre: row.nombre,
			fecha_nacimiento: formatDate(row.fecha_nacimiento),
		}));
		return formattedResult;
	}

	static async getPatientById(patientId) {
		const query = `
        SELECT pac.pac_id_paciente AS id_paciente,
            pac.pac_apmaterno AS apellido_materno,
            pac.pac_appaterno AS apellido_paterno,
            pac.pac_nombre AS nombre,
            pac.pac_sexo AS sexo,
            pac.pac_fecnac AS fecha_nacimiento
        FROM
            pacientes pac 
        JOIN agenda a ON a.age_id_paciente = pac.pac_id_paciente
        WHERE
            pac.pac_id_paciente = ?
        LIMIT 1
    `;

		try {
			// Execute the query with the patient ID
			const result = await db_agenda_query(query, [patientId]);

			if (result.length > 0) {
				const patientInfo = result[0];
				const formattedFechaNacimiento = formatDate(
					patientInfo.fecha_nacimiento
				);
				patientInfo.fecha_nacimiento = formattedFechaNacimiento;

				return patientInfo;
			} else {
				return null;
			}
		} catch (error) {
			console.error("Error:", error);
			throw new Error("Internal server error");
		}
	}

	static async updateProfile(idPersona, direccion, informacion) {
		try {
			const sql = `UPDATE persona
               SET direccion = ?, informacion = ?, reg_update = NOW()
               WHERE idPersona = ?`;
			const result = await db_usuarios_query(sql, [
				direccion,
				informacion,
				idPersona,
			]);

			if (result.affectedRows == 1) {
				return { status: 200, message: "success" };
			} else {
				return { status: 500, message: "error" };
			}
		} catch (error) {
			error.title = "Actualizar Perfil de Cuenta";
			throw error;
		}
	}
}

export { User };
