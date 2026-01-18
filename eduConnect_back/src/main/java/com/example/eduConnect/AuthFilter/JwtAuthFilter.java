package com.example.eduConnect.AuthFilter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.eduConnect.Model.User;
import com.example.eduConnect.Service.CustomUserDetailsService;
import com.example.eduConnect.Service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Autowired
    public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("🔵 JWT FILTER - Processing: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("🔴 NO Bearer token found for: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        System.out.println("🟢 Bearer token found, length: " + jwt.length());

        try {
            
            String username = jwtService.extractUsername(jwt);
            System.out.println("🟡 Extracted username from token: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("🟡 Loading user details for username: " + username);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                System.out.println("🟡 Validating token...");
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    System.out.println("✅ Token is VALID for user: " + username);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("✅ Authentication SET for user: " + username);
                } else {
                    System.out.println("🔴 Token is INVALID for user: " + username);
                }
            } else {
                if (username == null) {
                    System.out.println("🔴 Could not extract username from token");
                } else {
                    System.out.println("🟡 Username extracted but auth already exists or is null");
                }
            }
        } catch (Exception e) {
            System.err.println("🔴 ERROR in JWT filter: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}
