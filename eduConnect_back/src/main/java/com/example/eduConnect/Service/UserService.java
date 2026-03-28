package com.example.eduConnect.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.eduConnect.Model.User;
import com.example.eduConnect.Model.UserInfos;
import com.example.eduConnect.Repositories.UserRepo;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class UserService{
    private final UserRepo userRepository;
    @Value("${uploadDir}")
    private String uploadDir;

   
    public User loadUser(String email) throws UsernameNotFoundException {
        Optional<User> user =userRepository.findByEmail(email);       
        return user.get();
    }


    public User updatePassword(Long id, String newPass) {
        User user=userRepository.findById(id)
                                   .orElseThrow(()-> new RuntimeException("No User found"));
        user.setPassword(newPass);
        userRepository.save(user);
        return user;   
    }

    public User updateUserInfos(Long userId,UserInfos userInf){
        User user=userRepository.findById(userId)
                        .orElseThrow(()->  new RuntimeException("Noo User found"));
        user.setBio(userInf.getBio());
        user.setCity(userInf.getCity());
        return userRepository.save(user);
    }

    public String updatePic(Long id,MultipartFile pic){
        User user=userRepository.findById(id)
                               .orElseThrow(()-> new RuntimeException("No user found"));
        Path uploadPath=Paths.get(uploadDir,"userID_"+String.valueOf(id),"picture");
        File directory=uploadPath.toFile();
        if(!directory.exists()){
            directory.mkdirs();
        }

        String filename=pic.getOriginalFilename();
        Path filePath=uploadPath.resolve(filename);
        try {
            pic.transferTo(filePath);
        }catch(IOException e){
            System.out.println("Ein Fehler bei Speicherung des Bilds !!");
            e.printStackTrace();
        }
        user.setPicture(filePath.toString());
        userRepository.save(user);
        return filePath.toString();
    }

    
    
}
