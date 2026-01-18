package com.example.eduConnect.Model;

import java.time.Instant;

import jakarta.persistence.*;


@Entity
@Table(
    name="user_docs",
    uniqueConstraints= {
        @UniqueConstraint(columnNames = {"user_id","doc_hash"})
    }
)
public class UserDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;


    @Column(name = "doc_hash",nullable = false,length = 64)
    private String docHash;

    
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "filename",nullable = false)
    private String filename;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDocHash() { return docHash; }
    public void setDocHash(String docHash) { this.docHash = docHash; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public String getFilename() {
        return filename;
    }
    public void setFilename(String filename) {
        this.filename = filename;
    }


    
}
