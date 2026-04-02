package com.ai.invoice.service;

import com.ai.invoice.entity.ChatMessage;
import com.ai.invoice.entity.ChatSession;
import com.ai.invoice.repository.ChatMessageRepository;
import com.ai.invoice.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdvancedChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final OCRService ocrService;

    @Transactional
    public ChatSession createSession(String title) {
        ChatSession session = new ChatSession();
        session.setTitle(title != null && !title.isEmpty() ? title : "New Chat Session");
        return chatSessionRepository.save(session);
    }

    public List<ChatSession> getAllSessions() {
        return chatSessionRepository.findAllByOrderByCreatedAtDesc();
    }

    public ChatSession getSession(Long sessionId) {
        return chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));
    }

    public List<ChatMessage> getSessionMessages(Long sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void uploadDocument(Long sessionId, MultipartFile file) {
        try {
            String extractedText = ocrService.extractText(file);
            
            // Split text into chunks to avoid large vectors
            TokenTextSplitter splitter = new TokenTextSplitter();
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
            // IMPORTANT: Store sessionId as a String in metadata to ensure filter compatibility
            List<Document> documents = splitter.split(
                List.of(new Document(extractedText, Map.of("sessionId", String.valueOf(sessionId), "filename", filename)))
            );

            // Add chunks to the vector store
            vectorStore.add(documents);
            log.info("Added {} chunks to vector store for session {}", documents.size(), sessionId);
            
        } catch (Exception e) {
            log.error("Failed to process document for session {}", sessionId, e);
            throw new RuntimeException("Document processing failed", e);
        }
    }

    @Transactional
    public String askQuestion(Long sessionId, String question) {
        ChatSession session = getSession(sessionId);

        // 1. Save user question to history
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole("USER");
        userMsg.setContent(question);
        chatMessageRepository.save(userMsg);

        // 2. Retrieve relevant context from VectorStore using session metadata filter
        // We use SearchRequest with filterExpression to only match chunks from this session.
        SearchRequest searchRequest = SearchRequest.query(question)
                .withTopK(5)
                .withFilterExpression("sessionId == '" + sessionId + "'");
                
        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

        String contextText = "";
        if (similarDocuments != null && !similarDocuments.isEmpty()) {
            contextText = similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n---\n"));
        }

        // 3. Construct System Message with RAG context
        String systemPrompt = """
            You are an intelligent document assistant. Use the provided document context to answer the user's question accurately.
            If the answer cannot be found in the context, politely state that you do not have enough information based on the uploaded documents.
            Do not make up facts outside of the context.
            
            CONTEXT:
            %s
            """.formatted(contextText);

        SystemMessage systemMessage = new SystemMessage(systemPrompt);

        // 4. Fetch the previous 10 messages from session to provide chat history
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        // Take last 10 elements to prevent prompt explosion
        int startIndex = Math.max(0, history.size() - 10);
        List<Message> aiMessages = new ArrayList<>();
        aiMessages.add(systemMessage);
        
        for (int i = startIndex; i < history.size(); i++) {
            ChatMessage dbMsg = history.get(i);
            if ("USER".equals(dbMsg.getRole())) {
                aiMessages.add(new UserMessage(dbMsg.getContent()));
            } else if ("AI".equals(dbMsg.getRole())) {
                aiMessages.add(new AssistantMessage(dbMsg.getContent()));
            }
        }

        // The question is already added to `aiMessages` via history since we just saved it.
        // 5. Call LLM
        String aiResponse;
        try {
            aiResponse = chatClient.prompt()
                    .messages(aiMessages)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error communicating with AI: ", e);
            throw new RuntimeException("Failed to get AI response", e);
        }

        // 6. Save AI response
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setSession(session);
        aiMsg.setRole("AI");
        aiMsg.setContent(aiResponse);
        chatMessageRepository.save(aiMsg);

        return aiResponse;
    }
}
