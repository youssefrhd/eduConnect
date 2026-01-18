package com.example.eduConnect.Model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;



@Entity
@Table(
    name="users",
    schema="public",
    uniqueConstraints={
        @UniqueConstraint(columnNames = "email")
    }
    
)
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false,length = 255 , unique = true)
    private String email;

    @Column(nullable = false,length = 255)
    private String name;

    @Column(length = 50)
    private String role="USER";

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 15)
    private String handynummer;

    @Column (nullable = false)
    private boolean emailVerified=false;

    @Column (nullable=false)
    private LocalDate birthday;

     @Column(nullable = false)
    private Instant createdAt = Instant.now();

     @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FileEntity> files = new ArrayList<>();

     public Long getId() {
         return userId;
     }

     public Boolean getEmailVerified() {
        return emailVerified;
    }

     public void setEmailVerified(Boolean emailVerified) {
         this.emailVerified = emailVerified;
     }

     
     public String getEmail() {
         return email;
     }

     public void setEmail(String email) {
         this.email = email;
     }

     public String getName() {
         return name;
     }

     public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

     public LocalDate getBirthday() {
         return birthday;
     }

     public void setBirthday(LocalDate birthday) {
         this.birthday = birthday;
     }

     public void setName(String name) {
         this.name = name;
     }

     public String getRole() {
         return role;
     }

     public void setRole(String role) {
         this.role = role;
     }

     public String getHandynummer() {
         return handynummer;
     }

     public void setHandynummer(String handynummer) {
         this.handynummer = handynummer;
     }

     public Instant getCreatedAt() {
         return createdAt;
     }

     public void setCreatedAt(Instant createdAt) {
         this.createdAt = createdAt;
     }

      @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + getRole()));
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
    
}
