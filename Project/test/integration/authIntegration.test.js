const request = require("supertest");
const { app } = require("../../app"); // Import the main app instance

describe("Login and Logout Integration Test", () => {
	let agent;

	beforeAll(() => {
		agent = request.agent(app);
	});

	it("should log in a user and then log them out", async () => {
		const loginResponse = await agent.post("/auth/login").send({
			username: "imaxessprivado@imaxess.com",
			password: "password",
		});

		expect(loginResponse.statusCode).toBe(200);

		const logoutResponse = await agent.get("/auth/logout");
		expect(logoutResponse.statusCode).toBe(302);
	});

});
