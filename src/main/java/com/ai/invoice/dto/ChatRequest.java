package com.ai.invoice.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String context;
    private String question;
}
