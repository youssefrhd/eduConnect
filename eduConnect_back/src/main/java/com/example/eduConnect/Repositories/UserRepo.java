package com.example.eduConnect.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.eduConnect.Model.User;

public interface UserRepo extends JpaRepository<User,Long> {
    @Query("select u from User u where u.email=?1")
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    
}
