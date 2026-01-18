package com.example.eduConnect.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class FileUploadService {

    @Value("${uploadDir}")
    private String uploadDir;

    public void saveFiles(MultipartFile[] files) throws IOException {

        Path uploadpath= Paths.get(uploadDir);
        if(!Files.exists(uploadpath)){
            Files.createDirectories(uploadpath);
        }

        Stream.of(files).filter(f->!f.isEmpty()).forEach(f-> {
            try {
                Files.copy(f.getInputStream(),uploadpath.resolve(f.getOriginalFilename()));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public void saveFiles(MultipartFile[] files,Long user_id) throws IOException {
        
        Path uploadpath= Paths.get(uploadDir,"userID_"+String.valueOf(user_id));
        if(!Files.exists(uploadpath)){
            Files.createDirectories(uploadpath);
        }

        Stream.of(files).filter(f->!f.isEmpty()).forEach(f-> {
            String hashedName=UUID.randomUUID()+"_"+f.getOriginalFilename();
            try {
                Files.copy(f.getInputStream(),uploadpath.resolve(hashedName),StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

   


}
