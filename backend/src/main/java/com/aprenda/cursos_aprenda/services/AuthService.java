package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.AuthRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AuthResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Administrador;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.repositories.AdministradorRepository;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;
import com.aprenda.cursos_aprenda.security.JwtUtil;


import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
@Service
@RequiredArgsConstructor
public class AuthService {
 
    private final AlunoRepository       alunoRepository;
    private final ProfessorRepository   professorRepository;
    private final AdministradorRepository adminRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
 
    public AuthResponseDTO login(AuthRequestDTO dto) {
 
        // Tenta autenticar como Aluno
        var aluno = alunoRepository.findByEmail(dto.email());
        if (aluno.isPresent() && passwordEncoder.matches(dto.senha(), aluno.get().getSenhaHash())) {
            Aluno a = aluno.get();
            return new AuthResponseDTO(
                jwtUtil.gerarToken(a.getEmail(), "ALUNO", a.getId()),
                "ALUNO", a.getId(), a.getNome(), a.getEmail()
            );
        }
 
        // Tenta autenticar como Professor
        var professor = professorRepository.findByEmail(dto.email());
        if (professor.isPresent() && passwordEncoder.matches(dto.senha(), professor.get().getSenhaHash())) {
            Professor p = professor.get();
            return new AuthResponseDTO(
                jwtUtil.gerarToken(p.getEmail(), "PROFESSOR", p.getId()),
                "PROFESSOR", p.getId(), p.getNome(), p.getEmail()
            );
        }
 
        // Tenta autenticar como Administrador
        var admin = adminRepository.findByEmail(dto.email());
        if (admin.isPresent() && passwordEncoder.matches(dto.senha(), admin.get().getSenhaHash())) {
            Administrador adm = admin.get();
            return new AuthResponseDTO(
                jwtUtil.gerarToken(adm.getEmail(), "ADMINISTRADOR", adm.getId()),
                "ADMINISTRADOR", adm.getId(), adm.getEmail(), adm.getEmail()
            );
        }
 
        throw new IllegalArgumentException("Email ou senha inválidos");
    }
}