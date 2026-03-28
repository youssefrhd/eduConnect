package com.example.eduConnect.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import com.example.eduConnect.Model.User;
import com.example.eduConnect.Model.UserInfos;
import com.example.eduConnect.Repositories.UserRepo;

public class UpdateUserServ {
    @Value("${uploadDir}")
    private String uploadDir;
    private final UserRepo userRepo;

    public UpdateUserServ(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    
}
