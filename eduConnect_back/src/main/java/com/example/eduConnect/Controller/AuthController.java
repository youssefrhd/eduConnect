package com.example.eduConnect.Controller;

import com.example.eduConnect.Model.AuthRequest;
import com.example.eduConnect.Model.AuthResponse;

import com.example.eduConnect.Model.RegisterRequest;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Repositories.Emailrepo;
import com.example.eduConnect.Repositories.UserRepo;
import com.example.eduConnect.Service.EmailVerificationService;
import com.example.eduConnect.Service.JwtService;
import com.example.eduConnect.Service.UserService;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepo userRepo;
    private final Emailrepo tokenRepo;
    private final EmailVerificationService verificationService;

    public AuthController(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
            JwtService jwtService, UserService userService, UserRepo userRepo, Emailrepo tokenRepo,
            EmailVerificationService verificationService) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.verificationService = verificationService;
    }

    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            User user = userService.loadUser(request.getEmail());
            

            String token = jwtService.generateToken((User) user);

            return ResponseEntity
                    .ok(new AuthResponse(user.getId(), token, user.getEmail(), user.getRole(), user.getName()));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        System.out.println("entered in the Controller");
        if (userService.loadUser(request.getEmail())!=null) {
            return ResponseEntity.badRequest().body("You have already activated the Account !");
        }
       System.out.println(request.getEmail());
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setBirthday(request.getBirthday());
        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(false);

        userRepo.save(user);
       
        try {
        verificationService.sendVerificationEmail(user);
     } catch (Exception e) {
    e.printStackTrace();
}
        return ResponseEntity.ok("Check your email to verify your account");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {

        verificationService.verifyToken(token);

        return ResponseEntity.ok("Account activated successfully");
    }

    @PostMapping("/resend-email")
    public ResponseEntity<?> resendEmail(@RequestParam String email) {

        User user = userService.loadUser(email);
        verificationService.sendVerificationEmail(user);
        return ResponseEntity.ok("Check your email to verify your account");

    }

}
