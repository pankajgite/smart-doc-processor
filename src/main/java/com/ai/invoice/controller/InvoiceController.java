package com.ai.invoice.controller;

import com.ai.invoice.dto.InvoiceDTO;
import com.ai.invoice.service.AIParsingService;
import com.ai.invoice.service.OCRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final OCRService ocrService;
    private final AIParsingService aiParsingService;

    @PostMapping("/extract")
    public ResponseEntity<?> extractInvoice(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please upload a file"));
        }

        try {
            // Step 1: Extract text from the image/PDF
            String ocrText = ocrService.extractText(file);

            // If the text is empty, the OCR failed or the document is blank
            if (ocrText == null || ocrText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not extract text from document"));
            }

            // Step 2: Pass the text to AI to get structured JSON
            InvoiceDTO structuredData = aiParsingService.extractInvoice(ocrText);

            return ResponseEntity.ok(structuredData);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Extraction failed: " + e.getMessage()));
        }
    }
}
