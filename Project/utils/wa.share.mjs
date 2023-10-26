// Importa la función 'open' desde el módulo 'open'
import open from "open";

const wsShare = {};

wsShare.shareLinkWhatsApp = (url) => {
  const message = encodeURIComponent(`¡Echa un vistazo a este enlace!\n${url}`);
  const whatsappURL = `https://api.whatsapp.com/send?text=${message}`;

  open(whatsappURL, { app: "chrome" }) // Cambia 'chrome' al navegador que prefieras
    .then(() => {
      console.log("Enlace compartido.");
    })
    .catch((error) => {
      console.error("Error en WhatsApp:", error);
    });
};

export default wsShare;
