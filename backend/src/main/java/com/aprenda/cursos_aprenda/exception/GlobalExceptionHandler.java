package com.aprenda.cursos_aprenda.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
 
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
 
@RestControllerAdvice
public class GlobalExceptionHandler {
 
    // Erros de validação (@NotBlank, @Email, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> erros.put(e.getField(), e.getDefaultMessage()));
 
        return ResponseEntity.badRequest().body(erro(400, "Dados inválidos", erros));
    }
 
    // Entidade não encontrada
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(erro(404, ex.getMessage(), null));
    }
 
    // Regras de negócio (email duplicado, já matriculado, etc.)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
            .body(erro(400, ex.getMessage(), null));
    }
 
    // Erros inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(erro(500, "Erro interno no servidor", null));
    }
 
    private Map<String, Object> erro(int status, String mensagem, Object detalhes) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        body.put("mensagem", mensagem);
        body.put("timestamp", LocalDateTime.now().toString());
        if (detalhes != null) body.put("detalhes", detalhes);
        return body;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleAuth(IllegalArgumentException ex) {
        if (ex.getMessage().contains("senha inválidos"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(erro(401, ex.getMessage(), null));
        return ResponseEntity.badRequest().body(erro(400, ex.getMessage(), null));
    }
}