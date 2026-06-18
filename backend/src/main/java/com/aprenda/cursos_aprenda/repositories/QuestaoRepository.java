package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.Questao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestaoRepository extends JpaRepository<Questao, Integer> {

    // Buscar questões por atividade
    List<Questao> findByAtividadeIdOrderByOrdemAsc(Integer atividadeId);
    
    // Buscar questões de uma atividade com suas alternativas (JOIN FETCH)
    @Query("SELECT q FROM Questao q JOIN FETCH q.alternativas WHERE q.atividade.id = :atividadeId ORDER BY q.ordem ASC")
    List<Questao> findByAtividadeIdWithAlternativas(@Param("atividadeId") Integer atividadeId);
    
    // Buscar uma questão com suas alternativas
    @Query("SELECT q FROM Questao q JOIN FETCH q.alternativas WHERE q.id = :id")
    Optional<Questao> findByIdWithAlternativas(@Param("id") Integer id);
    
    // Contar questões por atividade
    long countByAtividadeId(Integer atividadeId);
    
    // Buscar questões por atividade e apenas as que têm alternativas
    @Query("SELECT q FROM Questao q WHERE q.atividade.id = :atividadeId AND SIZE(q.alternativas) = 4")
    List<Questao> findByAtividadeIdWithFourAlternatives(@Param("atividadeId") Integer atividadeId);
}