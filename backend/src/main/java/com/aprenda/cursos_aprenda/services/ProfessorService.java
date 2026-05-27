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
 
    public List<ProfessorResponseDTO> listarTodos() {
        return professorRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
 
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
 
        if (!professor.getEmail().equals(dto.email()) && professorRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (!professor.getCpf().equals(dto.cpf()) && professorRepository.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
 
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
    public void deletar(Integer id) {
        buscarPorId(id);
        professorRepository.deleteById(id);
    }
 
    private ProfessorResponseDTO toDTO(Professor professor) {
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getFormacao(),
            professor.getTelefone()
        );
    }
}