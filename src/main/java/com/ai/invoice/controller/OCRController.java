package com.ai.invoice.controller;

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
@RequestMapping("/ocr")
@RequiredArgsConstructor
public class OCRController {

    private final OCRService ocrService;

    @PostMapping("/extract")
    public ResponseEntity<Map<String, String>> extractText(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please upload a file"));
        }

        try {
            String extractedText = ocrService.extractText(file);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "text", extractedText
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
