package com.example.eduConnect;


import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EduConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(EduConnectApplication.class, args);
	}

	   @Bean
    CommandLineRunner testOllama(OllamaChatModel chatModel) {
        return args -> {
            System.out.println(" Testing TinyLlama integration...");
            
            try {
                
                System.out.println("Testing connection to Ollama...");
                
                String response = chatModel.call("Say 'Hello from Spring Boot!'");
                System.out.println("Success! Response: " + response);
            } catch (Exception e) {
                System.err.println("Failed to connect to Ollama!");
                System.err.println("Error: " + e.getMessage());
                System.err.println("\nTroubleshooting steps:");
                System.err.println("1. Make sure Ollama is running: ollama serve");
                System.err.println("2. Verify model exists: ollama list");
                System.err.println("3. If missing: ollama pull tinyllama");
                System.err.println("4. Check Spring AI configuration for model name");
            }
        };
    }

}
