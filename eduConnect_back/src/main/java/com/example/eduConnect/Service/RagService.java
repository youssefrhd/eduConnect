package com.example.eduConnect.Service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import com.example.eduConnect.Repositories.UserRepo;

import java.io.IOException;
import java.io.InputStream;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;

import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Service
public class RagService {
    private final SimpleVectorStore simpleVectorStore;
    private final Set<String> embeddedDocHashes = ConcurrentHashMap.newKeySet();
    private final UserDocService userdDocService;
    private final UserRepo userRepo;

    public RagService(OllamaEmbeddingModel openAiEmbeddingModel,UserDocService userDocService,UserRepo userRepo) {

        this.simpleVectorStore=SimpleVectorStore.builder(openAiEmbeddingModel)
                .build();
                this.userdDocService=userDocService;
                this.userRepo=userRepo;
    }
    public void processFiles(MultipartFile[] files,String uploadDir) throws IOException {
       
        
        for(MultipartFile file : files){
            if(!file.isEmpty()){
                String text = extractTextFromPdf(file);
                List<String> chunks = splitText(text, 500);
                storeText(chunks);
            }
        }
    }

    private void storeText(List<String> chunks) {
        List<Document> documents=chunks.stream()
                .map(Document::new)
                .collect(Collectors.toList());
        simpleVectorStore.accept(documents);
    }
    
      public String askQuestion(String question, ChatClient chatClient) {
        try {
        List<Document> docs = simpleVectorStore.similaritySearch(question);

        if (docs.isEmpty()) {
            return "Keine Dokumente gefunden. Bitte lade zuerst PDFs hoch.";
        }

        
        List<Document> topDocs = docs.size() > 5 ? docs.subList(0, 5) : docs;

        StringBuilder context = new StringBuilder();
        for (Document doc : topDocs) {
            context.append(doc.getText()).append("\n");
        }

        String promptText =
                "Antworte auf Deutsch und NUR basierend auf dem folgenden Kontext.\n\n" +
                "Kontext:\n" +
                context +
                "\nFrage:\n" +
                question +
                "\n\nAntwort:";

        
        String answer = chatClient
                .prompt()
                .system("Du bist ein hilfreicher KI-Assistent für Studenten.")
                .user(promptText)
                .call()
                .content();

        return answer;

    } catch (Exception e) {
        e.printStackTrace();
        return "Fehler bei der Beantwortung der Frage: " + e.getMessage();
    }
}
    
public void processFiles(MultipartFile[] files,
                         Long userId,
                         Instant expiresAt) {

    Stream.of(files)
        .filter(file -> !file.isEmpty())
        .filter(file -> MediaType.APPLICATION_PDF_VALUE
                .equalsIgnoreCase(file.getContentType()))
        .forEach(file -> {
            try {
                
                String docHash = computePdfHash(file);

                
                if (!embeddedDocHashes.contains(docHash)) {

                    
                    String text = extractTextFromPdf(file);

                    
                    List<String> chunks = splitText(text, 500);

                    
                    storeTextWithMetadata(chunks, docHash);

                    
                    embeddedDocHashes.add(docHash);

                    System.out.println("Processed new doc: " + docHash);
                } else {
                    System.out.println("Doc already embedded: " + docHash);
                }

               
                this.userdDocService.linkUserToDoc(
                        userId,
                        docHash,
                        expiresAt,
                        file.getOriginalFilename()
                );

            } catch (Exception e) {
                System.err.println(
                    "Failed processing file " + file.getOriginalFilename()
                    + ": " + e.getMessage()
                );
            }
        });
}


private void storeTextWithMetadata(List<String> chunks, String docHash) {
    List<Document> documents = IntStream.range(0, chunks.size())
            .mapToObj(i -> new Document(
                    chunks.get(i),
                    Map.of(
                        "docHash", docHash,
                        "chunkIndex", i
                    )
            ))
            .collect(Collectors.toList());

    simpleVectorStore.accept(documents);
}




    public String computePdfHash(MultipartFile file) throws IOException {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");

        try (InputStream is = file.getInputStream()) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = is.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
        }

        return HexFormat.of().formatHex(digest.digest());

    } catch (NoSuchAlgorithmException e) {
        throw new RuntimeException(e);
    }
}



public String askQuestion(
        Long userId,
        String question,
        ChatClient chatClient
) {
    try {
        List<String> allowedDocHashes =userdDocService.getActiveDocHashesForUser(userId);

        if (allowedDocHashes.isEmpty()) {
            return "Du hast noch keine Dokumente hochgeladen.";
        }

       String filter = allowedDocHashes.stream()
        .map(h -> "docHash == '" + h + "'")
        .collect(Collectors.joining(" OR "));


         SearchRequest request = SearchRequest.builder()
        .query(question)
        .topK(5)
        .filterExpression(filter)
        .build();

        List<Document> docs = simpleVectorStore.similaritySearch(request);


        if (docs.isEmpty()) {
            return "Keine relevanten Inhalte in deinen Dokumenten gefunden.";
        }

        StringBuilder context = new StringBuilder();
        for (Document doc : docs) {
            context.append(doc.getText()).append("\n");
        }

        String promptText =
                "Antworte auf Deutsch und NUR basierend auf dem folgenden Kontext.\n\n" +
                "Kontext:\n" + context +
                "\nFrage:\n" + question +
                "\n\nAntwort:";

        return chatClient.prompt()
                .system("Du bist ein hilfreicher KI-Assistent für Studenten.")
                .user(promptText)
                .call()
                .content();

    } catch (Exception e) {
        e.printStackTrace();
        return "Fehler bei der Beantwortung der Frage: " + e.getMessage();
    }
}



    private List<String> splitText(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        for(int i = 0; i < text.length(); i += chunkSize){
            int end = Math.min(text.length(), i + chunkSize);
            chunks.add(text.substring(i, end));
        }
        return chunks;
    }
    
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument doc = PDDocument.load(file.getInputStream())){
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

}
