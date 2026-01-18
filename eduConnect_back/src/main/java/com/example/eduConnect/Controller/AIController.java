package com.example.eduConnect.Controller;

import com.example.eduConnect.Model.QuestionRequest;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Service.FileUploadService;
import com.example.eduConnect.Service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;


import org.springframework.ai.chat.client.ChatClient;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;


@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class AIController {

    private  final FileUploadService fileUploadService;

    private  final RagService ragService;

    private final ChatClient chatClient;

   @Value("${uploadDir}")
   private String uploadDir;

   public AIController(
            FileUploadService fileUploadService,
            RagService ragService,
            ChatClient.Builder chatClientBuilder
    ) {
        this.fileUploadService = fileUploadService;
        this.ragService = ragService;
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping(value="/uploadFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload the files")
    public ResponseEntity<String> uploadFile(
        @Parameter(
            description = "Enter the user ID ",
            example = "1",
            required = true
        )
        Authentication authentication,
                    @Parameter(
                    description = "PDF files to upload",
                    schema = @Schema(type = "string", format = "binary"),
                    required = true
            )
            @RequestPart("files") MultipartFile[] files){

        if(authentication==null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
        }
        User user=(User)authentication.getPrincipal();
        Long us_ID=user.getId();
        
        System.out.println("=== Upload startet ===");
        System.out.println("Anzahl Dateien: " + files.length);
        
        
        if (files.length == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("FEHLER: Keine Dateien ausgewählt!");
        }
        
        
        for (MultipartFile file : files) {
            System.out.println("Datei: " + file.getOriginalFilename() + 
                              " Größe: " + file.getSize() + 
                              " Typ: " + file.getContentType());
            
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("FEHLER: Die Datei '" + file.getOriginalFilename() + "' ist leer!");
            }
            
            if (!"application/pdf".equals(file.getContentType())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("FEHLER: Nur PDF-Dateien erlaubt!");
            }

            
        }
        
        try {
            System.out.println("Speichere Dateien...");
            
          
            fileUploadService.saveFiles(files,us_ID);
            System.out.println("Dateien gespeichert!");
           
           
            try {
                System.out.println("Starte RAG-Verarbeitung...");
                ragService.processFiles(files,us_ID,Instant.now().plus(10,ChronoUnit.MINUTES));
                System.out.println("RAG-Verarbeitung fertig!");
            } catch (Exception e) {
                System.err.println("ACHTUNG: RAG fehlgeschlagen: " + e.getMessage());
                
            }
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body( "✓ " + files.length + " Dateien erfolgreich hochgeladen!");
            
        } catch (IOException e) {
            System.err.println("Fehler beim Speichern:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body( "FEHLER beim Hochladen: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unerwarteter Fehler:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("UNBEKANNTER FEHLER: " + e.getMessage());
        }
    }


      @PostMapping(
        value = "/ask_question",
        consumes = {MediaType.APPLICATION_JSON_VALUE, "application/json"},
        produces = MediaType.APPLICATION_JSON_VALUE
)
@Operation(summary = "Ask the question based on uploaded files")
@io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Question request object",
        required = true,
        content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = QuestionRequest.class)
        )
)
public ResponseEntity<String> askQuestion(
    @Parameter(
        description = "Enter the User ID",
        example = "1",
        required = true
    )
    Authentication authentication,
        @org.springframework.web.bind.annotation.RequestBody QuestionRequest request
) {

    if(authentication==null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
        }
        User user=(User)authentication.getPrincipal();
        Long us_ID=user.getId();
    try {

        
        if (request == null ||
            request.getQuestion() == null ||
            request.getQuestion().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Error: Question cannot be empty");
        }

        
        String answer = ragService.askQuestion(us_ID,
                request.getQuestion(),
                chatClient   
        );

        
        return ResponseEntity.ok(answer);

    } catch (Exception e) {
        e.printStackTrace();

        String errorMsg = "Error processing question: "
                + e.getClass().getSimpleName()
                + " - "
                + e.getMessage();

        if (e.getCause() != null) {
            errorMsg += " | Cause: "
                    + e.getCause().getClass().getSimpleName()
                    + " - "
                    + e.getCause().getMessage();
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorMsg);
    }
}

@PostMapping(value = "/chatWithFiles", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@Operation(summary = "Chat with files")
public ResponseEntity<String> chatWithFiles(
        @Parameter(
            description = "PDF files to upload",
            schema = @Schema(type = "string", format = "binary"),
            required = true
        )
        @RequestPart("files") MultipartFile[] files,
        
        @Parameter(
            description = "The question to ask",
            required = true
        )
        @RequestParam("question") String question,
    @Parameter(
        description = "Enter the User ID",
        example = "1",
        required = true
    )
    Authentication authentication) {

        if(authentication==null || !authentication.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
        }
        User user=(User)authentication.getPrincipal();
        Long us_ID=user.getId();

    System.out.println("=== chatWithFiles called ===");
    System.out.println("Question: " + question);
    System.out.println("Number of files: " + files.length);
    
    
    if (files.length == 0) {
        return ResponseEntity.badRequest()
                .body("ERROR: No files selected!");
    }
    
    for (MultipartFile file : files) {
        System.out.println("File: " + file.getOriginalFilename() + 
                          " Size: " + file.getSize() + 
                          " Type: " + file.getContentType());
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("ERROR: File '" + file.getOriginalFilename() + "' is empty!");
        }
        
        if (!"application/pdf".equals(file.getContentType())) {
            return ResponseEntity.badRequest()
                    .body("ERROR: Only PDF files allowed!");
        }
    }
    
    try {
        System.out.println("Saving files...");
        
        
        fileUploadService.saveFiles(files,us_ID);
        System.out.println("Files saved!");
        
       
        try {
            System.out.println("Starting RAG processing...");
            ragService.processFiles(files,us_ID,Instant.now().plus(14,ChronoUnit.DAYS));
            System.out.println("RAG processing complete!");
        } catch (Exception e) {
            System.err.println("WARNING: RAG failed: " + e.getMessage());
           
        }
        
        
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Error: Question cannot be empty");
        }
        
        System.out.println("Asking question to AI...");
        
        
        String answer = ragService.askQuestion(us_ID,question, chatClient);
        
        System.out.println("Answer received!");
        return ResponseEntity.ok(answer);
        
    } catch (IOException e) {
        System.err.println("Error saving files:");
        e.printStackTrace();
        
        
        if (e.getMessage().contains("FileAlreadyExistsException")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("ERROR: A file with the same name already exists. Please rename your file or upload a different one.");
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("ERROR uploading files: " + e.getMessage());
    } catch (Exception e) {
        System.err.println("Unexpected error:");
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("ERROR: " + e.getMessage());
    }
}


}