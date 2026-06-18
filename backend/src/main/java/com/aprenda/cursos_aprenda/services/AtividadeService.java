package com.aprenda.cursos_aprenda.services;

import com.aprenda.cursos_aprenda.dtos.request.AlternativaRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.AtividadeRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.QuestaoRequestDTO;
import com.aprenda.cursos_aprenda.dtos.request.RespostaItemDTO;
import com.aprenda.cursos_aprenda.dtos.response.AlternativaResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.AtividadeResponseDTO;
import com.aprenda.cursos_aprenda.dtos.response.QuestaoResponseDTO;
import com.aprenda.cursos_aprenda.models.Alternativa;
import com.aprenda.cursos_aprenda.models.Aluno;
import com.aprenda.cursos_aprenda.models.Atividade;
import com.aprenda.cursos_aprenda.models.Curso;
import com.aprenda.cursos_aprenda.models.Questao;
import com.aprenda.cursos_aprenda.models.RespostaQuestao;
import com.aprenda.cursos_aprenda.repositories.AtividadeRepository;
import com.aprenda.cursos_aprenda.repositories.CursoRepository;
import com.aprenda.cursos_aprenda.repositories.MatriculaRepository;
import com.aprenda.cursos_aprenda.repositories.AlunoRepository;
import com.aprenda.cursos_aprenda.repositories.RespostaQuestaoRepository;
import com.aprenda.cursos_aprenda.repositories.RespostaAtividadeQuestoesRepository;
import com.aprenda.cursos_aprenda.models.RespostaAtividadeQuestoes;
import com.aprenda.cursos_aprenda.repositories.QuestaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AtividadeService {

    private final AtividadeRepository atividadeRepository;
    private final CursoRepository cursoRepository;
    private final MatriculaRepository matriculaRepository;
    private final AlunoRepository alunoRepository;
    private final RespostaQuestaoRepository respostaQuestaoRepository;
    private final RespostaAtividadeQuestoesRepository respostaAtividadeQuestoesRepository;
    private final QuestaoRepository questaoRepository;

    @Transactional(readOnly = true)
    public List<AtividadeResponseDTO> listarPorCurso(Integer cursoId) {
        List<Atividade> atividades = atividadeRepository.findByCursoId(cursoId);
        System.out.println("🔍 Atividades encontradas para curso " + cursoId + ": " + atividades.size());
        return atividades.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AtividadeResponseDTO buscarPorId(Integer id) {
        return atividadeRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Atividade não encontrada: " + id));
    }

    @Transactional
    public AtividadeResponseDTO criar(AtividadeRequestDTO dto) {

        if (dto.questoes() == null || dto.questoes().size() != 10) {
            throw new IllegalArgumentException("A atividade deve ter exatamente 10 questões");
        }
        
        Curso curso = cursoRepository.findById(dto.cursoId())
                .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + dto.cursoId()));

        Atividade atividade = new Atividade();
        atividade.setTitulo(dto.titulo());
        atividade.setDescricao(dto.descricao());
        atividade.setCurso(curso);

        List<Questao> questoes = new ArrayList<>();
        int ordem = 1;
        
        for (QuestaoRequestDTO qDto : dto.questoes()) {

            if (qDto.alternativas() == null || qDto.alternativas().size() != 4) {
                throw new IllegalArgumentException("Cada questão deve ter exatamente 4 alternativas");
            }
            
            boolean temCorreta = qDto.alternativas().stream()
                    .anyMatch(AlternativaRequestDTO::correta);
            if (!temCorreta) {
                throw new IllegalArgumentException("Cada questão deve ter uma alternativa correta");
            }

            if (qDto.enunciado() == null || qDto.enunciado().trim().isEmpty()) {
                throw new IllegalArgumentException("O enunciado da questão não pode ser vazio");
            }
            
            Questao questao = new Questao();
            questao.setEnunciado(qDto.enunciado());
            questao.setOrdem(ordem++);
            questao.setAtividade(atividade);

            List<Alternativa> alternativas = new ArrayList<>();
            int altOrdem = 1;
            for (AlternativaRequestDTO aDto : qDto.alternativas()) {

                if (aDto.texto() == null || aDto.texto().trim().isEmpty()) {
                    throw new IllegalArgumentException("O texto da alternativa não pode ser vazio");
                }
                
                Alternativa alternativa = new Alternativa();
                alternativa.setTexto(aDto.texto());
                alternativa.setOrdem(altOrdem++);
                alternativa.setCorreta(aDto.correta());
                alternativa.setQuestao(questao);
                alternativas.add(alternativa);
            }
            questao.setAlternativas(alternativas);
            questoes.add(questao);
        }
        
        atividade.setQuestoes(questoes);

        Atividade saved = atividadeRepository.save(atividade);
        return toDTO(saved);
    }

    @Transactional
    public AtividadeResponseDTO atualizar(Integer id, AtividadeRequestDTO dto) {
        Atividade atividade = atividadeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Atividade não encontrada: " + id));

        atividade.setTitulo(dto.titulo());
        atividade.setDescricao(dto.descricao());

        if (!atividade.getCurso().getId().equals(dto.cursoId())) {
            Curso curso = cursoRepository.findById(dto.cursoId())
                    .orElseThrow(() -> new EntityNotFoundException("Curso não encontrado: " + dto.cursoId()));
            atividade.setCurso(curso);
        }

        atividade.getQuestoes().clear();

        List<Questao> novasQuestoes = new ArrayList<>();
        for (QuestaoRequestDTO qDto : dto.questoes()) {
            Questao questao = new Questao();
            questao.setEnunciado(qDto.enunciado());
            questao.setOrdem(qDto.ordem());
            questao.setAtividade(atividade);

            List<Alternativa> alternativas = new ArrayList<>();
            for (AlternativaRequestDTO aDto : qDto.alternativas()) {
                Alternativa alternativa = new Alternativa();
                alternativa.setTexto(aDto.texto());
                alternativa.setOrdem(aDto.ordem());
                alternativa.setCorreta(aDto.correta());
                alternativa.setQuestao(questao);
                alternativas.add(alternativa);
            }
            questao.setAlternativas(alternativas);
            novasQuestoes.add(questao);
        }
        atividade.setQuestoes(novasQuestoes);

        Atividade updated = atividadeRepository.save(atividade);
        return toDTO(updated);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!atividadeRepository.existsById(id)) {
            throw new EntityNotFoundException("Atividade não encontrada: " + id);
        }
        atividadeRepository.deleteById(id);
    }

    private AtividadeResponseDTO toDTO(Atividade atividade) {
        List<QuestaoResponseDTO> questoesDTO = atividade.getQuestoes().stream()
                .map(this::toQuestaoDTO)
                .collect(Collectors.toList());

        return new AtividadeResponseDTO(
                atividade.getId(),
                atividade.getTitulo(),
                atividade.getDescricao(),
                atividade.getCurso().getId(),
                atividade.getCurso().getNome(),
                questoesDTO
        );
    }

    private QuestaoResponseDTO toQuestaoDTO(Questao questao) {
        List<AlternativaResponseDTO> alternativasDTO = questao.getAlternativas().stream()
                .map(this::toAlternativaDTO)
                .collect(Collectors.toList());

        return new QuestaoResponseDTO(
                questao.getId(),
                questao.getEnunciado(),
                questao.getOrdem(),
                alternativasDTO
        );
    }

    private AlternativaResponseDTO toAlternativaDTO(Alternativa alternativa) {
        return new AlternativaResponseDTO(
                alternativa.getId(),
                alternativa.getTexto(),
                alternativa.getOrdem(),
                alternativa.getCorreta()
        );
    }

    @Transactional
    public Map<String, Object> responderAtividade(Integer alunoId, Integer atividadeId, List<RespostaItemDTO> respostas) {
        
        Atividade atividade = atividadeRepository.findById(atividadeId)
            .orElseThrow(() -> new EntityNotFoundException("Atividade não encontrada: " + atividadeId));
        
        
        boolean matriculado = matriculaRepository.existsByAlunoIdAndCursoId(alunoId, atividade.getCurso().getId());
        if (!matriculado) {
            throw new IllegalArgumentException("Aluno não está matriculado neste curso");
        }
        
        
        Aluno aluno = alunoRepository.findById(alunoId)
            .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado: " + alunoId));
        
        
        int questoesCorretas = 0;
        int totalQuestoes = atividade.getQuestoes().size();
        
        for (RespostaItemDTO respostaDTO : respostas) {
            
            Questao questao = questaoRepository.findById(respostaDTO.questaoId())
                .orElseThrow(() -> new EntityNotFoundException("Questão não encontrada: " + respostaDTO.questaoId()));
            
            
            if (!questao.getAtividade().getId().equals(atividadeId)) {
                throw new IllegalArgumentException("Questão não pertence a esta atividade");
            }
            
            
            List<Alternativa> alternativas = questao.getAlternativas();
            if (respostaDTO.alternativaIndex() < 0 || respostaDTO.alternativaIndex() >= alternativas.size()) {
                throw new IllegalArgumentException("Alternativa inválida");
            }
            
            Alternativa alternativaSelecionada = alternativas.get(respostaDTO.alternativaIndex());
            
            Optional<RespostaQuestao> respostaExistente = respostaQuestaoRepository
                .findByAlunoIdAndQuestaoId(alunoId, questao.getId());
            
            RespostaQuestao resposta;
            if (respostaExistente.isPresent()) {
                resposta = respostaExistente.get();
                resposta.setAlternativaSelecionada(alternativaSelecionada);
                resposta.setCorreta(alternativaSelecionada.getCorreta());
                resposta.setDataResposta(LocalDateTime.now());
            } else {
                resposta = new RespostaQuestao();
                resposta.setAluno(aluno);
                resposta.setQuestao(questao);
                resposta.setAlternativaSelecionada(alternativaSelecionada);
                resposta.setCorreta(alternativaSelecionada.getCorreta());
                resposta.setDataResposta(LocalDateTime.now());
            }
            
            respostaQuestaoRepository.save(resposta);
            
            if (alternativaSelecionada.getCorreta()) {
                questoesCorretas++;
            }
        }
        
        double nota = totalQuestoes > 0 ? (questoesCorretas / (double) totalQuestoes) * 10 : 0;
        
        Optional<RespostaAtividadeQuestoes> resultadoExistente = respostaAtividadeQuestoesRepository
            .findByAlunoIdAndAtividadeId(alunoId, atividadeId);
        
        RespostaAtividadeQuestoes resultado;
        if (resultadoExistente.isPresent()) {
            resultado = resultadoExistente.get();
            resultado.setNota(BigDecimal.valueOf(nota));
            resultado.setQuestoesCorretas(questoesCorretas);
            resultado.setTotalQuestoes(totalQuestoes);
            resultado.setDataEntrega(LocalDateTime.now());
        } else {
            resultado = new RespostaAtividadeQuestoes();
            resultado.setAluno(aluno);
            resultado.setAtividade(atividade);
            resultado.setNota(BigDecimal.valueOf(nota));
            resultado.setQuestoesCorretas(questoesCorretas);
            resultado.setTotalQuestoes(totalQuestoes);
            resultado.setDataEntrega(LocalDateTime.now());
        }
        respostaAtividadeQuestoesRepository.save(resultado);
        
        Map<String, Object> response = new HashMap<>();
        response.put("nota", nota);
        response.put("questoesCorretas", questoesCorretas);
        response.put("totalQuestoes", totalQuestoes);
        response.put("respondida", true);
        
        return response;
    }

    public Map<String, Object> getProgressoAtividade(Integer alunoId, Integer atividadeId) {
        Atividade atividade = atividadeRepository.findById(atividadeId)
            .orElseThrow(() -> new EntityNotFoundException("Atividade não encontrada"));
        
        int totalQuestoes = 10; // Fixo
        
        long respondidasLong = respostaQuestaoRepository.countByAlunoIdAndAtividadeId(alunoId, atividadeId);
        int respondidas = (int) respondidasLong;
        
        Map<String, Object> progresso = new HashMap<>();
        progresso.put("totalQuestoes", totalQuestoes);
        progresso.put("respondidas", respondidas);
        progresso.put("percentual", (respondidas / (double) totalQuestoes) * 100);
        progresso.put("concluida", respondidas == totalQuestoes);
        
        return progresso;
    }

    public Map<String, Object> getStatusAtividade(Integer alunoId, Integer atividadeId) {
        
        Optional<RespostaAtividadeQuestoes> resultado = respostaAtividadeQuestoesRepository
            .findByAlunoIdAndAtividadeId(alunoId, atividadeId);
        
        Map<String, Object> status = new HashMap<>();
        status.put("atividadeId", atividadeId);
        status.put("respondida", resultado.isPresent());
        
        if (resultado.isPresent()) {
            RespostaAtividadeQuestoes r = resultado.get();
            status.put("nota", r.getNota());
            status.put("questoesCorretas", r.getQuestoesCorretas());
            status.put("totalQuestoes", r.getTotalQuestoes());
        } else {
            status.put("nota", null);
            status.put("questoesCorretas", 0);
            status.put("totalQuestoes", 10);
        }
        
        return status;
    }

    public List<Map<String, Object>> getRespostasAluno(Integer alunoId, Integer atividadeId) {
        try {
            
            List<RespostaQuestao> respostas = respostaQuestaoRepository
                .findByAlunoIdAndAtividadeId(alunoId, atividadeId);
            
            if (respostas == null || respostas.isEmpty()) {
                return new ArrayList<>();
            }
            
            List<Map<String, Object>> resultado = new ArrayList<>();
            
            for (RespostaQuestao r : respostas) {
                try {
                    Map<String, Object> item = new HashMap<>();
                    item.put("questaoId", r.getQuestao().getId());
                    
                    if (r.getAlternativaSelecionada() != null) {
                        item.put("alternativaIndex", r.getAlternativaSelecionada().getOrdem() - 1);
                    } else {
                        item.put("alternativaIndex", -1);
                    }
                    
                    // Correta
                    item.put("correta", r.getCorreta() != null && r.getCorreta());
                    
                    int alternativaCorretaIndex = -1;
                    if (r.getQuestao() != null && r.getQuestao().getAlternativas() != null) {
                        for (Alternativa alt : r.getQuestao().getAlternativas()) {
                            if (alt.getCorreta()) {
                                alternativaCorretaIndex = alt.getOrdem() - 1;
                                break;
                            }
                        }
                    }
                    item.put("alternativaCorretaIndex", alternativaCorretaIndex);
                    
                    resultado.add(item);
                    
                } catch (Exception e) {
                    System.err.println("Erro ao processar resposta: " + e.getMessage());

                }
            }
            return resultado;
            
        } catch (Exception e) {
            System.err.println("Erro em getRespostasAluno: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar respostas do aluno: " + e.getMessage());
        }
    }

    public Map<String, Object> getProgressoAtividadesCurso(Integer alunoId, Integer cursoId) {
        
        List<Atividade> atividades = atividadeRepository.findByCursoId(cursoId);
        
        int total = atividades.size();
        int respondidas = 0;
        
        if (total > 0) {
            for (Atividade atividade : atividades) {
                Optional<RespostaAtividadeQuestoes> resultado = respostaAtividadeQuestoesRepository
                    .findByAlunoIdAndAtividadeId(alunoId, atividade.getId());
                if (resultado.isPresent()) {
                    respondidas++;
                }
            }
        }
        
        Map<String, Object> progresso = new HashMap<>();
        progresso.put("total", total);
        progresso.put("respondidas", respondidas);
        progresso.put("percentual", total > 0 ? (respondidas / (double) total) * 100 : 0);
        
        return progresso;
    }

}