import { promisify } from "util";
import { db_usuarios, db_agenda } from "../db.js";
import { error } from "console";
const db_usuarios_query = promisify(db_usuarios.query).bind(db_usuarios);
const db_agenda_query = promisify(db_agenda.query).bind(db_agenda);

class Expediente {
  /**
   * Función asincrónica para obtener un expediente médico por su ID de referencia.
   *
   * @param {number} idReferencia - El ID de referencia del expediente médico.
   * @returns {Promise} - Una promesa que resuelve en los datos del expediente médico o se rechaza con un error.
   */
  static async getExpediente(idReferencia) {
    console.log(idReferencia);
    // Consulta SQL para obtener información del expediente médico
    const qstring = `
    SELECT
        pac.pac_id_paciente AS id_paciente,
        pac.pac_appaterno AS apellido_paterno,
        pac.pac_apmaterno AS apellido_materno,
        pac.pac_nombre AS nombre,
        e.est_id_estudio AS id_estudio,
        e.est_descripcion AS estudio,
        e.est_id_modalidad AS id_modalidad,
        a.age_id_cita AS id_cita,
        a.age_fecha AS fecha,
        a.age_id_clinica AS institucion,
        c.cdv_url AS viewer_url
    FROM
        procesos p
        JOIN agenda a ON p.pro_id_cita = a.age_id_cita
        JOIN estudios e ON p.pro_id_estudio = e.est_id_estudio
        JOIN pacientes pac ON a.age_id_paciente = pac.pac_id_paciente
        JOIN clouddicomviewer c ON a.age_id_cita = c.cdv_id_cita AND c.cdv_status = 1
    WHERE
        a.age_id_clinica = ?`;

		const result = await db_agenda_query(qstring, [idReferencia]);

    if (result.length > 0) {
      let user = result;
      return user;
    } else {
      // Lanza un error si no se pudo obtener el expediente médico
      throw error("No se pudo obtener el expediente");
    }
  }

  static async getFilteredPatientData(idReferencia, searchString) {
    const searchTerms = searchString.split(" ");

    //construir string de LIKE por termino de busqueda
    const likeConditions = searchTerms.map(
      (term) => `
      (pac.pac_nombre LIKE '%${term}%' OR
      pac.pac_appaterno LIKE '%${term}%' OR
      pac.pac_apmaterno LIKE '%${term}%')
    `
    );

    //unir todas las condiciones
    const filterConditions = likeConditions.join(" AND ");

    const qstring = `
      SELECT
        pac.pac_id_paciente AS id_paciente,
        pac.pac_appaterno AS apellido_paterno,
        pac.pac_apmaterno AS apellido_materno,
        pac.pac_nombre AS nombre,
        e.est_id_estudio AS id_estudio,
        e.est_descripcion AS estudio,
        e.est_id_modalidad AS id_modalidad,
        a.age_id_cita AS id_cita,
        a.age_fecha AS fecha,
        a.age_id_clinica AS institucion,
        c.cdv_url AS viewer_url
      FROM
        procesos p
        JOIN agenda a ON p.pro_id_cita = a.age_id_cita
        JOIN estudios e ON p.pro_id_estudio = e.est_id_estudio
        JOIN pacientes pac ON a.age_id_paciente = pac.pac_id_paciente
        JOIN clouddicomviewer c ON a.age_id_cita = c.cdv_id_cita AND c.cdv_status = 1
      WHERE
        a.age_id_clinica = ${idReferencia}
        AND (${filterConditions})
      LIMIT 20`;

    // Realize the query to the database
    const result = await db_agenda_query(qstring);

    if (result.length > 0) {
      return result;
    } else {
      throw new Error("No se pudo obtener el expediente");
    }
  }

  static async getMedicalReport(idSolicitud, idEstudio) {
    const qstring = `SELECT  
        i.int_orden AS solicitud, 
        i.int_id_tecnico, 
        i.int_descripcion,
        i.int_id_estudio,
        i.int_anexos,
        a.age_fecha AS fecha_estudio,
        CONCAT(p.pac_appaterno,' ',p.pac_apmaterno,' ',p.pac_nombre) AS nombre_paciente,
        p.pac_fecnac AS fecha_nacimiento,
        CONCAT(m.med_appaterno,' ',m.med_apmaterno,' ',m.med_nombre) AS nombre_medico,
        CONCAT(e.est_id_modalidad, ' - ', e.est_descripcion) AS estudio_descripcion,
        c.cdv_url AS url_estudio,
        t.tec_nombre AS interpreto_medico,
        t.tec_cedula AS interpreto_cedula,
        i.int_id_tecnico AS interpreto_firma
    FROM 
    interpretaciones i
    JOIN agenda a ON i.int_orden = a.age_id_cita
    JOIN pacientes p ON a.age_id_paciente = p.pac_id_paciente
    JOIN medicos m ON a.age_id_medico = m.med_id_medico
    JOIN estudios e ON i.int_id_estudio = e.est_id_estudio
    JOIN tecnicos t ON i.int_id_tecnico = t.tec_id_usuario
    LEFT JOIN clouddicomviewer c ON a.age_id_cita = c.cdv_id_cita
    WHERE i.int_status = 0 AND i.int_orden = ? AND i.int_id_estudio = ? `;

    try {
      const result = await db_agenda_query(qstring, [idSolicitud, idEstudio]);

      if (result.length > 0) {
        let report = result[0];
        return report;
      } else {
        throw new Error("No se encontró el reporte médico en el expediente.");
      }
    } catch (error) {
      console.error("Error al obtener el reporte médico:", error);
      throw error;
    }
  }
}

export { Expediente };
