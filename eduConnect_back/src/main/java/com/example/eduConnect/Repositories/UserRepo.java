package com.example.eduConnect.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.eduConnect.Model.User;

public interface UserRepo extends JpaRepository<User,Long> {

    Optional<UserDetails> findByEmail(String email);
    Optional<User> findById(Long id);
    
}
