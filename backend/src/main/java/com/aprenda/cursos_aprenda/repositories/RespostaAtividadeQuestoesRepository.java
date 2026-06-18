package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.RespostaAtividadeQuestoes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RespostaAtividadeQuestoesRepository extends JpaRepository<RespostaAtividadeQuestoes, Integer> {
    
    List<RespostaAtividadeQuestoes> findByAlunoId(Integer alunoId);
    
    List<RespostaAtividadeQuestoes> findByAtividadeId(Integer atividadeId);
    
    Optional<RespostaAtividadeQuestoes> findByAlunoIdAndAtividadeId(Integer alunoId, Integer atividadeId);
    
    @Query("SELECT AVG(r.nota) FROM RespostaAtividadeQuestoes r " +
           "JOIN r.atividade a " +
           "JOIN a.curso c " +
           "WHERE r.aluno.id = :alunoId AND c.id = :cursoId")
    Double calcularMediaPorAlunoCurso(@Param("alunoId") Integer alunoId, @Param("cursoId") Integer cursoId);
}