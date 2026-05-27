package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.time.LocalDateTime;
 
@Service
@RequiredArgsConstructor
public class ProgressoAulaService {
 
    private final ProgressoAulaRepository progressoAulaRepository;
 
    @Transactional
    public ProgressoAula marcarAssistida(Integer alunoId, Integer videoAulaId) {
        ProgressoAula progresso = progressoAulaRepository
            .findByAlunoIdAndVideoAulaId(alunoId, videoAulaId)
            .orElse(new ProgressoAula());
 
        if (Boolean.TRUE.equals(progresso.getAssistida()))
            return progresso;
 
        progresso.setAssistida(true);
        progresso.setDataConclusao(LocalDateTime.now());
        return progressoAulaRepository.save(progresso);
    }
 
    public Boolean todasAssistidas(Integer alunoId, Integer cursoId) {
        return progressoAulaRepository.todasAulasAssistidas(alunoId, cursoId);
    }
}