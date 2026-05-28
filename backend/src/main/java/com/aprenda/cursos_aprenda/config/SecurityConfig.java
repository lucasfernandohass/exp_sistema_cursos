package com.aprenda.cursos_aprenda.config;

import com.aprenda.cursos_aprenda.security.JwtFilter;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
 
import java.util.List;
 
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
 
    private final JwtFilter jwtFilter;
 
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
 
                // ── Públicas ────────────────────────────────────────────
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/cursos").permitAll()
                .requestMatchers(HttpMethod.GET, "/cursos/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/cursos/pesquisar").permitAll()
                .requestMatchers(HttpMethod.POST, "/alunos").permitAll()
 
                // ── Apenas ADMINISTRADOR ────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/cursos").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT,    "/cursos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/cursos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST,   "/video-aulas").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT,    "/video-aulas/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/video-aulas/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST,   "/atividades").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT,    "/atividades/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/atividades/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/professores/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/administradores/**").hasRole("ADMINISTRADOR")
 
                // ── Apenas PROFESSOR ────────────────────────────────────
                .requestMatchers("/duvidas/professor/**").hasRole("PROFESSOR")
                .requestMatchers(HttpMethod.PATCH, "/duvidas/*/responder").hasRole("PROFESSOR")
                .requestMatchers(HttpMethod.PATCH, "/respostas/*/nota").hasRole("PROFESSOR")
 
                // ── Apenas ALUNO ────────────────────────────────────────
                .requestMatchers("/matriculas/**").hasRole("ALUNO")
                .requestMatchers("/progresso/**").hasRole("ALUNO")
                .requestMatchers("/certificados/aluno/**").hasRole("ALUNO")
                .requestMatchers(HttpMethod.POST, "/duvidas").hasRole("ALUNO")
                .requestMatchers(HttpMethod.POST, "/respostas").hasRole("ALUNO")
 
                // ── ALUNO e PROFESSOR ───────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/duvidas/**").hasAnyRole("ALUNO", "PROFESSOR")
                .requestMatchers(HttpMethod.GET, "/certificados/validar/**").hasAnyRole("ALUNO", "ADMINISTRADOR")
 
                // ── Qualquer autenticado ────────────────────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
 
        return http.build();
    }
 
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // Vite dev server
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
 
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
 
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
 
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
 