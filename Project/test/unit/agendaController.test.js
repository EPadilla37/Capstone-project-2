const { agendaObject } = require("../../controllers/agendaController");

describe("Agenda Controller Tests", () => {
	const sessionData = {
		body: {
			username: "imaxessprivado@imaxess.com",
			password: "password",
		},
		session: {
			user: {
				id: 41,
				usuario: "imaxessprivado@imaxess.com",
				email: "imaxessprivado@imaxess.com",
				idPersona: 68,
				nombre: "privado",
				id_referencia: 1,
			},
			token:
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2vybmftzsi6imltyxhlcznwcml2ywrvo2ltayxhlczmuy29tiwiawf0ijoxnjk4ndq3odywfq.h0bnu5skyxzlbkoyuqlpabdgwu0kcjs7rvqmkhjdrwg",
		},
	};

	it("Should add study to session", async () => {
		const req = sessionData;
		const res = {
			sendStatus: jest.fn(),
		};
		const next = jest.fn();

		// Add estudio and modalidades to the request body
		req.body.estudio = {
			id: "EST54",
			descripcion: "ABDOMINAL",
			precio: 3990,
			duracion: 30,
			id_modalidad: "TC",
		};
		req.body.sala = {
			id: "MAT8",
			descripcion: "TC - TOMOGRAFIA MULTICORTE",
		};

		await agendaObject.addEstudioToSession(req, res, next);

		expect(req.session.estudios).toHaveLength(1);
		expect(req.session.estudios[0]).toEqual(req.body.estudio);
		expect(req.session.modalidades).toEqual(req.body.sala);
		expect(res.sendStatus).toHaveBeenCalledWith(200);
	});
});
