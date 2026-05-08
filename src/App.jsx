import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import Toast       from './components/ui/Toast'
import AuthModal   from './components/auth/AuthModal'
import Home          from './pages/Home'
import Studio        from './pages/Studio'
import Leaderboard   from './pages/Leaderboard'
import Drops         from './pages/Drops'
import ProductDetail from './pages/ProductDetail'
import Profile       from './pages/Profile'
import NotFound      from './pages/NotFound'
import { useAuthStore } from './store/authStore'

function Layout() {
  const { pathname }   = useLocation()
  const isStudio       = pathname === '/studio'
  const showAuthModal  = useAuthStore((s) => s.showAuthModal)

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <ScrollToTop />
      {!isStudio && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/studio"      element={<Studio />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/drops"       element={<Drops />} />
          <Route path="/design/:id"       element={<ProductDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*"                  element={<NotFound />} />
        </Routes>
      </div>
      {!isStudio && <Footer />}
      <Toast />
      {showAuthModal && <AuthModal />}
    </div>
  )
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
