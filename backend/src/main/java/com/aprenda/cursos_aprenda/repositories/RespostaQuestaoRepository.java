package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.RespostaQuestao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RespostaQuestaoRepository extends JpaRepository<RespostaQuestao, Integer> {
    
    Optional<RespostaQuestao> findByAlunoIdAndQuestaoId(Integer alunoId, Integer questaoId);
    
    List<RespostaQuestao> findByAlunoId(Integer alunoId);
    
    List<RespostaQuestao> findByQuestaoId(Integer questaoId);
    
    @Query("SELECT DISTINCT r FROM RespostaQuestao r " +
           "LEFT JOIN FETCH r.aluno " +
           "LEFT JOIN FETCH r.questao q " +
           "LEFT JOIN FETCH q.alternativas " +
           "WHERE r.aluno.id = :alunoId " +
           "AND q.atividade.id = :atividadeId")
    List<RespostaQuestao> findByAlunoIdAndAtividadeId(@Param("alunoId") Integer alunoId, 
                                                       @Param("atividadeId") Integer atividadeId);
    
    @Query("SELECT COUNT(r) FROM RespostaQuestao r " +
           "WHERE r.aluno.id = :alunoId " +
           "AND r.questao.atividade.id = :atividadeId")
    int countByAlunoIdAndAtividadeId(@Param("alunoId") Integer alunoId, 
                                      @Param("atividadeId") Integer atividadeId);
}