package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.ProfessorRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.ProfessorResponseDTO;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class ProfessorService {
 
    private final ProfessorRepository professorRepository;
    private final PasswordEncoder passwordEncoder;
 
    @Transactional(readOnly = true)
    public List<ProfessorResponseDTO> listarTodos() {
        return professorRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public ProfessorResponseDTO buscarPorId(Integer id) {
        return professorRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado: " + id));
    }
 
    @Transactional
    public ProfessorResponseDTO cadastrar(ProfessorRequestDTO dto) {
        if (professorRepository.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email já cadastrado");
        if (professorRepository.existsByCpf(dto.cpf()))
            throw new IllegalArgumentException("CPF já cadastrado");
 
        Professor professor = new Professor();
        professor.setNome(dto.nome());
        professor.setEmail(dto.email());
        professor.setCpf(dto.cpf());
        professor.setTelefone(dto.telefone());
        professor.setFormacao(dto.formacao());
        professor.setDataNascimento(dto.dataNascimento());
        professor.setSenhaHash(passwordEncoder.encode(dto.senha()));
        return toDTO(professorRepository.save(professor));
    }
 
    @Transactional
    public ProfessorResponseDTO atualizar(Integer id, ProfessorRequestDTO dto) {
        Professor professor = professorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado: " + id));
 
        professor.setNome(dto.nome());
        professor.setEmail(dto.email());
        professor.setCpf(dto.cpf());
        professor.setTelefone(dto.telefone());
        professor.setFormacao(dto.formacao());
        professor.setDataNascimento(dto.dataNascimento());
        
        // Só atualiza a senha se for fornecida
        if (dto.senha() != null && !dto.senha().isBlank()) {
            professor.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }
 
        return toDTO(professorRepository.save(professor));
    }
 
    @Transactional
    public void deletar(Integer id) {
        if (!professorRepository.existsById(id)) {
            throw new EntityNotFoundException("Professor não encontrado: " + id);
        }
        professorRepository.deleteById(id);
    }
 
    private ProfessorResponseDTO toDTO(Professor professor) {
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getFormacao(),
            professor.getTelefone(),
            professor.getCpf()
        );
    }
}