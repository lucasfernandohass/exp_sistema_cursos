package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.AlunoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.AlunoUpdateRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AlunoResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
 
@Service
@RequiredArgsConstructor
public class AlunoService {
 
    private final AlunoRepository alunoRepository;
    private final PasswordEncoder passwordEncoder;
 
    public List<AlunoResponseDTO> listarTodos() {
        return alunoRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Integer id, boolean verificarPermissao) {
        if (verificarPermissao) {
            verificarAcessoAluno(id);
        }
        return alunoRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public AlunoResponseDTO buscarPorId(Integer id) {
        return buscarPorId(id, false);
    }

// Método para verificar se o usuário logado é o próprio aluno ou admin
    private void verificarAcessoAluno(Integer id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new AccessDeniedException("Usuário não autenticado");
        }
        
        // Se for admin, permite
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));
        if (isAdmin) {
            return;
        }
        
        // Verifica se o aluno logado é o mesmo do ID
        String email = auth.getName();
        Aluno aluno = alunoRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        
        if (!aluno.getId().equals(id)) {
            throw new AccessDeniedException("Acesso negado");
        }
    }
 
    @Transactional
    public AlunoResponseDTO cadastrar(AlunoRequestDTO dto) {
        if (alunoRepository.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email já cadastrado");
        if (alunoRepository.existsByCpf(dto.cpf()))
            throw new IllegalArgumentException("CPF já cadastrado");
 
        Aluno aluno = toEntity(dto);
        aluno.setSenhaHash(passwordEncoder.encode(dto.senha()));
        return toDTO(alunoRepository.save(aluno));
    }
 
    @Transactional
    public AlunoResponseDTO atualizar(Integer id, AlunoUpdateRequestDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: " + id));

        if (dto.email() != null && !dto.email().isBlank()) {
            if (!aluno.getEmail().equals(dto.email()) && 
                alunoRepository.existsByEmail(dto.email())) {
                throw new IllegalArgumentException("Email já cadastrado");
            }
            aluno.setEmail(dto.email());
        }
        
        aluno.setTelefone(dto.telefone());
        aluno.setDataNascimento(dto.dataNascimento());

        if (dto.senha() != null && !dto.senha().isBlank()) {
            aluno.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }

        return toDTO(alunoRepository.save(aluno));
    }
 
    @Transactional
    public void deletar(Integer id) {
        buscarPorId(id);
        alunoRepository.deleteById(id);
    }
 
    public AlunoResponseDTO toDTO(Aluno aluno) {
        return new AlunoResponseDTO(
            aluno.getId(),
            aluno.getNome(),
            aluno.getCpf(),
            aluno.getEmail(),
            aluno.getRa(),
            aluno.getTelefone(),
            aluno.getDataNascimento()
        );
    }
 
    public Aluno toEntity(AlunoRequestDTO dto) {
        Aluno aluno = new Aluno();
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setCpf(dto.cpf());
        aluno.setRa(dto.ra());
        aluno.setTelefone(dto.telefone());
        aluno.setDataNascimento(dto.dataNascimento());
        return aluno;
    }
 
    public Aluno buscarPorEmail(String email) {
        return alunoRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado para email: " + email));
    }

    public boolean isAlunoLogado(Integer id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return false;
        }
        
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR"));
        if (isAdmin) {
            return true;
        }
        
        String email = auth.getName();
        return alunoRepository.findByEmail(email)
            .map(aluno -> aluno.getId().equals(id))
            .orElse(false);
    }

} 