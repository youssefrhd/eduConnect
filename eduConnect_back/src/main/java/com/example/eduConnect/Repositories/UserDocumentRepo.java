package com.example.eduConnect.Repositories;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.eduConnect.Model.UserDocument;

public interface UserDocumentRepo extends JpaRepository<UserDocument,Long> {
    Optional<UserDocument> findByUserIdAndDocHash(Long userId, String docHash);

    @Query("""
        SELECT ud.docHash
        FROM UserDocument ud
        WHERE ud.user.id=:userId
        AND ud.expiresAt > CURRENT_TIMESTAMP
    """)
    List<String> findActiveDocHashesByUser(@Param("userId") Long userId);

    void deleteByExpiresAtBefore(Instant now);

    long countByDocHash(String docHash);
    List<UserDocument>findAllByExpiresAtBefore(Instant now);
}
