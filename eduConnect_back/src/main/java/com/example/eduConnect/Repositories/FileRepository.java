package com.example.eduConnect.Repositories;

import com.example.eduConnect.Model.FileEntity;
import com.example.eduConnect.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUser(User user);
    List<FileEntity> findByUser_Email(String email);
    List<FileEntity> findByUserId(Long userId);
    
    Optional<FileEntity> findByIdAndUser_Email(Long id, String email);
    
    List<FileEntity> findByIdInAndUser_Email(List<Long> ids, String email);
    
    List<FileEntity> findByFileTypeAndUser_Email(String fileType, String email);
    
    List<FileEntity> findByCourseAndUser_Email(String course, String email);
    
    long countByUser_Email(String email);
    
    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileEntity f WHERE f.user.email = :email")
    Long sumFileSizeByEmail(@Param("email") String email);
    
    
    void deleteByIdInAndUser_Email(List<Long> ids, String email);
}