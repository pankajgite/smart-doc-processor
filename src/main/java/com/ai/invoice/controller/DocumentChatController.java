package com.ai.invoice.controller;

import com.ai.invoice.dto.ChatRequest;
import com.ai.invoice.service.OCRService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class DocumentChatController {

    private final OCRService ocrService;
    private final ChatClient chatClient;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocuments(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No files provided"));
        }

        StringBuilder combinedText = new StringBuilder();
        for (MultipartFile file : files) {
            try {
                String text = ocrService.extractText(file);
                combinedText.append("--- Document: ").append(file.getOriginalFilename()).append(" ---\n");
                combinedText.append(text).append("\n\n");
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process file " + file.getOriginalFilename() + ": " + e.getMessage()));
            }
        }

        return ResponseEntity.ok(Map.of("context", combinedText.toString()));
    }

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody ChatRequest request) {
        if (request.getContext() == null || request.getContext().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Context is missing. Please upload documents first."));
        }
        if (request.getQuestion() == null || request.getQuestion().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty."));
        }

        String prompt = """
            You are an intelligent document assistant. Use the provided document context to answer the user's question accurately.
            If the answer cannot be found in the context, politely state that you do not have enough information based on the uploaded documents.
            Do not make up facts outside of the context.

            CONTEXT:
            %s

            QUESTION:
            %s
            """.formatted(request.getContext(), request.getQuestion());

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return ResponseEntity.ok(Map.of("answer", response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get an answer from AI: " + e.getMessage()));
        }
    }
}
