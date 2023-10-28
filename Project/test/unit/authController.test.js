// authController.test.mjs
const {userModel} = require("../../controllers/authController.js");
// import {userModel} from "../../controllers/authController"


describe("Authentication Controller Tests", () => {
	describe("login", () => {
		it("should log in a user with correct credentials", async () => {
			const req = {
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
					token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImltYXhlc3Nwcml2YWRvQGltYXhlc3MuY29tIiwiaWF0IjoxNjk4NDQ3ODYwfQ.H0bNU5skYxZLBkoyUQLpaBDGwu0kcJs7rVqMkHjDRWg",
				},
			};

			const res = {
				render: jest.fn(),
				cookie: jest.fn(),
			};

			await userModel.login(req, res);

			expect(res.render).toHaveBeenCalledWith("dashboard.html", {
				notifyMessage: expect.any(String),
				username: "PRIVADO", 
			});
		});

		it("should handle incorrect credentials", async () => {
			const req = {
				body: {
					username: "invaliduser",
					password: "invalidpassword",
				},
			};

			const res = {
				render: jest.fn(),
			};

			const next = jest.fn();

			await userModel.login(req, res, next);

			expect(res.render).toHaveBeenCalledWith("login/login.html", {
				loginAlert: expect.any(String),
			});
		});
	});

	describe("renderLogin", () => {
		it("should render the login page", async () => {
			const req = {};
			const res = {
				render: jest.fn(),
			};
			await userModel.renderLogin(req, res);


			expect(res.render).toHaveBeenCalledWith("login/login.html");
		});
	});

});
