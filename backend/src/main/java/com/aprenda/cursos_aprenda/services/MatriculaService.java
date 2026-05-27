package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.MatriculaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.MatriculaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.Matricula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CertificadoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.MatriculaRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class MatriculaService {
 
    private final MatriculaRepository matriculaRepository;
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final CertificadoRepository certificadoRepository;
 
    @Transactional(readOnly = true)
    public List<MatriculaResponseDTO> listarPorAluno(Integer alunoId) {
        return matriculaRepository.findByAlunoId(alunoId).stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public MatriculaResponseDTO buscarPorAlunoECurso(Integer alunoId, Integer cursoId) {
        return matriculaRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Matrícula não encontrada"));
    }
 
    @Transactional
    public MatriculaResponseDTO matricular(MatriculaRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        Curso curso = cursoRepository.findById(dto.cursoId())
            .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + dto.cursoId()));
 
        if (matriculaRepository.existsByAlunoIdAndCursoId(aluno.getId(), curso.getId()))
            throw new IllegalArgumentException("Aluno já matriculado neste curso");
 
        Matricula matricula = new Matricula();
        matricula.setId(new Matricula.MatriculaId(aluno.getId(), curso.getId()));
        matricula.setAluno(aluno);
        matricula.setCurso(curso);
        matricula.setModalidadePagamento(parseModalidade(dto.modalidadePagamento()));
        Integer numeroParcelas = dto.numeroParcelas();
        matricula.setNumeroParcelas(numeroParcelas != null ? numeroParcelas : 1);
 
        return toDTO(matriculaRepository.save(matricula));
    }
 
    @Transactional
    public MatriculaResponseDTO atualizarPagamento(Integer alunoId, Integer cursoId, String status) {
        Matricula matricula = matriculaRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Matrícula não encontrada"));
        matricula.setStatusPagamento(Matricula.StatusPagamento.valueOf(status.toUpperCase()));
        return toDTO(matriculaRepository.save(matricula));
    }
 
    @Transactional
    public void cancelar(Integer alunoId, Integer cursoId) {
        Matricula matricula = matriculaRepository.findByAlunoIdAndCursoId(alunoId, cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Matrícula não encontrada"));
        matricula.setStatusPagamento(Matricula.StatusPagamento.CANCELADO);
        matriculaRepository.save(matricula);
    }
 
    private MatriculaResponseDTO toDTO(Matricula matricula) {
        Integer alunoId = matricula.getAluno().getId();
        Integer cursoId = matricula.getCurso().getId();
        Integer numeroAulas = matricula.getCurso().getNumeroAulas();
        int totalAulas = numeroAulas != null ? numeroAulas : 0;
        int aulasConcluidas = (int) progressoAulaRepository.findByAlunoId(alunoId).stream()
            .filter(progress -> progress.getVideoAula().getCurso().getId().equals(cursoId))
            .filter(progress -> Boolean.TRUE.equals(progress.getAssistida()))
            .count();
        boolean certificadoDisponivel = certificadoRepository.existsByAlunoIdAndCursoId(alunoId, cursoId);
 
        return new MatriculaResponseDTO(
            cursoId,
            matricula.getCurso().getNome(),
            matricula.getCurso().getProfessor() != null ? matricula.getCurso().getProfessor().getNome() : null,
            totalAulas,
            aulasConcluidas,
            matricula.getMediaFinal(),
            matricula.getModalidadePagamento().name(),
            matricula.getNumeroParcelas(),
            matricula.getStatusPagamento().name(),
            matricula.getDataMatricula(),
            certificadoDisponivel
        );
    }
 
    private Aluno buscarAlunoLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Aluno não autenticado");
        }
 
        return alunoRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado para email: " + auth.getName()));
    }
 
    private Matricula.ModalidadePagamento parseModalidade(String modalidadePagamento) {
        if (modalidadePagamento == null || modalidadePagamento.isBlank()) {
            return Matricula.ModalidadePagamento.AVISTA;
        }
 
        return Matricula.ModalidadePagamento.valueOf(modalidadePagamento.toUpperCase());
    }
}