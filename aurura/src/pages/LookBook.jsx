import { lookbookChapters } from '../data/content.js'

export default function LookBook() {
  return (
    <section className="lookbook">
      <div className="page-head">
        <p className="eyebrow">2026 Collection</p>
        <h1>Look Book</h1>
        <p>Three chapters, one wardrobe — built to move from daylight into after hours.</p>
      </div>

      {lookbookChapters.map((chapter, index) => (
        <article
          className={`lookbook__chapter ${index % 2 === 1 ? 'is-reversed' : ''}`}
          key={chapter.id}
        >
          <div className="lookbook__media">
            <img src={chapter.image} alt={chapter.title} />
          </div>
          <div className="lookbook__text">
            <p className="eyebrow">{chapter.subtitle}</p>
            <h2>{chapter.title}</h2>
            <p>{chapter.copy}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
