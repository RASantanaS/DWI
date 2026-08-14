package com.prunusgym.prunusgym.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarRecursoNoEncontrado(RecursoNoEncontradoException ex) {
        Map<String, Object> cuerpoError = new HashMap<>();
        cuerpoError.put("timestamp", LocalDateTime.now());
        cuerpoError.put("status", HttpStatus.NOT_FOUND.value());
        cuerpoError.put("error", "Not Found");
        cuerpoError.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(cuerpoError, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> manejarRecursoDuplicado(RecursoDuplicadoException ex) {
        Map<String, Object> cuerpoError = new HashMap<>();
        cuerpoError.put("timestamp", LocalDateTime.now());
        cuerpoError.put("status", HttpStatus.CONFLICT.value());
        cuerpoError.put("error", "Conflict");
        cuerpoError.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(cuerpoError, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> manejarAccesoDenegado(AccessDeniedException ex) {
        Map<String, Object> cuerpoError = new HashMap<>();
        cuerpoError.put("timestamp", LocalDateTime.now());
        cuerpoError.put("status", HttpStatus.FORBIDDEN.value());
        cuerpoError.put("error", "Forbidden");
        cuerpoError.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(cuerpoError, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarArgumentoInvalido(IllegalArgumentException ex) {
        Map<String, Object> cuerpoError = new HashMap<>();
        cuerpoError.put("timestamp", LocalDateTime.now());
        cuerpoError.put("status", HttpStatus.BAD_REQUEST.value());
        cuerpoError.put("error", "Bad Request");
        cuerpoError.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(cuerpoError, HttpStatus.BAD_REQUEST);
    }
}