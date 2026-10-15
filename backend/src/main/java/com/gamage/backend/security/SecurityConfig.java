
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
                                .cors(Customizer.withDefaults())

                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

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

                                .authorizeHttpRequests(auth -> auth

                                                // Public registration and login
                                                .requestMatchers(
                                                                "/api/auth/register",
                                                                "/api/auth/login")
                                                .permitAll()

                                                // Allow CORS preflight requests
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

                                                // PUBLIC: Read courses without login
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/courses",
                                                                "/api/courses/**")
                                                .permitAll()

                                                // STUDENT ONLY: Student profile and features
                                                .requestMatchers("/api/student/**")
                                                .hasRole("STUDENT")

                                                // Allow Spring Boot error responses
                                                .requestMatchers("/error")
                                                .permitAll()

                                                // All other endpoints require authentication
                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOriginPatterns(
                                List.of(
                                                "http://localhost:[*]",
                                                "http://127.0.0.1:[*]"));

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "OPTIONS",
                                                "PATCH"));

                configuration.setAllowedHeaders(
                                List.of("*"));

                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}
