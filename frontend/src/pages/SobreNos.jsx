import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ThemeToggle from "../components/ThemeToggle"

import "../styles/sobre.css";

export default function SobreNos() {
  return (
    <div className="sobre-page">
      <Navbar />

      {/* HERO */}
      <section className="sobre-hero">
        <div className="container sobre-hero-inner">
          <br></br>
          <h1 className="sobre-hero-title">
            Educação de qualidade,<br />
            <span className="sobre-hero-destaque">acessível a todos</span>
          </h1>
          <p className="sobre-hero-sub">
            Conheça a plataforma que está transformando a forma como as pessoas aprendem.
          </p>
        </div>
      </section>

      {/* MISSÃO */}
      <section className="sobre-section container">
        <div className="sobre-missao-grid">
          <div className="sobre-missao-texto">
            <br />
            <h2 className="sobre-section-title">O que é o Aprenda+?</h2>
            <p>
              A <strong>Aprenda+</strong> é uma plataforma de cursos online desenvolvida para
              facilitar o aprendizado por meio de trilhas de aprendizagem organizadas,
              acompanhamento de progresso e avaliações integradas. Nosso objetivo é tornar
              a educação de qualidade acessível a qualquer pessoa, independentemente de onde
              ela esteja ou da rotina que possui.
            </p>
            <p>
              O sistema permite que os usuários estudem de forma completamente flexível,
              acessando aulas gravadas e conteúdos educacionais a qualquer momento e em
              qualquer dispositivo — eliminando as barreiras relacionadas à falta de tempo
              e locomoção que historicamente afastam pessoas do conhecimento.
            </p>
            <p>
              Cada curso é estruturado em módulos progressivos, permitindo que o aluno
              evolua no seu próprio ritmo, revisitando conteúdos sempre que necessário e
              acompanhando seu desempenho em tempo real por meio do painel de progresso.
            </p>
          </div>

          <div className="sobre-missao-card">
            <div className="sobre-missao-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <blockquote className="sobre-missao-quote">
              "Aprender não deve ser um privilégio de poucos. Nossa missão é democratizar
              o acesso ao conhecimento e impulsionar o desenvolvimento profissional de cada aluno."
            </blockquote>
            <p className="sobre-missao-autor">— Equipe Aprenda+</p>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="sobre-pilares-wrap">
        <div className="container">
          <h2 className="sobre-section-title sobre-section-title--center">
            Nossos pilares
          </h2>
          <p className="sobre-pilares-sub">
            Tudo o que construímos gira em torno de três compromissos fundamentais.
          </p>

          <div className="sobre-pilares-grid">

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">🎯</div>
              <h3>Aprendizado com propósito</h3>
              <p>
                Cada curso é cuidadosamente estruturado com ementas detalhadas,
                objetivos claros e conteúdos aplicáveis ao mercado de trabalho real,
                para que o aluno saiba exatamente o que vai conquistar ao concluir.
              </p>
            </div>

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">📈</div>
              <h3>Progresso visível</h3>
              <p>
                Acompanhe sua evolução aula a aula com o painel de progresso integrado.
                Saiba quantas aulas foram concluídas, sua média de desempenho e quando
                o certificado de conclusão estará disponível.
              </p>
            </div>

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">🏆</div>
              <h3>Reconhecimento real</h3>
              <p>
                Ao concluir um curso com aproveitamento mínimo, o aluno recebe um
                certificado digital com código de validação único, que pode ser
                verificado por qualquer empresa ou instituição.
              </p>
            </div>

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">💬</div>
              <h3>Suporte do professor</h3>
              <p>
                O aluno não estuda sozinho. A plataforma conta com um canal de dúvidas
                por aula, onde os professores respondem diretamente, garantindo que
                nenhuma dificuldade fique sem resposta.
              </p>
            </div>

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">📱</div>
              <h3>Acesso em qualquer lugar</h3>
              <p>
                A plataforma é totalmente responsiva e pode ser acessada de computadores,
                tablets e smartphones, para que o aprendizado aconteça onde e quando
                for mais conveniente para você.
              </p>
            </div>

            <div className="sobre-pilar-card">
              <div className="sobre-pilar-icon">🔒</div>
              <h3>Segurança e privacidade</h3>
              <p>
                Seus dados estão protegidos. Utilizamos autenticação segura com JWT,
                criptografia de senhas e boas práticas de segurança para garantir
                a privacidade de cada usuário da plataforma.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="sobre-section container">
        <h2 className="sobre-section-title sobre-section-title--center">
          Para quem é o Aprenda+?
        </h2>
        <p className="sobre-pilares-sub">
          Nossa plataforma foi pensada para atender diferentes perfis de pessoas.
        </p>

        <div className="sobre-perfis-grid">
          <div className="sobre-perfil-item">
            <span className="sobre-perfil-icon">👨‍💻</span>
            <h4>Profissionais em transição</h4>
            <p>Que buscam adquirir novas habilidades para mudar de área ou se recolocar no mercado.</p>
          </div>
          <div className="sobre-perfil-item">
            <span className="sobre-perfil-icon">🎓</span>
            <h4>Estudantes</h4>
            <p>Que desejam complementar sua formação acadêmica com conhecimentos práticos e aplicados.</p>
          </div>
          <div className="sobre-perfil-item">
            <span className="sobre-perfil-icon">🚀</span>
            <h4>Empreendedores</h4>
            <p>Que precisam desenvolver múltiplas competências para gerir e escalar seus negócios.</p>
          </div>
          <div className="sobre-perfil-item">
            <span className="sobre-perfil-icon">🧑‍🏫</span>
            <h4>Curiosos por natureza</h4>
            <p>Que simplesmente adoram aprender coisas novas e expandir seus horizontes continuamente.</p>
          </div>
        </div>
      </section>
      <br />
      {/* CTA */}
      <section className="sobre-cta-wrap">
        <div className="container sobre-cta-inner">
          <h2>Pronto para começar?</h2>
          <p>Explore nosso catálogo e dê o primeiro passo na sua jornada de aprendizado.</p>
          <div className="sobre-cta-btns">
            <a href="/cursos" className="btn-primary sobre-cta-btn">
              Ver cursos disponíveis
            </a>
            <a href="/registrar" className="btn-outline sobre-cta-btn">
              Criar conta grátis
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <ThemeToggle />
    </div>
  )
}