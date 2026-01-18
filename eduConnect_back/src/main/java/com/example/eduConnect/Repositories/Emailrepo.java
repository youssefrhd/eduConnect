package com.example.eduConnect.Repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eduConnect.Model.EmailVerificationToken;
import com.example.eduConnect.Model.User;

@Repository
public interface Emailrepo extends JpaRepository<EmailVerificationToken, Long>  {

    Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByUser(User user);

    void deleteByUser(User user);
    
}
