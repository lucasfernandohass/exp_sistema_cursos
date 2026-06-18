package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.RespostaAtividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RespostaAtividadeRepository extends JpaRepository<RespostaAtividade, Integer> {
    
    List<RespostaAtividade> findByAlunoId(Integer alunoId);
    
    List<RespostaAtividade> findByAtividadeId(Integer atividadeId);
    
    Optional<RespostaAtividade> findByAlunoIdAndAtividadeId(Integer alunoId, Integer atividadeId);
    
   @Query(value = "SELECT AVG(raq.nota) FROM resposta_atividade_questoes raq " +
               "JOIN atividade a ON a.id = raq.atividade_id " +
               "WHERE raq.aluno_id = :alunoId AND a.curso_id = :cursoId", 
       nativeQuery = true)
Double calcularMediaPorAlunoCurso(@Param("alunoId") Integer alunoId, 
                                  @Param("cursoId") Integer cursoId);
}