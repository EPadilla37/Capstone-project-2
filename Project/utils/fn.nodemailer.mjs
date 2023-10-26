import nodemailer from "nodemailer";

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "recepcion@imaxess.com",
    pass: "bjsdgqamwnogqqre",
  },
});

// Función para enviar un correo electrónico
async function sendEmail(
  fromEmail,
  toEmail,
  subjectEmail,
  messageEmail,
  contactEmail = ""
) {
  return new Promise(async (resolve, reject) => {
    try {
      // Detalles del correo electrónico 'Sender Name <sender@server.com>'
      const mailOptions = {
        from: `${contactEmail} <${fromEmail}>`,
        to: toEmail,
        subject: subjectEmail,
        html: messageEmail,
      };

      // Envía el correo electrónico usando la configuración importada
      const info = await transporter.sendMail(mailOptions);
      resolve("Success");
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
      reject("Error");
    }
  });
}

// Función para enviar confirmacion de cita
async function sendConfirmationEmail(
  fromEmail,
  toEmail,
  subjectEmail,
  messageEmail,
  contactEmail = ""
) {
  return new Promise(async (resolve, reject) => {
    try {
      // Detalles del correo electrónico 'Sender Name <sender@server.com>'
      const mailOptions = {
        from: `${contactEmail} <${fromEmail}>`,
        to: toEmail,
        subject: subjectEmail,
        html: messageEmail,
      };

      // Envía el correo electrónico usando la configuración importada
      const info = await transporter.sendMail(mailOptions);
      resolve("Success");
    } catch (error) {
      console.error("Error al enviar confirmación de cita:", error);
      reject("Error");
    }
  });
}

export { transporter, sendEmail, sendConfirmationEmail };
