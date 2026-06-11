// ProgressoAulaRepository.java
package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.models.ProgressoAula.ProgressoAulaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoAulaRepository extends JpaRepository<ProgressoAula, ProgressoAulaId> {
    List<ProgressoAula> findByAlunoId(Integer alunoId);
    Optional<ProgressoAula> findByAlunoIdAndVideoAulaId(Integer alunoId, Integer videoAulaId);
    
    @Query("SELECT COUNT(v) = SUM(CASE WHEN p.assistida = true THEN 1 ELSE 0 END) " +
           "FROM VideoAula v " +
           "LEFT JOIN ProgressoAula p ON p.videoAula = v AND p.aluno.id = :alunoId " +
           "WHERE v.curso.id = :cursoId")
    Boolean todasAulasAssistidas(@Param("alunoId") Integer alunoId, @Param("cursoId") Integer cursoId);
}