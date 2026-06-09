import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ThemeToggle from "../components/ThemeToggle"

export default function Contato() {
  return (
    <div className="contato-page">
      <Navbar />

      {/* HERO */}
      <section className="sobre-hero">
        <div className="container sobre-hero-inner">
          <br />
          <h1 className="sobre-hero-title">
            Fale com a<br />
            <span className="sobre-hero-destaque">equipe Aprenda+</span>
          </h1>
          <p className="sobre-hero-sub">
            Estamos aqui para tirar suas dúvidas e ouvir suas sugestões.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="sobre-section container">
        <div className="contato-grid">

          {/* COLUNA ESQUERDA — texto + blockquote */}
          <div className="contato-texto">
            <h2 className="sobre-section-title">Como podemos ajudar?</h2>

            <p>
              A <strong>Aprenda+</strong> acredita que a comunicação transparente é parte
              essencial de uma boa experiência educacional. Por isso, mantemos canais
              abertos para que alunos e interessados possam entrar em contato
              com nossa equipe de forma simples e direta.
            </p>

            <p>
              Se você tem dúvidas sobre algum curso, precisa de suporte técnico, deseja
              sugerir melhorias na plataforma ou tem interesse em se tornar um professor
              parceiro, nossa equipe está pronta para responder. Valorizamos cada mensagem
              recebida e nos comprometemos a oferecer respostas claras e ágeis.
            </p>

            <blockquote className="contato-blockquote">
              "Cada dúvida respondida é uma barreira ao aprendizado derrubada.
              Não hesite em nos contatar — sua mensagem faz diferença."
              <footer>— Equipe de Suporte Aprenda+</footer>
            </blockquote>

            <p>
              Nossa equipe opera em dias úteis e se dedica a responder todas as
              solicitações no menor tempo possível. Independentemente do assunto,
              você receberá atenção personalizada e um atendimento que respeita
              sua trajetória de aprendizado.
            </p>

            {/* CANAIS */}
            <div className="contato-canais">
              <div className="contato-canal-item">
                <span className="contato-canal-icon">📧</span>
                <div>
                  <p className="contato-canal-label">E-mail</p>
                  <p className="contato-canal-valor">contato@aprendamais.com.br</p>
                </div>
              </div>
              <div className="contato-canal-item">
                <span className="contato-canal-icon">⏱</span>
                <div>
                  <p className="contato-canal-label">Horário de atendimento</p>
                  <p className="contato-canal-valor">Segunda a sexta, das 8h às 18h</p>
                </div>
              </div>
              <div className="contato-canal-item">
                <span className="contato-canal-icon">💬</span>
                <div>
                  <p className="contato-canal-label">Dúvidas sobre aulas</p>
                  <p className="contato-canal-valor">Use o canal de dúvidas dentro de cada aula</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA — card informativo */}
          <aside className="contato-aside">

            <div className="contato-aside-card">
              <h3>Antes de entrar em contato</h3>
              <p>
                Muitas dúvidas comuns já têm respostas disponíveis. Confira
                os recursos abaixo antes de nos enviar uma mensagem:
              </p>
              <ul className="contato-aside-lista">
                <li>
                  <span>➤</span>
                  <span>Acesse o canal de dúvidas diretamente na aula em que você tem dificuldades</span>
                </li>
                <li>
                  <span>➤</span>
                  <span>Verifique os requisitos de conclusão no seu painel de aluno</span>
                </li>
                <li>
                  <span>➤</span>
                  <span>Consulte a ementa do curso para entender o que será abordado</span>
                </li>
                <li>
                  <span>➤</span>
                  <span>Problemas de acesso? Tente redefinir sua senha pela tela de login</span>
                </li>
              </ul>
            </div>

            <div className="contato-aside-card contato-aside-card--destaque">
            
              <h3>Outros problemas</h3>
              <p>
                Erros na plataforma, inconsistências no progresso, dificuldades
                de acesso ou qualquer outra situação não prevista — relate com
                o máximo de detalhes possível para que possamos investigar e
                resolver com agilidade.
              </p>
              <a
                href="mailto:contato@aprendamais.com.br"
                className="btn-primary contato-email-btn"
              >
                contato@aprendamais.com.br
              </a>
            </div>

          </aside>
        </div>
      </section>

      <Footer />
      <ThemeToggle />
    </div>
  )
}