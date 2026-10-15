
package com.gamage.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.Console;

public class AdminPasswordGenerator {

    public static void main(String[] args) {

        Console console = System.console();

        if (console == null) {
            System.out.println(
                    "Run this class from a terminal with console input.");
            return;
        }

        char[] password = console.readPassword(
                "Enter a new admin password: ");

        if (password == null || password.length < 12) {
            System.out.println(
                    "Password must contain at least 12 characters.");
            return;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String hashedPassword = encoder.encode(new String(password));

        java.util.Arrays.fill(password, '\0');

        System.out.println("BCrypt Hash:");
        System.out.println(hashedPassword);
    }
}
