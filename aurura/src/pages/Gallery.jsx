import { useMemo, useState } from 'react'
import { galleryItems } from '../data/content.js'

const tags = ['All', ...new Set(galleryItems.map((item) => item.tag))]

export default function Gallery() {
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () => (active === 'All' ? galleryItems : galleryItems.filter((g) => g.tag === active)),
    [active],
  )

  return (
    <section className="section page-head-section">
      <div className="page-head">
        <p className="eyebrow">Visual Archive</p>
        <h1>Gallery</h1>
        <p>Campaign stills, studio sessions, and everyday moments from the AURURA world.</p>
      </div>

      <div className="filter-row">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`filter-pill ${active === tag ? 'is-active' : ''}`}
            onClick={() => setActive(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="masonry">
        {filtered.map((item) => (
          <figure className="masonry__item" key={item.id}>
            <img src={item.image} alt={item.caption} />
            <figcaption>
              <span className="masonry__tag">{item.tag}</span>
              <span>{item.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
