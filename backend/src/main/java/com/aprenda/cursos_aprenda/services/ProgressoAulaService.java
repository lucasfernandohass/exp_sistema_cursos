package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.response.ProgressoAulaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;
import com.aprenda.cursos_aprenda.repositories.VideoAulaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class ProgressoAulaService {

    private final ProgressoAulaRepository progressoAulaRepository;
    private final AlunoRepository alunoRepository;
    private final VideoAulaRepository videoAulaRepository;

    @Transactional
    public ProgressoAulaResponseDTO marcarAssistida(Integer alunoId, Integer videoAulaId) {
        // Buscar aluno e videoAula
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado: " + alunoId));
        
        VideoAula videoAula = videoAulaRepository.findById(videoAulaId)
                .orElseThrow(() -> new RuntimeException("Vídeo aula não encontrada: " + videoAulaId));
        
        // Buscar progresso existente ou criar novo
        ProgressoAula progresso = progressoAulaRepository
                .findByAlunoIdAndVideoAulaId(alunoId, videoAulaId)
                .orElse(new ProgressoAula());
        
        // Configurar IDs para chave composta
        ProgressoAula.ProgressoAulaId id = new ProgressoAula.ProgressoAulaId();
        id.setAlunoId(alunoId);
        id.setVideoAulaId(videoAulaId);
        progresso.setId(id);
        
        progresso.setAluno(aluno);
        progresso.setVideoAula(videoAula);
        progresso.setAssistida(true);
        progresso.setDataConclusao(LocalDateTime.now());
        
        ProgressoAula saved = progressoAulaRepository.save(progresso);
        
        // Retornar DTO em vez da entidade
        return new ProgressoAulaResponseDTO(
            saved.getId().getAlunoId(),
            saved.getId().getVideoAulaId(),
            saved.getAssistida(),
            saved.getDataConclusao()
        );
    }

    @Transactional(readOnly = true)
    public boolean isCursoCompleto(Integer alunoId, Integer cursoId) {
        List<VideoAula> aulas = videoAulaRepository.findByCursoIdOrderByIdAsc(cursoId);
        
        if (aulas.isEmpty()) {
            return false;
        }
        
        for (VideoAula aula : aulas) {
            boolean assistida = progressoAulaRepository
                .findByAlunoIdAndVideoAulaId(alunoId, aula.getId())
                .map(ProgressoAula::getAssistida)
                .orElse(false);
            
            if (!assistida) {
                return false;
            }
        }
        
        return true;
    }
}