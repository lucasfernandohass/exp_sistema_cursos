package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.response.CertificadoResponseDTO;
import com.aprenda.cursos_aprenda.models.Certificado;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CertificadoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;
import com.aprenda.cursos_aprenda.repositories.RespostaAtividadeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
public class CertificadoService {
 
    private final CertificadoRepository certificadoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final RespostaAtividadeRepository respostaAtividadeRepository;
    private final AlunoRepository alunoRepository;
    private final CursoRepository cursoRepository;
 
    private static final double MEDIA_MINIMA = 6.0;
 
    public List<CertificadoResponseDTO> listarPorAluno(Integer alunoId) {
        return certificadoRepository.findByAlunoId(alunoId).stream()
            .map(this::toDTO)
            .toList();
    }
 
    public CertificadoResponseDTO validar(String codigoValidacao) {
        return certificadoRepository.findByCodigoValidacao(codigoValidacao)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Certificado não encontrado"));
    }
 
    @Transactional
    public CertificadoResponseDTO emitir(Integer alunoId, Integer cursoId) {
        if (certificadoRepository.existsByAlunoIdAndCursoId(alunoId, cursoId))
            throw new IllegalArgumentException("Certificado já emitido para este curso");
 
        boolean todasAssistidas = Boolean.TRUE.equals(
            progressoAulaRepository.todasAulasAssistidas(alunoId, cursoId)
        );
        if (!todasAssistidas)
            throw new IllegalArgumentException("O aluno não assistiu todas as aulas");
 
        Double media = respostaAtividadeRepository.calcularMediaPorAlunoCurso(alunoId, cursoId);
        if (media == null || media < MEDIA_MINIMA)
            throw new IllegalArgumentException("Média insuficiente para emissão do certificado: " + media);
 
        Aluno aluno = alunoRepository.findById(alunoId)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: " + alunoId));
        Curso curso = cursoRepository.findById(cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + cursoId));
 
        Certificado certificado = new Certificado();
        certificado.setCodigoValidacao(UUID.randomUUID().toString());
        certificado.setAluno(aluno);
        certificado.setCurso(curso);
 
        return toDTO(certificadoRepository.save(certificado));
    }
 
    private CertificadoResponseDTO toDTO(Certificado certificado) {
        return new CertificadoResponseDTO(
            certificado.getId(),
            certificado.getAluno() != null ? certificado.getAluno().getNome() : null,
            certificado.getCurso() != null ? certificado.getCurso().getNome() : null,
            certificado.getCurso() != null && certificado.getCurso().getProfessor() != null ? certificado.getCurso().getProfessor().getNome() : null,
            certificado.getDataEmissao(),
            certificado.getCodigoValidacao()
        );
    }
}