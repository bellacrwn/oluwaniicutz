import { useState } from 'react'
import { services, timeSlots } from '../data/content.js'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  service: services[0],
  date: '',
  time: timeSlots[0],
  notes: '',
}

export default function Appointments() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="section page-head-section">
      <div className="page-head">
        <p className="eyebrow">Reserve Your Slot</p>
        <h1>Appointments</h1>
        <p>Book a styling session, a made-to-measure fitting, or a wardrobe consultation with the AURURA team.</p>
      </div>

      <div className="appointment-layout">
        <div className="appointment-info">
          <h3>Studio Hours</h3>
          <ul>
            <li>Tuesday — Saturday: 10:00 AM – 7:00 PM</li>
            <li>Sunday — Monday: By appointment only</li>
          </ul>
          <h3>Location</h3>
          <p>12 Adeola Odeku Street, Victoria Island, Lagos</p>
          <h3>Contact</h3>
          <p>
            <a href="tel:+2347000000000">+234 700 000 0000</a>
            <br />
            <a href="mailto:hello@aurura.studio">hello@aurura.studio</a>
          </p>
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="form-success">
              <h3>You're booked in!</h3>
              <p>
                Thank you, {form.name || 'friend'}. We've noted your request for{' '}
                <strong>{form.service}</strong> on <strong>{form.date || 'a date you\'ll confirm'}</strong> at{' '}
                <strong>{form.time}</strong>. Our team will reach out shortly to confirm.
              </p>
              <button type="button" className="btn btn-outline" onClick={() => { setForm(initialForm); setSubmitted(false) }}>
                Book Another
              </button>
            </div>
          ) : (
            <>
              <div className="form-row">
                <label>
                  Full Name
                  <input type="text" required value={form.name} onChange={update('name')} placeholder="Your name" />
                </label>
                <label>
                  Phone
                  <input type="tel" required value={form.phone} onChange={update('phone')} placeholder="+234..." />
                </label>
              </div>

              <label>
                Email
                <input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
              </label>

              <label>
                Service
                <select value={form.service} onChange={update('service')}>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <div className="form-row">
                <label>
                  Preferred Date
                  <input type="date" required value={form.date} onChange={update('date')} />
                </label>
                <label>
                  Preferred Time
                  <select value={form.time} onChange={update('time')}>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Notes (optional)
                <textarea rows="3" value={form.notes} onChange={update('notes')} placeholder="Anything we should know?" />
              </label>

              <button type="submit" className="btn btn-solid">Confirm Booking</button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
