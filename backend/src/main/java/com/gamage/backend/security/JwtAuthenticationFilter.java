
package com.gamage.backend.security;

import com.gamage.backend.entity.AppUser;
import com.gamage.backend.repository.AppUserRepository;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AppUserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AppUserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Bearer header present: "
                + (header != null && header.startsWith("Bearer ")));

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            String email = jwtService.extractEmail(token);

            System.out.println("JWT validated successfully");

            Optional<AppUser> optionalUser = userRepository.findByEmail(email);

            System.out.println("User found: " + optionalUser.isPresent());

            if (optionalUser.isPresent()) {

                AppUser user = optionalUser.get();

                var authorities = List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()));

                var authentication = new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        authorities);

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println("Authentication set: "
                        + authentication.isAuthenticated());
            }

        } catch (JwtException | IllegalArgumentException ex) {

            System.err.println(
                    "JWT validation failed: "
                            + ex.getClass().getSimpleName());

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
