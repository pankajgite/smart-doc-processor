package com.ai.invoice.controller;

import com.ai.invoice.dto.ChatRequest;
import com.ai.invoice.entity.ChatMessage;
import com.ai.invoice.entity.ChatSession;
import com.ai.invoice.service.AdvancedChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/chat")
@RequiredArgsConstructor
public class AdvancedChatController {

    private final AdvancedChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createSession(@RequestParam(required = false) String title) {
        return ResponseEntity.ok(chatService.createSession(title));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        return ResponseEntity.ok(chatService.getAllSessions());
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSessionDetails(@PathVariable Long sessionId) {
        ChatSession session = chatService.getSession(sessionId);
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(Map.of(
            "session", session,
            "messages", messages
        ));
    }

    @PostMapping("/sessions/{sessionId}/upload")
    public ResponseEntity<?> uploadToSession(@PathVariable Long sessionId, @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        try {
            chatService.uploadDocument(sessionId, file);
            return ResponseEntity.ok(Map.of("message", "Document uploaded and indexed successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/ask")
    public ResponseEntity<?> askSession(@PathVariable Long sessionId, @RequestBody ChatRequest request) {
        if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty."));
        }
        try {
            String answer = chatService.askQuestion(sessionId, request.getQuestion());
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
