package com.aprenda.cursos_aprenda.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.aprenda.cursos_aprenda.models.VideoAula;
 
@Repository
public interface VideoAulaRepository extends JpaRepository<VideoAula, Integer> {
    List<VideoAula> findByCursoIdOrderByIdAsc(Integer cursoId);
}