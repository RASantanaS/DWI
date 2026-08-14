package com.prunusgym.prunusgym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class PrunusgymApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrunusgymApplication.class, args);
	}

}