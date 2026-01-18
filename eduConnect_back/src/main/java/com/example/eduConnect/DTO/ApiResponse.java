package com.example.eduConnect.DTO;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private String message;
    private T data;
    private boolean success;
    private LocalDateTime timestamp;
    
    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
        this.success = true;
        this.timestamp = LocalDateTime.now();
    }
    
    public String getMessage() { return message; }
    public T getData() { return data; }
    public boolean isSuccess() { return success; }
    public LocalDateTime getTimestamp() { return timestamp; }
}