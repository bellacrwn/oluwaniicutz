import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand">AURURA</span>
          <p>Modern fits, made with intention. Lagos-born, worn everywhere.</p>
        </div>

        <div className="site-footer__links">
          <div>
            <h4>Explore</h4>
            <Link to="/gallery">Gallery</Link>
            <Link to="/lookbook">Look Book</Link>
            <Link to="/events">Events</Link>
            <Link to="/appointments">Appointments</Link>
          </div>
          <div>
            <h4>Studio</h4>
            <a href="tel:+2347000000000">+234 700 000 0000</a>
            <a href="mailto:hello@aurura.studio">hello@aurura.studio</a>
            <span>Lagos, Nigeria</span>
          </div>
          <div>
            <h4>Follow</h4>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}>TikTok</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Pinterest</a>
          </div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} AURURA. All rights reserved.</span>
      </div>
    </footer>
  )
}
