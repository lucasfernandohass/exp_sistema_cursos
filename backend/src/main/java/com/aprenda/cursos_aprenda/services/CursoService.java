package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.AvaliacaoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.CursoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.response.AvaliacaoResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoCardDTO;
import com.aprenda.cursos_aprenda.dtos.response.CursoDetalheDTO;
import com.aprenda.cursos_aprenda.dtos.response.ProfessorResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.VideoAulaResponseDTO;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.Matricula;
import com.aprenda.cursos_aprenda.models.ProgressoAula;
import com.aprenda.cursos_aprenda.models.Professor;
import com.aprenda.cursos_aprenda.models.VideoAula;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.MatriculaRepository;
import com.aprenda.cursos_aprenda.repositories.ProfessorRepository;
import com.aprenda.cursos_aprenda.repositories.ProgressoAulaRepository;
import com.aprenda.cursos_aprenda.repositories.VideoAulaRepository;  // ← ADICIONAR ESTE IMPORT

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final ProgressoAulaRepository progressoAulaRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final MatriculaRepository matriculaRepository;
    private final VideoAulaRepository videoAulaRepository;  // ← ADICIONAR ESTA LINHA

    @Transactional(readOnly = true)
    public List<CursoCardDTO> listarTodos() {
        return cursoRepository.findAll().stream()
            .map(this::toCardDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CursoCardDTO> pesquisar(String termo) {
        return cursoRepository.searchByTexto(termo + "*").stream()
            .map(this::toCardDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public CursoDetalheDTO buscarPorId(Integer id) {
        Curso curso = findCursoEntityById(id);
        
        // Buscar aluno logado de forma mais robusta
        Integer alunoId = buscarAlunoIdLogado();
        
        System.out.println("=== DEBUG CursoService.buscarPorId ===");
        System.out.println("Curso ID: " + id);
        System.out.println("Aluno ID logado: " + alunoId);
        
        List<VideoAulaResponseDTO> videoAulas = videoAulaRepository
            .findByCursoIdOrderByIdAsc(id)
            .stream()
            .map(video -> {
                System.out.println("VideoAula ID: " + video.getId() + " - Título: " + video.getTitulo());
                boolean assistida = false;
                if (alunoId != null) {
                    assistida = progressoAulaRepository
                        .findByAlunoIdAndVideoAulaId(alunoId, video.getId())
                        .map(ProgressoAula::getAssistida)
                        .orElse(false);
                    System.out.println("  - Assistida para aluno " + alunoId + ": " + assistida);
                }
                return toVideoAulaResponseDTO(video, alunoId);
            })
            .toList();
        
        return toDetalheDTO(curso, videoAulas);
    }

    @Transactional
    public CursoDetalheDTO criar(CursoRequestDTO dto) {
        Curso curso = toEntity(dto);
        Curso salvo = cursoRepository.save(curso);
        List<VideoAulaResponseDTO> videoAulas = List.of(); // Curso novo não tem aulas
        return toDetalheDTO(salvo, videoAulas);
    }

    @Transactional
    public CursoDetalheDTO atualizar(Integer id, CursoRequestDTO dto) {
        Curso curso = findCursoEntityById(id);
        curso.setNome(dto.nome());
        curso.setDescricao(dto.descricao());
        curso.setEmenta(dto.ementa());
        curso.setCargaHoraria(dto.cargaHoraria());
        curso.setNumeroAulas(dto.numeroAulas());
        curso.setPreco(dto.preco());
        curso.setMedia(dto.media());
        curso.setUrlBanner(dto.urlBanner());
        if (dto.professorId() != null) {
            curso.setProfessor(findProfessorById(dto.professorId()));
        } else {
            curso.setProfessor(null);
        }
        Curso atualizado = cursoRepository.save(curso);
        
        // Buscar videoAulas atualizadas
        List<VideoAulaResponseDTO> videoAulas = videoAulaRepository
            .findByCursoIdOrderByIdAsc(id)
            .stream()
            .map(video -> toVideoAulaResponseDTO(video, buscarAlunoIdLogado()))
            .toList();
        
        return toDetalheDTO(atualizado, videoAulas);
    }

    @Transactional
    public void deletar(Integer id) {
        findCursoEntityById(id);
        cursoRepository.deleteById(id);
    }

    /* =========================
       AVALIAÇÃO
    ========================= */

    @Transactional
    public AvaliacaoResponseDTO avaliar(Integer cursoId, AvaliacaoRequestDTO dto) {
        Aluno aluno = buscarAlunoLogado();
        Curso curso = findCursoEntityById(cursoId);

        if (dto.nota() < 1 || dto.nota() > 5) {
            throw new IllegalArgumentException("A nota deve estar entre 1 e 5.");
        }

        boolean matriculado = matriculaRepository
            .existsByAlunoIdAndCursoId(aluno.getId(), cursoId);

        if (!matriculado) {
            throw new IllegalStateException("Apenas alunos matriculados podem avaliar o curso.");
        }

        boolean jaAvaliou = matriculaRepository
            .existsByAlunoIdAndCursoIdAndAvaliacaoNotNull(aluno.getId(), cursoId);

        if (jaAvaliou) {
            throw new IllegalStateException("Você já avaliou este curso.");
        }

        int numAtual = curso.getNumeroAvaliacoes() != null ? curso.getNumeroAvaliacoes() : 0;
        BigDecimal notaAtual = curso.getNotaAvaliacao() != null
            ? curso.getNotaAvaliacao()
            : BigDecimal.ZERO;

        BigDecimal novaMedia = notaAtual
            .multiply(BigDecimal.valueOf(numAtual))
            .add(BigDecimal.valueOf(dto.nota()))
            .divide(BigDecimal.valueOf(numAtual + 1), 1, RoundingMode.HALF_UP);

        curso.setNotaAvaliacao(novaMedia);
        curso.setNumeroAvaliacoes(numAtual + 1);

        Matricula matricula = matriculaRepository
            .findByAlunoIdAndCursoId(aluno.getId(), cursoId)
            .orElseThrow(() -> new EntityNotFoundException("Matrícula não encontrada."));

        matricula.setAvaliacao(dto.nota());
        matriculaRepository.save(matricula);
        cursoRepository.save(curso);

        return new AvaliacaoResponseDTO(
            cursoId,
            curso.getNome(),
            dto.nota(),
            novaMedia,
            numAtual + 1
        );
    }

    /* =========================
       HELPERS PRIVADOS
    ========================= */

    private Curso findCursoEntityById(Integer id) {
        return cursoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + id));
    }

    private Professor findProfessorById(Integer id) {
        return professorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Professor não encontrado: " + id));
    }

    private Curso toEntity(CursoRequestDTO dto) {
        Curso curso = new Curso();
        curso.setNome(dto.nome());
        curso.setDescricao(dto.descricao());
        curso.setEmenta(dto.ementa());
        curso.setCargaHoraria(dto.cargaHoraria());
        curso.setNumeroAulas(dto.numeroAulas());
        curso.setPreco(dto.preco());
        curso.setMedia(dto.media());
        curso.setUrlBanner(dto.urlBanner());
        if (dto.professorId() != null) {
            curso.setProfessor(findProfessorById(dto.professorId()));
        }
        return curso;
    }

    private CursoCardDTO toCardDTO(Curso curso) {
        return new CursoCardDTO(
            curso.getId(),
            curso.getNome(),
            curso.getDescricao(),
            curso.getEmenta(),
            curso.getProfessor() != null ? curso.getProfessor().getNome() : null,
            curso.getNumeroAulas(),
            curso.getCargaHoraria(),
            curso.getPreco(),
            curso.getMedia(),
            curso.getNotaAvaliacao(),
            curso.getNumeroAvaliacoes(),
            curso.getUrlBanner()
        );
    }

    // MÉTODO CORRIGIDO: recebe a lista de videoAulas como parâmetro
    private CursoDetalheDTO toDetalheDTO(Curso curso, List<VideoAulaResponseDTO> videoAulas) {
        return new CursoDetalheDTO(
            curso.getId(),
            curso.getNome(),
            curso.getDescricao(),
            curso.getEmenta(),
            curso.getCargaHoraria(),
            curso.getNumeroAulas(),
            curso.getPreco(),
            curso.getMedia(),
            curso.getNotaAvaliacao(),
            curso.getNumeroAvaliacoes(),
            curso.getUrlBanner(),
            toProfessorDTO(curso.getProfessor()),
            videoAulas  // ← USAR A LISTA RECEBIDA COMO PARÂMETRO
        );
    }

    private ProfessorResponseDTO toProfessorDTO(Professor professor) {
        if (professor == null) return null;
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getEmail(),
            professor.getFormacao(),
            professor.getTelefone()
        );
    }

    private VideoAulaResponseDTO toVideoAulaResponseDTO(VideoAula videoAula, Integer alunoId) {
        boolean assistida = false;
        if (alunoId != null) {
            assistida = progressoAulaRepository
                .findByAlunoIdAndVideoAulaId(alunoId, videoAula.getId())
                .map(ProgressoAula::getAssistida)
                .orElse(false);
        }
        return new VideoAulaResponseDTO(
            videoAula.getId(),
            videoAula.getTitulo(),
            videoAula.getDuracao(),
            videoAula.getUrl(),
            assistida
        );
    }

    private Integer buscarAlunoIdLogado() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                System.out.println("DEBUG: Auth is null or name is null");
                return null;
            }
            
            String email = auth.getName();
            System.out.println("DEBUG: Email do token: '" + email + "'");
            
            // Buscar aluno pelo email (ignorando case)
            Optional<Aluno> aluno = alunoRepository.findByEmailIgnoreCase(email.trim());
            
            if (aluno.isPresent()) {
                System.out.println("DEBUG: Aluno encontrado: ID=" + aluno.get().getId() + ", Email=" + aluno.get().getEmail());
                return aluno.get().getId();
            } else {
                System.out.println("DEBUG: Aluno NÃO encontrado para email: '" + email + "'");
                
                // Listar todos os emails de alunos para debug
                List<Aluno> todosAlunos = alunoRepository.findAll();
                System.out.println("DEBUG: Alunos cadastrados:");
                for (Aluno a : todosAlunos) {
                    System.out.println("  - ID: " + a.getId() + ", Email: '" + a.getEmail() + "'");
                }
            }
        } catch (Exception e) {
            System.out.println("DEBUG: Erro ao buscar aluno: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    private Aluno buscarAlunoLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Usuário não autenticado.");
        }
        return alunoRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado."));
    }
}