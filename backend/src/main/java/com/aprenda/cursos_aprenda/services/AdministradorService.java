package com.aprenda.cursos_aprenda.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.aprenda.cursos_aprenda.dtos.request.AdministradorRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AdministradorResponseDTO;
import com.aprenda.cursos_aprenda.models.Administrador;
import com.aprenda.cursos_aprenda.repositories.AdministradorRepository;
import jakarta.persistence.*;
import lombok.*;

@Service
@RequiredArgsConstructor
public class AdministradorService {

    private final AdministradorRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdministradorResponseDTO cadastrar(AdministradorRequestDTO dto) {
        if (adminRepository.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email já cadastrado");

        Administrador admin = new Administrador();
        admin.setEmail(dto.email());
        admin.setNivelAcesso(dto.nivelAcesso() != null ? dto.nivelAcesso() : 1);
        admin.setSenhaHash(passwordEncoder.encode(dto.senha())); // ← hash feito aqui
        return toDTO(adminRepository.save(admin));
    }

    public Administrador buscarEntidade(Integer id) {
        return adminRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Administrador não encontrado: " + id));
    }

    private AdministradorResponseDTO toDTO(Administrador a) {
        return new AdministradorResponseDTO(a.getId(), a.getEmail(), a.getNivelAcesso());
    }
}
