import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Gallery from './pages/Gallery.jsx'
import LookBook from './pages/LookBook.jsx'
import Events from './pages/Events.jsx'
import Appointments from './pages/Appointments.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/lookbook" element={<LookBook />} />
          <Route path="/events" element={<Events />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
