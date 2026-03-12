package com.pdv.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.print.*;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.print.attribute.PrintRequestAttributeSet;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

@Service
public class PrinterService {

    @Value("${app.printer.name:ticket}")
    String printerName;

    public void printReceipt(List<PrintLine> lines) {
        try {

            StringBuilder sb = new StringBuilder();

            for (PrintLine line : lines) {
                sb.append(line.getAlignment().getCommand()); 
                sb.append(line.getContent());
                sb.append("\n");
            }

            byte[] data = sb.toString().getBytes("UTF-8");
            InputStream inputStream = new ByteArrayInputStream(data);
            DocFlavor flavor = DocFlavor.INPUT_STREAM.AUTOSENSE;
            PrintRequestAttributeSet pras = new HashPrintRequestAttributeSet();

            // Buscar la impresora por nombre
            PrintService[] printServices = PrintServiceLookup.lookupPrintServices(flavor, pras);
            PrintService selectedPrinter = null;

            // Seleccionar la impresora específica
            for (PrintService service : printServices) {
                if (service.getName().equalsIgnoreCase(printerName)) {
                    selectedPrinter = service;
                    break;
                }
            }

            // Imprimir si se encuentra la impresora
            if (selectedPrinter != null) {
                Doc doc = new SimpleDoc(inputStream, flavor, null);
                DocPrintJob job = selectedPrinter.createPrintJob();
                job.print(doc, pras);
                inputStream.close();
            } else {
                System.out.println("No se encontró la impresora: " + printerName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static enum PrintAlignment {
        LEFT("\u001B\u0061\u0000"),     // ESC a 0 - Alinear a la izquierda
        CENTER("\u001B\u0061\u0001"),   // ESC a 1 - Centrar
        RIGHT("\u001B\u0061\u0002");    // ESC a 2 - Alinear a la derecha

        private final String command;

        PrintAlignment(String command) {
            this.command = command;
        }

        public String getCommand() {
            return command;
        }
    }

    public static enum PrintFormat {
        BOLD_ON("\u001B\u0045\u0001"),      // ESC E 1 - Negrita activada
        BOLD_OFF("\u001B\u0045\u0000"),     // ESC E 0 - Negrita desactivada
        UNDERLINE_ON("\u001B\u002D\u0001"), // ESC - 1 - Subrayado activado
        UNDERLINE_OFF("\u001B\u002D\u0000"); // ESC - 0 - Subrayado desactivado

        private final String command;

        PrintFormat(String command) {
            this.command = command;
        }

        public String getCommand() {
            return command;
        }
    }

    public static class PrintLine {
        private String content;
        private PrintAlignment alignment;
        private PrintFormat format;

        public PrintLine(String content, PrintAlignment alignment, PrintFormat format) {
            this.content = content;
            this.alignment = alignment;
            this.format = format;
        }

        public PrintLine(String content, PrintAlignment alignment) {
            this.content = content;
            this.alignment = alignment;
        }

        public String getContent() {
            return content;
        }

        public PrintAlignment getAlignment() {
            return alignment;
        }

        public PrintFormat getFormat() {
            return format;
        }
    }
}
