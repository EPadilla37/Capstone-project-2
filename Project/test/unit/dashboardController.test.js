const { dashboardObject } = require("../../controllers/dashboardController");

describe("Dashboard Controller Tests", () => {

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
					"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImltYXhlc3Nwcml2YWRvQGltYXhlc3MuY29tIiwiaWF0IjoxNjk4NDQ3ODYwfQ.H0bNU5skYxZLBkoyUQLpaBDGwu0kcJs7rVqMkHjDRWg",
		    },
	};


	it("should render dashboard page", async () => {
		const req = sessionData;
		const res = {
			render: jest.fn(),
			cookie: jest.fn(),
		};

		await dashboardObject.render(req, res);

		expect(res.render).toHaveBeenCalledWith("dashboard.html", {
			result: req.session.user,
			selected: "dashboard",
		});
	});

    it("Should get user's profile information", async () => {
        const req = sessionData;
        const res = {
					render: jest.fn(),
					cookie: jest.fn(),
				};

        const next = jest.fn();

        await dashboardObject.getUser(req,res, next);

        expect(res.render).toHaveBeenCalledWith("perfil.html", {
					result: req.session.user,
					selected: "perfil",
				});
        
    });

});
