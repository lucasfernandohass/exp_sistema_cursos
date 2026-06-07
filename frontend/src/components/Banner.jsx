import { Link } from 'react-router-dom';

export default function Banner() {
  return (
    <section className="promo-banner">

      <div className="container promo-container">

        <h2 className="promo-title">
          Oferta Especial: 100% OFF em Todos os Cursos
        </h2>

        <p className="promo-text">
          Aproveite nossa promoção de lançamento
          e comece hoje mesmo!
        </p>

        
        <Link to="/cursos" className="btn-light" style={{ textDecoration: 'none' }}>
          Aproveitar Oferta
        </Link>

      </div>

    </section>
  )
}