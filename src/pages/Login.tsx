import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Library, LogIn, UserPlus, Loader2, Shield, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const SEED_USERS = [
  {
    email: 'admin@cep.edu.br',
    password: 'Skip@Pass',
    nome: 'Profª Helena Vasconcelos',
    papel: 'admin' as const,
  },
  {
    email: 'leitor@cep.edu.br',
    password: 'Skip@Pass',
    nome: 'Lucas Mendes',
    papel: 'leitor' as const,
  },
]

export default function Login() {
  const { signIn, signUp, quickLoginAs, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  // Sign in form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Sign up form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  // Seeding initial users if not created yet (runs only once via localStorage)
  useEffect(() => {
    const seedInitialUsers = async () => {
      const alreadySeeded = localStorage.getItem('seed-users-v2-created')
      if (alreadySeeded) return

      try {
        for (const seedUser of SEED_USERS) {
          try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: seedUser.email,
              password: seedUser.password,
              options: {
                data: {
                  nome: seedUser.nome,
                  full_name: seedUser.nome,
                  papel: seedUser.papel,
                  role: seedUser.papel,
                  app_role: seedUser.papel,
                },
              },
            })

            if (signUpError) {
              // If already registered, ignore and continue
              console.log(`Seed user ${seedUser.email} signUp status:`, signUpError.message)
            }

            const userId = signUpData?.user?.id
            if (userId) {
              // Confirm email via RPC
              try {
                await (supabase.rpc as any)('confirm_user_email', { user_id: userId })
              } catch (rpcErr) {
                console.warn(`RPC confirm_user_email warning for ${seedUser.email}:`, rpcErr)
              }

              // Ensure profile entry exists
              try {
                await supabase.from('profiles').upsert(
                  {
                    id: userId,
                    nome: seedUser.nome,
                    full_name: seedUser.nome,
                    email: seedUser.email,
                    papel: seedUser.papel,
                    role: seedUser.papel,
                    bloqueado: false,
                  },
                  { onConflict: 'id' },
                )
              } catch (profileErr) {
                console.warn(`Profiles upsert warning for ${seedUser.email}:`, profileErr)
              }

              // If leitor, ensure leitor entry exists
              if (seedUser.papel === 'leitor') {
                try {
                  await supabase.from('leitor').upsert(
                    {
                      id_auth: userId,
                      nome_do_leitor: seedUser.nome,
                      email: seedUser.email,
                      cpf: '',
                      data_cadastro: new Date().toISOString().split('T')[0],
                      bloqueado: false,
                    },
                    { onConflict: 'id_auth' },
                  )
                } catch (leitorErr) {
                  console.warn(`Leitor upsert warning for ${seedUser.email}:`, leitorErr)
                }
              }
            }
          } catch (itemErr) {
            console.warn(`Error seeding user ${seedUser.email}:`, itemErr)
          }
        }

        localStorage.setItem('seed-users-v2-created', 'true')
      } catch (err) {
        console.warn('Error in seed users routine:', err)
      }
    }

    seedInitialUsers()
  }, [])

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Atenção',
        description: 'Preencha seu e-mail e senha.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast({
          title: 'Falha no login',
          description: error.message || 'Credenciais inválidas.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' })
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (role: 'admin' | 'leitor') => {
    setLoading(true)
    try {
      const { error } = await quickLoginAs(role)
      if (error) {
        toast({
          title: 'Falha no acesso rápido',
          description: error.message || 'Não foi possível entrar com esta conta.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Bem-vindo!',
          description: `Acesso rápido como ${role === 'admin' ? 'Administrador' : 'Leitor'} realizado com sucesso.`,
        })
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regEmail || !regPassword) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    if (regPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await signUp(regEmail, regPassword, regName, 'leitor')
      if (error) {
        toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' })
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Cadastro realizado com sucesso. Você já pode acessar.',
        })
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Library className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Biblioteca CEP</h1>
          <p className="text-xs text-slate-500">Sistema de Gestão de Acervo e Empréstimos</p>
        </div>

        {/* Auth Card */}
        <Card className="border-slate-200 shadow-md bg-white">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <CardHeader className="pb-3">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login" className="text-xs font-semibold">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs font-semibold">
                  Cadastrar-se
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 gap-1.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    Entrar no Sistema
                  </Button>
                </CardFooter>

                {/* Quick login shortcut section */}
                <div className="px-6 pb-6 pt-1 space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-2 text-[11px] font-medium text-slate-400">
                      ou acesse rapidamente
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={loading}
                      className="bg-slate-700 hover:bg-slate-800 text-white border-slate-700 hover:text-white text-xs h-9 gap-1.5 shadow-sm transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Acesso Admin</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickLogin('leitor')}
                      disabled={loading}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 text-xs h-9 gap-1.5 shadow-sm transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>Acesso Leitor</span>
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="regName" className="text-xs font-semibold text-slate-700">
                      Nome Completo
                    </Label>
                    <Input
                      id="regName"
                      required
                      placeholder="Ex: João da Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="regEmail" className="text-xs font-semibold text-slate-700">
                      E-mail
                    </Label>
                    <Input
                      id="regEmail"
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="regPassword" className="text-xs font-semibold text-slate-700">
                      Criar Senha
                    </Label>
                    <Input
                      id="regPassword"
                      type="password"
                      required
                      placeholder="Mínimo de 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 gap-1.5"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Criar Conta de Leitor
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-emerald-700 underline font-medium"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
