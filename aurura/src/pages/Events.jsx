import { events } from '../data/content.js'

export default function Events() {
  return (
    <section className="section page-head-section">
      <div className="page-head">
        <p className="eyebrow">On The Calendar</p>
        <h1>Events</h1>
        <p>Trunk shows, pop-ups and showcases where you can see and try the collection in person.</p>
      </div>

      <div className="events-list">
        {events.map((event) => (
          <article className="event-row" key={event.id}>
            <div className="event-row__date">
              <span>{event.date}</span>
            </div>
            <div className="event-row__body">
              <h3>{event.name}</h3>
              <p className="event-row__location">{event.location}</p>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
