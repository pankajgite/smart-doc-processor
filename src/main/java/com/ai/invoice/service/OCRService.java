package com.ai.invoice.service;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class OCRService {

    public String extractText(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType != null && contentType.startsWith("image")) {
                return extractTextFromImage(file);
            } else if (contentType != null && contentType.equals("application/pdf")) {
                return extractTextFromPdf(file);
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + contentType);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text: " + e.getMessage(), e);
        }
    }

    private String extractTextFromImage(MultipartFile file) throws IOException, TesseractException {
        // Ensuring we maintain the original extension so ImageIO/Tesseract knows the format
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; // Default to .png
        if (originalFilename != null && originalFilename.lastIndexOf(".") > 0) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        Path tempPath = Files.createTempFile("ocr_upload_", extension);
        File tempFile = tempPath.toFile();
        file.transferTo(tempFile);
        
        try {
            ITesseract tesseract = new Tesseract();
            // Since the CLI works, we'll try to explicitly use the default Windows installation path 
            // for tessdata if it exists, otherwise fallback to the local project folder.
            String programFilesTessData = "C:\\Program Files\\Tesseract-OCR\\tessdata";
            if (new File(programFilesTessData).exists()) {
                tesseract.setDatapath(programFilesTessData);
            } else {
                tesseract.setDatapath(System.getProperty("user.dir") + "/tessdata");
            }
            return tesseract.doOCR(tempFile);
        } finally {
            tempFile.delete();
        }
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        Path tempPath = Files.createTempFile("ocr_upload_pdf_", ".pdf");
        File tempFile = tempPath.toFile();
        file.transferTo(tempFile);
        
        try (PDDocument document = Loader.loadPDF(tempFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } finally {
            tempFile.delete();
        }
    }
}