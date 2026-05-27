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
 
    // Média das notas do aluno em um curso
    @Query("""
        SELECT AVG(r.nota)
        FROM RespostaAtividade r
        JOIN r.atividade a
        JOIN a.videoAula v
        WHERE r.aluno.id = :alunoId AND v.curso.id = :cursoId
    """)
    Double calcularMediaPorAlunoCurso(@Param("alunoId") Integer alunoId, @Param("cursoId") Integer cursoId);
}