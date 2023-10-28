import { Expediente } from "../models/expediente.js";
import PDFDocument from "pdfkit";
import { JSDOM } from "jsdom";
import { convert } from "html-to-text";
import pdf from "html-pdf";
import fs from "fs";

import nunjucks from "nunjucks";
import { formatDate } from "../utils/dates.js";
import QRCode from "qrcode";
import { createCanvas } from "canvas";
import path from "path";

const __dirname = process.cwd();

const pdfController = {
  getMedicalReportPDF: async (req, res, next) => {
    try {
      const idSolicitud = req.body.idSolicitud;
      const idEstudio = req.body.idEstudio;

      const reporte = await Expediente.getMedicalReport(idSolicitud, idEstudio);

      const interpretacionHTML = reporte.int_descripcion.replace(
        /<br>/g,
        "<br><br>"
      );
      reporte.interpretacionHTML = interpretacionHTML;

      let anexosHTML = reporte.int_anexos.replace(/<br>/g, "<br><br>").trim();
      if (anexosHTML.length <= 0) {
        anexosHTML = false;
      }
      reporte.anexosHTML = anexosHTML;

      reporte.fecha_estudio = formatDate.formatShortDate(reporte.fecha_estudio);
      reporte.edad = formatDate.formatDoB(reporte.fecha_nacimiento);

      //Generar QR Code
      const urlDicomViewer = reporte.url_estudio;
      let qrCodeDataURL = false;
      if (urlDicomViewer.length > 10) {
        // Crea un nuevo objeto QRCode
        const canvas = createCanvas(120, 120);
        await QRCode.toCanvas(canvas, urlDicomViewer);
        qrCodeDataURL = canvas.toDataURL("image/png");
      } else {
        qrCodeDataURL = false;
      }

      const renderedHTML = nunjucks.render("medicalreport/reporte.html", {
        datos: reporte,
        qrcode: qrCodeDataURL,
      });

      //Footer content
      const htmlFooter =
        "Ave. Guanajuato #2251 Local B, C y D, Col. Madero C.P. 22040 Tijuana, Baja California Tel. 634 11 18 (ext 100, 101 y 102)";

      // Configuramos las opciones para la generación del PDF
      const pdfOptions = {
        format: "Letter",
        type: "pdf",
        quality: "75",
        footer: {
          height: "37px", // Altura del pie de página
          contents: `<div style="text-align: center; padding: 10px; bottom:0px;" id="infoFooter">
            ${htmlFooter}
            </div>`,
        },
      };

      // Generamos el PDF a partir del HTML con estilos personalizados
      pdf.create(renderedHTML, pdfOptions).toStream((err, stream) => {
        if (err) {
          console.error("Error al crear el PDF:", err);
          return next(err);
        }

        // Establecemos el encabezado para mostrar el PDF en línea
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="mi-pdf.pdf"');

        // Enviamos el flujo del PDF como respuesta HTTP
        stream.pipe(res);
      });
    } catch (err) {
      console.error("Error al crear el PDF:", err);
      return next(err);
    }
  },
};

export default pdfController;
