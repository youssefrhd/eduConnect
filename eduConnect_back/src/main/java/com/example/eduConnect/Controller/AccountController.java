package com.example.eduConnect.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.eduConnect.Model.User;
import com.example.eduConnect.Service.UserService;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.mail.Multipart;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class AccountController {

    private final UserService userServ;
    
    public AccountController(UserService userServ) {
        this.userServ = userServ;
    }
    @PutMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(Authentication auth,String newPass) {
        if(auth==null || !auth.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
        }
        User user=(User) auth.getPrincipal();
        Long id=user.getId();
        userServ.updatePassword(id,newPass);
        return ResponseEntity.ok("the password has been chnaged successfully !");
    }
    @GetMapping("/me")
    public ResponseEntity<?> loadUser(
        Authentication auth){
            if(auth==null || !auth.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
          }
          UserDetails user=(UserDetails) auth.getPrincipal();
          User loadedUser=userServ.loadUser(user.getUsername());
          System.out.println(loadedUser);
          return ResponseEntity.ok(loadedUser);
        }
    @PutMapping(value = "/updatePic",consumes = "multipart/form-data")
    public ResponseEntity<?> updatePicture(Authentication auth,
        @Parameter(description = "upload the profile picture",schema =@Schema(type = "string",format = "binary",required = true)) @RequestPart("file") MultipartFile file ){
            
        if(auth==null || !auth.isAuthenticated()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("User isn't authentificated");
        }
        UserDetails ud=(UserDetails) auth.getPrincipal();
        User user=(User) ud;
        Long id=user.getId();
        userServ.updatePic(id, file);
        return ResponseEntity.ok("Profile Picture uploaded !");
        }

    
}
