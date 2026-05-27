package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.RespostaAtividadeRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.RespostaAtividadeResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Atividade;
import com.aprenda.cursos_aprenda.models.RespostaAtividade;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.AtividadeRepository;
import com.aprenda.cursos_aprenda.repositories.RespostaAtividadeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class RespostaAtividadeService {
 
    private final RespostaAtividadeRepository respostaAtividadeRepository;
    private final AlunoRepository alunoRepository;
    private final AtividadeRepository atividadeRepository;
 
    @Transactional(readOnly = true)
    public List<RespostaAtividadeResponseDTO> listarPorAtividade(Integer atividadeId) {
        return respostaAtividadeRepository.findByAtividadeId(atividadeId).stream()
            .map(this::toDTO)
            .toList();
    }
 
    @Transactional
    public RespostaAtividadeResponseDTO responder(RespostaAtividadeRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        Atividade atividade = atividadeRepository.findById(dto.atividadeId())
            .orElseThrow(() -> new EntityNotFoundException("Atividade não encontrada: " + dto.atividadeId()));
 
        boolean jaRespondeu = respostaAtividadeRepository
            .findByAlunoIdAndAtividadeId(aluno.getId(), atividade.getId())
            .isPresent();
 
        if (jaRespondeu)
            throw new IllegalArgumentException("Atividade já respondida");
 
        RespostaAtividade resposta = new RespostaAtividade();
        resposta.setResposta(dto.resposta());
        resposta.setAluno(aluno);
        resposta.setAtividade(atividade);
 
        return toDTO(respostaAtividadeRepository.save(resposta));
    }
 
    @Transactional
    public RespostaAtividadeResponseDTO corrigir(Integer respostaId, Double nota) {
        RespostaAtividade resposta = respostaAtividadeRepository.findById(respostaId)
            .orElseThrow(() -> new EntityNotFoundException("Resposta não encontrada: " + respostaId));
 
        if (nota < 0 || nota > 10)
            throw new IllegalArgumentException("Nota deve ser entre 0 e 10");
 
        resposta.setNota(java.math.BigDecimal.valueOf(nota));
        return toDTO(respostaAtividadeRepository.save(resposta));
    }
 
    private RespostaAtividadeResponseDTO toDTO(RespostaAtividade resposta) {
        return new RespostaAtividadeResponseDTO(
            resposta.getId(),
            resposta.getResposta(),
            resposta.getNota(),
            resposta.getDataEntrega(),
            resposta.getAluno() != null ? resposta.getAluno().getNome() : null,
            resposta.getAtividade() != null ? resposta.getAtividade().getTitulo() : null
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
}