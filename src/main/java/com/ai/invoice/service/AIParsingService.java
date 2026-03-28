package com.ai.invoice.service;

import com.ai.invoice.dto.InvoiceDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIParsingService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public InvoiceDTO extractInvoice(String ocrText) {
        log.info("OCR TEXT: {}", ocrText);

        String prompt = """
            You are an AI that extracts structured data from invoice text.

            Extract the following fields:
            - invoiceNumber
            - vendorName
            - gstNumber
            - totalAmount
            - gstAmount
            - invoiceDate

            Rules:
            - Return ONLY valid JSON
            - Do NOT add explanations
            - If value not found, return null
            - Ensure numbers are numeric (no symbols like ₹ or $)

            Example output:
            {
              "invoiceNumber": "INV-123",
              "vendorName": "ABC Pvt Ltd",
              "gstNumber": "27ABCDE1234F1Z5",
              "totalAmount": 12000,
              "gstAmount": 1800,
              "invoiceDate": "2025-03-20"
            }
            
            Text:
            """ + ocrText;

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
                    
            log.info("AI RESPONSE: {}", response);

            return convertToDTO(response);
        } catch (Exception e) {
            log.error("AI Extraction failed", e);
            throw new RuntimeException("Failed to process AI response: " + e.getMessage(), e);
        }
    }

    public InvoiceDTO convertToDTO(String response) {
        try {
            String cleanJson = cleanJson(response);
            return objectMapper.readValue(cleanJson, InvoiceDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("AI response parsing failed. Cleaned JSON: " + cleanJson(response), e);
        }
    }

    public String cleanJson(String response) {
        if (response == null) return "{}";
        int start = response.indexOf("{");
        int end = response.lastIndexOf("}");
        if (start != -1 && end != -1 && end > start) {
            return response.substring(start, end + 1);
        }
        return response;
    }
}
