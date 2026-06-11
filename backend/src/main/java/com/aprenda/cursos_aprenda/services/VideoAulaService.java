package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.VideoAulaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.VideoAulaResponseDTO;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.VideoAulaRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideoAulaService {

    @Autowired
    private VideoAulaRepository videoAulaRepository;  // Injeção explícita
    
    @Autowired
    private CursoRepository cursoRepository;

    @Transactional(readOnly = true)
    public List<VideoAulaResponseDTO> listarPorCurso(Integer cursoId) {
        List<VideoAula> aulas = videoAulaRepository.findByCursoIdOrderByIdAsc(cursoId);
        return aulas.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VideoAulaResponseDTO buscarPorId(Integer id) {
        VideoAula videoAula = videoAulaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aula não encontrada: " + id));
        return toDTO(videoAula);
    }

    @Transactional
    public VideoAulaResponseDTO criar(VideoAulaRequestDTO dto) {
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + dto.cursoId()));

        VideoAula videoAula = new VideoAula();
        videoAula.setTitulo(dto.titulo());
        videoAula.setUrl(dto.url());
        videoAula.setDuracao(dto.duracao());
        videoAula.setCurso(curso);

        VideoAula saved = videoAulaRepository.save(videoAula);
        return toDTO(saved);
    }

    @Transactional
    public VideoAulaResponseDTO atualizar(Integer id, VideoAulaRequestDTO dto) {
        VideoAula videoAula = videoAulaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Aula não encontrada: " + id));

        videoAula.setTitulo(dto.titulo());
        videoAula.setUrl(dto.url());
        videoAula.setDuracao(dto.duracao());

        if (dto.cursoId() != null && !videoAula.getCurso().getId().equals(dto.cursoId())) {
            Curso curso = cursoRepository.findById(dto.cursoId())
                    .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + dto.cursoId()));
            videoAula.setCurso(curso);
        }

        VideoAula updated = videoAulaRepository.save(videoAula);
        return toDTO(updated);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!videoAulaRepository.existsById(id)) {
            throw new EntityNotFoundException("Aula não encontrada: " + id);
        }
        videoAulaRepository.deleteById(id);
    }

    private VideoAulaResponseDTO toDTO(VideoAula videoAula) {
        return new VideoAulaResponseDTO(
                videoAula.getId(),
                videoAula.getTitulo(),
                videoAula.getDuracao(),
                videoAula.getUrl(),
                false
        );
    }
}