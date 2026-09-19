import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroSlides, categories, accessories, momentsImage } from '../data/content.js'

const pillars = ['CLOTHES', 'MOMENTS', 'MOTION', 'DETAIL', 'CITY']

export default function Home() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % heroSlides.length)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero__media">
          {heroSlides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`hero__slide ${i === slide ? 'is-active' : ''}`}
            />
          ))}
          <div className="hero__scrim" />
        </div>

        <div className="hero__content">
          <p className="eyebrow">2026 Collection</p>
          <h1>
            WEAR YOUR <span>OWN LIGHT</span>
          </h1>
          <p className="hero__sub">
            AURURA is tailoring and everyday fits designed around one idea — confidence you can
            feel the moment you put it on.
          </p>
          <div className="hero__actions">
            <Link to="/appointments" className="btn btn-solid">Book a Fitting</Link>
            <Link to="/lookbook" className="btn btn-outline">View Look Book</Link>
          </div>
        </div>

        <div className="hero__dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={i === slide ? 'is-active' : ''}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="section categories">
        <div className="section__head">
          <p className="eyebrow">The Range</p>
          <h2>Built in three parts</h2>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <article className="category-card" key={cat.id}>
              <div className="category-card__media">
                <img src={cat.image} alt={cat.title} />
              </div>
              <div className="category-card__body">
                <p className="category-card__tag">{cat.tagline}</p>
                <h3>{cat.title}</h3>
                <p>{cat.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section manifesto">
        <div className="manifesto__text">
          <p className="eyebrow">Manifesto</p>
          <h2>
            Style has always been a way to speak without saying a word — and that language shows
            up everywhere:
          </h2>
          <div className="manifesto__pills">
            {pillars.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
          <p className="manifesto__copy">
            Fashion isn't only the clothes, or the room, or the occasion. It's the attention paid
            to every small choice — the fit, the fabric, the moment you decided to wear it. AURURA
            is built around that attention.
          </p>
        </div>
        <div className="manifesto__media">
          <img src={momentsImage} alt="AURURA lifestyle moment" />
        </div>
      </section>

      <section className="section accessories">
        <div className="section__head">
          <p className="eyebrow">Finishing Touches</p>
          <h2>Accessories &amp; Accents</h2>
        </div>
        <div className="accessory-grid">
          {accessories.map((item) => (
            <article className="accessory-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <div className="accessory-card__overlay">
                <p className="category-card__tag">{item.tagline}</p>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <h2>Ready to find your fit?</h2>
        <p>Book a one-on-one styling session or a made-to-measure fitting with our studio team.</p>
        <Link to="/appointments" className="btn btn-solid">Book an Appointment</Link>
      </section>
    </>
  )
}
