import { User } from "../models/user.js";
import { Agenda } from "../models/agenda.js";

const agendaObject = {
  getEstudiosInSession: async (req, res, next) => {
    try {
      const estudiosInSession = req.session.estudios || [];
      const modalidadesInSession = req.session.modalidades || [];

      const sessionData = {
        estudios: estudiosInSession,
        modalidades: modalidadesInSession,
      };
      res.status(200).json(sessionData);
    } catch (err) {
      console.error("Error retrieving session data:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  addEstudioToSession: async (req, res, next) => {
    try {
      const { estudio, sala } = req.body;

      if (estudio && sala) {
        if (!req.session.estudios) {
          req.session.estudios = [];
        }

        if (!req.session.modalidades) {
          req.session.modalidades = [];
        }

        // Verificar si el estudio con el mismo id ya existe en la sesión
        const estudioExistente = req.session.estudios.find(
          (e) => e.id === estudio.id
        );

        if (!estudioExistente) {
          req.session.estudios.push(estudio);
        }

        if (req.session.modalidades.length === 0) {
          req.session.modalidades = sala; // cambie push(); *solo es 1 obj sala
        }

        res.sendStatus(200);
      } else {
        res.status(400).json({ error: "Missing Data" });
      }
    } catch (err) {
      return next(err);
    }
  },

  addFunction: async (req, res, next) => {
    try {
      let totalPrecio = 0;
      let totalDuracion = 0;
      const estudiosInSession = req.session.estudios || [];

      for (const estudio of estudiosInSession) {
        const { costo, duracion } = estudio;

        const precioValue = parseInt(costo);
        const duracionValue = parseInt(duracion);
        if (!isNaN(precioValue) && !isNaN(duracionValue)) {
          totalPrecio += precioValue;
          totalDuracion += duracionValue;
        }
      }
      const result = {
        totalPrecio: `${totalPrecio}`,
        totalDuracion: `${totalDuracion}`,
      };
      res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },

  addTotal: async (req, res, next) => {
    try {
      let totalPrecio = 0;
      let totalDuracion = 0;
      const estudiosInSession = req.session.estudios || [];

      for (const estudio of estudiosInSession) {
        const { precio, duracion } = estudio;

        const precioValue = parseInt(precio);
        const duracionValue = parseInt(duracion);
        if (!isNaN(precioValue) && !isNaN(duracionValue)) {
          totalPrecio += precioValue;
          totalDuracion += duracionValue;
        }
      }
      const result = {
        totalPrecio: `${totalPrecio}`,
        totalDuracion: `${totalDuracion}`,
      };
      res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },

  clearAllSession: async (req, res) => {
    try {
      delete req.session.paso;
      delete req.session.estudios;
      delete req.session.modalidades;
      
      res.status(200).send("OK");
      
    } catch (err) {
      console.error("Error clearing session data:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  

  removeEstudioFromSession: async (req, res, next) => {
    try {
      const estudio = req.body;
      if (estudio) {
        if (!req.session.estudios) {
          req.session.estudios = [];
        }
        // Find the index of the estudio to remove
        const index = req.session.estudios.findIndex((e) =>
          e.descripcion.includes(estudio.estudio.descripcion)
        );

        if (index !== -1) {
          // Remove the estudio from the session
          req.session.estudios.splice(index, 1);
          res.sendStatus(200);
        } else {
          res.status(400).json({ error: "Estudio not found in session" });
        }
      } else {
        res.status(400).json({ error: "Missing data" });
      }
    } catch (err) {
      return next(err);
    }
  },

  search: async (req, res, next) => {
    try {
      const { criteria, searchTerm } = req.query;
      const idInstitucion = req.session.user.idReferencia;
      if (criteria) {
        const results = await User.getPatientInfo(
          criteria,
          searchTerm,
          idInstitucion
        );
        res.json(results);
      } else {
        res.status(400).json({ error: "Missing criteria or search term." });
      }
    } catch (err) {
      return next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const patientId = req.query.patientId;
      if (patientId) {
        const infoPaciente = await User.getPatientById(patientId);
        req.session.paciente = infoPaciente;
        res.json(infoPaciente);
      } else {
        res.status(400).json({ error: "Missing criteria or search term" });
      }
    } catch (err) {
      return next(err);
    }
  },

  getStudy: async (req, res, next) => {
    try {
      const paso = "paso2"; 
      req.session.paso = paso;
      res.render("agenda/agendarEstudio.html", {
        paciente: req.session.paciente,
        selected: "agendar",
      });
    } catch (err) {
      return next(err);
    }
  },

  agendaCita: async (req, res, next) => {
    try {
      const paso = "paso3"; 
      req.session.paso = paso; 
      const paciente = req.session;
      req.session.paciente = paciente;

      res.render("agenda/agendarCita.html", {
        paciente,
        selected: "agendar",
      });
    } catch (err) {
      return next(err);
    }
  },

  salas: async (req, res, next) => {
    try {
      const results = await Agenda.getSalasActivas();
      res.json(results);
    } catch (err) {
      return next(err);
    }
  },

  salaActive: async (req, res, next) => {
    try{
      const checkSala = req.session.modalidades;
      if (checkSala){
        res.json(checkSala.descripcion);
      }else{
        res.json({ result: "NA" });
      }
    }catch(err){
      return next(err); 
    }
  },

  modalidad: async (req, res, next) => {
    try {
      const results = await Agenda.getModalidad();
      res.json(results);
    } catch (err) {
      return next(err);
    }
  },

  estudio: async (req, res, next) => {
    try {
      const queryId = req.params.modalidadId;
      const results = await Agenda.getEstudio(queryId);

      res.json(results);
    } catch (err) {
      return next(err);
    }
  },

  estudiosDisponibles: async (req, res, next) => {
    try {
      const results = await Agenda.getEstudiosDisponibles(req.params.salaId);
      res.json(results);
    } catch (err) {
      return next(err);
    }
  },

  getEstudioSeleccionado: async (req, res, next) => {
    try {
      const results = await Agenda.getEstudioByID(req.params.estudioId);
      res.json(results);
    } catch (err) {
      return next(err);
    }
  },

  getTotales: async (req, res, next) => {
    try {
      const estudiosInSession = req.session.estudios || [];
      let totalPrecio = 0;
      let totalDuracion = 0;

      for (const estudio of estudiosInSession) {
        const precioValue = parseInt(estudio.precio);
        const duracionValue = parseInt(estudio.duracion);

        if (!isNaN(precioValue) && !isNaN(duracionValue)) {
          totalPrecio += precioValue;
          totalDuracion += duracionValue;
        }
      }

      const result = {
        totalPrecio: totalPrecio.toString(),
        totalDuracion: totalDuracion.toString(),
        status: 200,
      };

      return result;
    } catch (err) {
      throw err;
    }
  },

  agendarCita: async (req, res, next) => {
    try {
      const totales = await agendaObject.getTotales(req, res, next);
      const today = await agendaObject.getToday();

      res.render("agenda/agendarCita.html", {
        user: req.session.user,
        paciente: req.session.paciente || false,
        modalidad: req.session.modalidades,
        studiesList: req.session.estudios,
        totales: totales,
        selected: "agendar",
        defaultToday: today,
      });
    } catch (err) {
      return next(err);
    }
  },

  getIndicacionesImg: async (req, res, next) => {
    try {
      // Access session properties directly
      const modalidad = req.session.modalidades.descripcion
        .split("-")[0]
        .trim();
      const estudios = req.session.estudios.map((estudio) => {
        const descripcion = estudio.descripcion.replace(/ /g, "_");
        return `${modalidad}_${descripcion}`;
      });
      if (estudios) {
        const result = await Agenda.getIndicaciones(estudios);
        res.json(result);
      }
    } catch (err) {
      return next(err);
    }
  },

  getDisponibilidad: async (req, res, next) => {
    try {
      const idSala = "";
      const fechaSelect = "";
    } catch (error) {
      return next(error);
    }
  },

  getToday: async () => {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, "0");
    const day = todayDate.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};

export { agendaObject };
