package com.example.eduConnect.Service;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;


@Service
public class MailService {

       private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

 public void sendVerificationEmail(String to, String token) {

    String link = frontendUrl + "/activation-success?token=" + token;

    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Verify your EduConnect account");
        helper.setFrom("no-reply@educonnect.com");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f6f8;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: auto;
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h2 {
                        color: #2c3e50;
                    }
                    p {
                        color: #555;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to EduConnect 🎓</h2>
                    <p>
                        Thank you for registering! Please verify your email
                        address to activate your account.
                    </p>

                    <a href="%s" class="button">Verify Email</a>

                    <p>
                        If the button doesn't work, copy and paste this link
                        into your browser:
                    </p>
                    <p><a href="%s">%s</a></p>

                    <div class="footer">
                        <p>
                            If you did not create this account, you can safely
                            ignore this email.
                        </p>
                        <p>© 2026 EduConnect</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(link, link, link);

        helper.setText(htmlContent, true);

        mailSender.send(message);

    } catch (Exception e) {
        throw new RuntimeException("Failed to send verification email", e);
    }
}

    
}
