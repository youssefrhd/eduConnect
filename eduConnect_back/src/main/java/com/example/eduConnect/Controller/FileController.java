package com.example.eduConnect.Controller;


import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.eduConnect.DTO.FileDTO;
import com.example.eduConnect.Model.FileEntity;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Repositories.FileRepository;
import com.example.eduConnect.Service.FileService;
import com.example.eduConnect.Service.FileUploadService;
import com.example.eduConnect.Service.JwtService;
import com.example.eduConnect.Service.RagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins ="http://localhost:4200")
public class FileController {

    @Value("${uploadDir}")
    private String uploadDir;
    
    private final FileRepository fileRepository;
    private final RagService ragService;
    private final FileService fileService;
    private final JwtService jwtService;

    


     public FileController(FileRepository fileRepository, RagService ragService, FileService fileService,
            JwtService jwtService) {
        this.fileRepository = fileRepository;
        this.ragService = ragService;
        this.fileService = fileService;
        this.jwtService = jwtService;
    }

     @SecurityRequirement(name = "bearerAuth") 
     @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     @Operation(summary = "Upload files")
     public ResponseEntity<List<FileDTO>> uploadFiles(
        @Parameter(description = "PDF files to upload", schema = @Schema(type = "string", format = "binary"))
        @RequestPart("files") MultipartFile[] files,
        @RequestParam(value = "course", required = false) String course,
        Authentication authentication) {

    if (authentication == null || !authentication.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    User user = (User) authentication.getPrincipal();

    if (files.length == 0) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    List<FileDTO> uploadedFiles = new ArrayList<>();

    try {
        uploadedFiles = fileService.saveFiles(files, course, user);

        try {
            ragService.processFiles(files, user.getId(), Instant.now().plus(3, ChronoUnit.HOURS));
        } catch (Exception e) {
            System.err.println("WARNING: RAG failed: " + e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedFiles);

    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

  @SecurityRequirement(name = "bearerAuth") 
    @GetMapping("/my-files")
    @Operation(summary = "Get user's files")
    public List<FileDTO> getUserFiles(Authentication auth) {
        User user=(User)auth.getPrincipal();
        return fileService.getFilesByUsername(user);
    }
  @SecurityRequirement(name = "bearerAuth") 
    @DeleteMapping("/delete")
    @Operation(summary = "Delete files")
    public ResponseEntity<String> deleteFiles(
            @RequestParam List<Long> fileIds,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        String username = user.getUsername();
        
        try {
            fileService.deleteFiles(fileIds, username);
            return ResponseEntity.ok("Files deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting files: " + e.getMessage());
        }
    }
  @SecurityRequirement(name = "bearerAuth") 
    @PutMapping("/rename/{fileId}")
    @Operation(summary = "Rename a file")
    public FileDTO renameFile(
            @PathVariable Long fileId,
            @RequestParam String newName,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        String username = user.getUsername();
        
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }

        file.setDisplayName(newName);
        file = fileRepository.save(file);

        return convertToDTO(file);
    }
  @SecurityRequirement(name = "bearerAuth") 
    @GetMapping("/download/{fileId}")
    @Operation(summary = "Download a file")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        User user = (User) authentication.getPrincipal();
        String username = user.getUsername();
        
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            Path filePath = Paths.get(file.getFilePath());
            UrlResource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + file.getDisplayName() + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private FileDTO convertToDTO(FileEntity entity) {
        FileDTO dto = new FileDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getDisplayName());
        dto.setType(entity.getFileType());
        dto.setSize(formatFileSize(entity.getFileSize()));
        dto.setUploaded(formatUploadDate(entity.getUploadDate()));
        dto.setCourse(entity.getCourse());
        dto.setStatus("active");
        return dto;
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.1f KB", size / 1024.0);
        return String.format("%.1f MB", size / (1024.0 * 1024.0));
    }

    private String formatUploadDate(Date date) {
        long diff = System.currentTimeMillis() - date.getTime();
        long days = diff / (1000 * 60 * 60 * 24);
        
        if (days == 0) return "Today";
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        if (days < 30) return (days / 7) + " weeks ago";
        return (days / 30) + " months ago";
    }

}