package com.example.eduConnect.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.eduConnect.Model.EmailVerificationToken;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Repositories.Emailrepo;
import com.example.eduConnect.Repositories.UserRepo;

@Service
public class EmailVerificationService {

      private final Emailrepo tokenRepo;
    private final UserRepo userRepo;
    private final MailService mailService;

    public EmailVerificationService(Emailrepo tokenRepo, UserRepo userRepo, MailService mailService) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
        this.mailService = mailService;
    }

    private static final Duration EXPIRATION = Duration.ofHours(1);

    public void sendVerificationEmail(User user) {

        
        tokenRepo.findByUser(user).ifPresent(tokenRepo::delete);

        EmailVerificationToken token = new EmailVerificationToken(null, user, null);
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(Instant.now().plus(EXPIRATION));

        tokenRepo.save(token);

        mailService.sendVerificationEmail(
                user.getEmail(),
                token.getToken()
        );
    }

    public void verifyToken(String tokenValue) {

        EmailVerificationToken token = tokenRepo.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepo.save(user);

        tokenRepo.delete(token);
    }
    
}
