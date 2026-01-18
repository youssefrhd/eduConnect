package com.example.eduConnect.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request object for asking a question")
public class QuestionRequest {
    
    @Schema(description = "The question to ask about the uploaded files", example = "What is the main topic?")
    private String question;

    public QuestionRequest() {
    }

    public QuestionRequest(String question) {
        this.question = question;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}

