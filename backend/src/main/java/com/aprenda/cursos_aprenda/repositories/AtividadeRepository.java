package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtividadeRepository extends JpaRepository<Atividade, Integer> {
    
    List<Atividade> findByCursoId(Integer cursoId);
    
    @Query("SELECT a FROM Atividade a JOIN FETCH a.questoes q JOIN FETCH q.alternativas WHERE a.id = :id")
    Atividade findByIdWithQuestoes(@Param("id") Integer id);
}