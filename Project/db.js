import mysql from "mysql2";

const db_agenda = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "imaxess_agenda",
});

const db_usuarios = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "imaxess",
});

// Connect to the 'imaxess_agenda' database
db_agenda.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL (imaxess_agenda):", err);
		return;
	}
	console.log("Connected to MySQL database (imaxess_agenda)");
});

// Connect to the 'imaxess' database
db_usuarios.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL (imaxess):", err);
		return;
	}
	console.log("Connected to MySQL database (imaxess)");
});

// Module Session -Mysql
const dbUsers = {
	host: "localhost",
	user: "root",
	password: "",
	database: "imaxess",
};

export { db_agenda, db_usuarios, dbUsers };
