package com.ai.invoice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "forward:/main.html";
    }

    @GetMapping("/chat")
    public String chat() {
        return "forward:/main.html";
    }
}
