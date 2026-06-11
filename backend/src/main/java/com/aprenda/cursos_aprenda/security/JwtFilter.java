package com.aprenda.cursos_aprenda.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
 
    private final JwtUtil jwtUtil;
 
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // Ignorar endpoints públicos
        if (requestURI.startsWith("/auth/") || 
            requestURI.startsWith("/cursos") && request.getMethod().equals("GET")) {
            chain.doFilter(request, response);
            return;
        }
 
        String header = request.getHeader("Authorization");
        
        System.out.println("=== JWT Filter Debug ===");
        System.out.println("Request URI: " + requestURI);
        System.out.println("Authorization header: " + (header != null ? "Present" : "NULL"));
 
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            System.out.println("Token (primeiros 30 chars): " + token.substring(0, Math.min(token.length(), 30)) + "...");
 
            try {
                if (jwtUtil.isValido(token)) {
                    String email = jwtUtil.extrairEmail(token);
                    String perfil = jwtUtil.extrairPerfil(token);
                    Integer id = jwtUtil.extrairId(token);
                    
                    System.out.println("✅ Token válido!");
                    System.out.println("   Email: " + email);
                    System.out.println("   Perfil: " + perfil);
                    System.out.println("   ID: " + id);
 
                    var auth = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + perfil))
                    );
 
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("✅ Authentication set in context");
                } else {
                    System.out.println("❌ Token inválido!");
                }
            } catch (Exception e) {
                System.out.println("❌ Erro ao processar token: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("⚠️ No Bearer token found in Authorization header");
        }
 
        chain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Não filtrar endpoints públicos
        return path.startsWith("/auth/") || 
               (path.startsWith("/cursos") && "GET".equals(request.getMethod())) ||
               path.equals("/alunos") && "POST".equals(request.getMethod());
    }
}