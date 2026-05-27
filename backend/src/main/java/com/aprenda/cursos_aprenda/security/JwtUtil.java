package com.aprenda.cursos_aprenda.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
 
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
 
@Component
public class JwtUtil {
 
    private final SecretKey secretKey;
    private final long expirationMs;
 
    public JwtUtil(
        @Value("${security.jwt.secret}") String secret,
        @Value("${security.jwt.expiration-ms}") long expirationMs
    ) {
        this.secretKey  = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }
 
    public String gerarToken(String email, String perfil, Integer id) {
        return Jwts.builder()
            .subject(email)
            .claim("perfil", perfil)
            .claim("id", id)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(secretKey)
            .compact();
    }
 
    public String extrairEmail(String token) {
        return parsear(token).getPayload().getSubject();
    }
 
    public String extrairPerfil(String token) {
        return parsear(token).getPayload().get("perfil", String.class);
    }
 
    public Integer extrairId(String token) {
        return parsear(token).getPayload().get("id", Integer.class);
    }
 
    public boolean isValido(String token) {
        try {
            parsear(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
 
    private Jws<Claims> parsear(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token);
    }
}