package com.example.eduConnect.Service;
import java.time.Instant;
import java.util.List;


import com.example.eduConnect.Model.User;
import com.example.eduConnect.Model.UserDocument;
import com.example.eduConnect.Repositories.UserDocumentRepo;
import com.example.eduConnect.Repositories.UserRepo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDocService {
    
    @Value("${uploadDir}")
    private String uploadDir;

    private final UserDocumentRepo documentRepo;
    private final UserRepo userRepo;

    public UserDocService(UserDocumentRepo repository,UserRepo userRepo) {
        this.documentRepo= repository;
        this.userRepo=userRepo;
    }

    public void linkUserToDoc(Long userId, String docHash, Instant expiresAt,String filename) {

        User user = userRepo.findById(userId)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found: " + userId));
        documentRepo.findByUserIdAndDocHash(Long.valueOf(userId), docHash)
                .ifPresentOrElse(existing -> {
                    if (existing.getExpiresAt().isBefore(expiresAt)) {
                        existing.setExpiresAt(expiresAt);
                        documentRepo.save(existing);
                    }
                }, () -> {
                    
                    UserDocument doc = new UserDocument();
                    doc.setUser(user);
                    doc.setDocHash(docHash);
                    doc.setExpiresAt(expiresAt);
                    doc.setFilename(filename);
                    documentRepo.save(doc);
                });
    }

     @Transactional(readOnly = true)
    public List<String> getActiveDocHashesForUser(Long userId) {
        return documentRepo.findActiveDocHashesByUser(userId);
    }

    @Transactional
    @Scheduled(cron = "0 0 * * * ?")
    public void cleanupExpiredLinks() {
        Instant now = Instant.now();
        List<UserDocument> expiredDocs =
                documentRepo.findAllByExpiresAtBefore(now);
        documentRepo.deleteByExpiresAtBefore(now);
    }

}

