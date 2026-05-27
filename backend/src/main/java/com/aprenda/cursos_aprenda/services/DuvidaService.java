package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.DuvidaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.DuvidaRespostaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.DuvidaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Duvida;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.DuvidaRepository;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;
import com.aprenda.cursos_aprenda.repositories.VideoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDateTime;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class DuvidaService {
 
    private final DuvidaRepository duvidaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final VideoAulaRepository videoAulaRepository;
 
    @Transactional(readOnly = true)
    public List<DuvidaResponseDTO> listarPorVideoAula(Integer videoAulaId) {
        return duvidaRepository.findByVideoAulaId(videoAulaId).stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public List<DuvidaResponseDTO> listarPendentes(Integer professorId) {
        return duvidaRepository.findByProfessorIdAndRespostaIsNull(professorId).stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional
    public DuvidaResponseDTO enviar(DuvidaRequestDTO dto) {
        String email = getAuthenticatedEmail();
        Aluno aluno = alunoRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado para email: " + email));
 
        VideoAula videoAula = videoAulaRepository.findById(dto.videoAulaId())
            .orElseThrow(() -> new EntityNotFoundException("Video aula não encontrada: " + dto.videoAulaId()));
 
        Duvida duvida = new Duvida();
        duvida.setPergunta(dto.pergunta());
        duvida.setAluno(aluno);
        duvida.setVideoAula(videoAula);
        duvida.setDataEnvio(LocalDateTime.now());
 
        return toDTO(duvidaRepository.save(duvida));
    }
 
    @Transactional
    public DuvidaResponseDTO responder(Integer duvidaId, DuvidaRespostaRequestDTO dto) {
        Duvida duvida = duvidaRepository.findById(duvidaId)
            .orElseThrow(() -> new EntityNotFoundException("Dúvida não encontrada: " + duvidaId));
 
        String email = getAuthenticatedEmail();
        Professor professor = professorRepository.findByEmail(email).orElse(null);
 
        duvida.setResposta(dto.resposta());
        duvida.setDataResposta(LocalDateTime.now());
        duvida.setProfessor(professor);
 
        return toDTO(duvidaRepository.save(duvida));
    }
 
    private String getAuthenticatedEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }
        return auth.getName();
    }
 
    private DuvidaResponseDTO toDTO(Duvida duvida) {
        return new DuvidaResponseDTO(
            duvida.getId(),
            duvida.getPergunta(),
            duvida.getResposta(),
            duvida.getDataEnvio(),
            duvida.getDataResposta(),
            duvida.getAluno() != null ? duvida.getAluno().getNome() : null,
            duvida.getProfessor() != null ? duvida.getProfessor().getNome() : null,
            duvida.getVideoAula() != null ? duvida.getVideoAula().getId() : null,
            duvida.getVideoAula() != null ? duvida.getVideoAula().getTitulo() : null
        );
    }
}
