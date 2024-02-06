import mysql from "mysql2";

const db_agenda = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "padilla",
	database: "fake_agenda",
});

const db_usuarios = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "padilla",
	database: "fake_db_usuarios",
});

db_agenda.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL (agenda):", err);
		return;
	}
	console.log("Connected to MySQL database (agenda)");
});

db_usuarios.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL:", err);
		return;
	}
	console.log("Connected to MySQL database");
});

// Module Session -Mysql
const dbUsers = {
	host: "localhost",
	user: "root",
	password: "padilla",
	database: "fake_db_usuarios",
};

export { db_agenda, db_usuarios, dbUsers };
