package com.aprenda.cursos_aprenda.repositories;

import com.aprenda.cursos_aprenda.models.VideoAula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VideoAulaRepository extends JpaRepository<VideoAula, Integer> {
    
    List<VideoAula> findByCursoIdOrderByIdAsc(Integer cursoId);
}