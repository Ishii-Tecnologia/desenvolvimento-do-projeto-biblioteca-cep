import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Acervo from './pages/Acervo'
import Emprestimos from './pages/Emprestimos'
import Leitores from './pages/Leitores'
import Reservas from './pages/Reservas'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/acervo" element={<Acervo />} />
            <Route path="/emprestimos" element={<Emprestimos />} />
            <Route path="/leitores" element={<Leitores />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
