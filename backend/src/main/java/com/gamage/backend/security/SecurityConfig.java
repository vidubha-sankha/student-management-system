
package com.gamage.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtAuthenticationFilter jwtFilter) throws Exception {

                http
                                // Enable CORS
                                .cors(Customizer.withDefaults())

                                // Disable CSRF for JWT-based REST API
                                .csrf(csrf -> csrf.disable())

                                // Stateless authentication
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // Handle unauthorized and forbidden requests
                                .exceptionHandling(ex -> ex

                                                .authenticationEntryPoint(
                                                                (request, response, authException) -> response
                                                                                .sendError(
                                                                                                HttpStatus.UNAUTHORIZED
                                                                                                                .value()))

                                                .accessDeniedHandler(
                                                                (request, response, accessDeniedException) -> response
                                                                                .sendError(
                                                                                                HttpStatus.FORBIDDEN
                                                                                                                .value())))

                                // API Security Rules
                                .authorizeHttpRequests(auth -> auth

                                                // PUBLIC: Student registration and login
                                                .requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login")
                                                .permitAll()

                                                // PUBLIC: CORS preflight requests
                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                // ADMIN ONLY: Create students and courses
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/students",
                                                                "/api/courses")
                                                .hasRole("ADMIN")

                                                // ADMIN ONLY: Update students and courses
                                                .requestMatchers(
                                                                HttpMethod.PUT,
                                                                "/api/students/**",
                                                                "/api/courses/**")
                                                .hasRole("ADMIN")

                                                // ADMIN ONLY: Delete students and courses
                                                .requestMatchers(
                                                                HttpMethod.DELETE,
                                                                "/api/students/**",
                                                                "/api/courses/**")
                                                .hasRole("ADMIN")

                                                // ADMIN ONLY: Manage student records
                                                .requestMatchers("/api/students/**")
                                                .hasRole("ADMIN")

                                                // PUBLIC: Read course information
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/courses",
                                                                "/api/courses/**")
                                                .permitAll()

                                                // ADMIN ONLY: Change requests and admin features
                                                .requestMatchers("/api/admin/**")
                                                .hasRole("ADMIN")

                                                // STUDENT ONLY: Student profile and requests
                                                .requestMatchers("/api/student/**")
                                                .hasRole("STUDENT")

                                                // PUBLIC: Spring Boot error responses
                                                .requestMatchers("/error")
                                                .permitAll()

                                                // All other endpoints require login
                                                .anyRequest()
                                                .authenticated())

                                // Add JWT authentication filter
                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // Allowed frontend origins
                configuration.setAllowedOriginPatterns(
                                List.of(
                                                "http://localhost:[*]",
                                                "http://127.0.0.1:[*]"));

                // Allowed HTTP methods
                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "OPTIONS",
                                                "PATCH"));

                // Allowed request headers
                configuration.setAllowedHeaders(
                                List.of("*"));

                // Allow credentials
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}
