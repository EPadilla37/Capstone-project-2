# Clinic Scheduling Application

This is a Node.js and Express.js application designed for clinics to schedule studies for patients online. The application uses Nunjucks for the frontend and integrates several technologies to provide a seamless experience for both clinics and patients.

## Technologies Used

- Node.js
- Express.js
- Nunjucks (template engine)
- Nodemon (for development)
- Jest (for testing)
- Bcrypt (for password hashing)
- MySQL2 (as the database driver)
- JWT (JSON Web Tokens for authentication)
- Nodemailer (for sending emails)

## Getting Started

To run this application on your local computer, follow these steps:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/clinic-scheduling-app.git


Alternatively, you can download the zipped file and extract it to your desired directory.

2. Navigate to the project's root directory:
	-cd clinic-scheduling-app
	-Install the application's dependencies using npm:
		-npm install



3. Create a database for the application. You will need to set up your database with patients since personal information cannot be provided in the codebase. Configure your database connection in the db.js file.

Start the application: npm start

You should see a message in the console indicating that the server is running on port 3000 (the default port).


4. Open a web browser and visit http://localhost:3000 to access the application.

5. Running Tests
	This application uses Jest for testing. To run the tests, follow these steps:

	Ensure that you have already installed the application's dependencies (as described in the "Getting Started" section).

	Run the tests with the following command: npm test


Note
It's important to emphasize that you need to set up your own database with patient data since real personal information cannot be included in the codebase.

Feel free to customize and extend the application as needed for your clinic's specific requirements.