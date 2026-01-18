package com.example.eduConnect.Service;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.eduConnect.DTO.FileDTO;
import com.example.eduConnect.Model.FileEntity;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Repositories.FileRepository;

@Service
public class FileService {
    @Value("${uploadDir}")
    private String uploadDir;
    
    private final FileRepository fileRepository;
    
    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    public List<FileDTO> saveFiles(MultipartFile[] files, String course, User user) throws IOException {
        Path uploadPath = Paths.get(uploadDir, "userID_" + user.getId());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

       List<FileDTO> uploadedFiles = new ArrayList<>();
        for (MultipartFile f : files) {
            if (!f.isEmpty()) {
                String hashedName = UUID.randomUUID() + "_" + f.getOriginalFilename();
                Path destination = uploadPath.resolve(hashedName);
                
                Files.copy(f.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                
                FileEntity fileEntity = new FileEntity();
                fileEntity.setDisplayName(f.getOriginalFilename());
                fileEntity.setFileName(hashedName);
                fileEntity.setFilePath(destination.toString());
                fileEntity.setFileType(getFileType(f.getOriginalFilename()));
                fileEntity.setFileSize(f.getSize());
                fileEntity.setCourse(course);
                fileEntity.setUser(user);
                fileEntity.setUploadDate(new Date());

                uploadedFiles.add(convertToDTO(fileEntity));
                fileRepository.save(fileEntity);
            }
        }
        return uploadedFiles;
    }


    public List<FileDTO> getFilesByUsername(User user) {
        List<FileEntity> files = fileRepository.findByUser(user);
        return files.stream()
                   .map(this::convertToDTO)
                   .collect(Collectors.toList());
    }
    public Long getTotalFileSizeForUser(User user) {
    return fileRepository.sumFileSizeByEmail(user.getEmail());
}
    
    public void deleteFiles(List<Long> fileIds, String username) throws AccessDeniedException {
        for (Long fileId : fileIds) {
            FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
            
            
            if (!file.getUser().getUsername().equals(username)) {
                throw new AccessDeniedException("You don't have permission to delete this file");
            }
            
            try {
                Files.deleteIfExists(Paths.get(file.getFilePath()));
            } catch (IOException e) {
              
            }
            
           
            fileRepository.delete(file);
        }
    }
    
    private String getFileType(String filename) {
        if (filename == null) return "FILE";
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".pdf")) return "PDF";
        if (lowerFilename.endsWith(".doc") || lowerFilename.endsWith(".docx")) return "DOCX";
        if (lowerFilename.endsWith(".ppt") || lowerFilename.endsWith(".pptx")) return "PPTX";
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg") || 
            lowerFilename.endsWith(".png") || lowerFilename.endsWith(".gif")) return "IMAGE";
        return "FILE";
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