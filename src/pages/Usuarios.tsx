import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  Search,
  Loader2,
  MoreHorizontal,
  UserCheck,
  UserX,
  UserCog,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserModal } from '@/components/UserModal'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface ProfileRecord {
  id: string
  email: string
  nome: string | null
  full_name?: string | null
  papel: string | null
  bloqueado: boolean | null
  created_at: string
  role?: string | null
  avatar_url?: string | null
}

export default function Usuarios() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const [profiles, setProfiles] = useState<ProfileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [userModalOpen, setUserModalOpen] = useState(false)

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles((data as ProfileRecord[]) || [])
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: err.message || 'Não foi possível carregar a lista de perfis.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return profiles

    return profiles.filter((p) => {
      const name = (p.nome || p.full_name || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [profiles, searchTerm])

  const isSelf = (profile: ProfileRecord) => {
    if (!user) return false
    return profile.id === user.id || profile.email.toLowerCase() === user.email?.toLowerCase()
  }

  const handleUpdateRole = async (
    profile: ProfileRecord,
    newRole: 'admin' | 'operador' | 'leitor',
  ) => {
    const currentPapel = profile.papel || profile.role || 'leitor'
    if (currentPapel === newRole) return

    if (isSelf(profile) && newRole !== 'admin') {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode rebaixar o seu próprio papel de administrador.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingId(profile.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ papel: newRole, role: newRole })
        .eq('id', profile.id)

      if (error) throw error

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, papel: newRole, role: newRole } : p)),
      )

      toast({
        title: 'Papel atualizado',
        description: `O papel de ${profile.nome || profile.email} foi alterado para "${newRole}".`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar papel',
        description: err.message || 'Falha na atualização do papel do usuário.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleBlock = async (profile: ProfileRecord) => {
    const targetStatus = !profile.bloqueado

    if (isSelf(profile) && targetStatus === true) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode bloquear o seu próprio usuário administrador.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingId(profile.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bloqueado: targetStatus })
        .eq('id', profile.id)

      if (error) throw error

      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, bloqueado: targetStatus } : p)),
      )

      toast({
        title: targetStatus ? 'Usuário bloqueado' : 'Usuário desbloqueado',
        description: `O usuário ${profile.nome || profile.email} foi ${
          targetStatus ? 'bloqueado com sucesso' : 'desbloqueado com sucesso'
        }.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status',
        description: err.message || 'Falha ao alterar status de bloqueio.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async (profile: ProfileRecord) => {
    if (isSelf(profile)) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode excluir o seu próprio usuário.',
        variant: 'destructive',
      })
      return
    }

    const displayName = profile.nome || profile.full_name || profile.email
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o usuário "${displayName}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }

    setUpdatingId(profile.id)
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id)

      if (error) throw error

      setProfiles((prev) => prev.filter((p) => p.id !== profile.id))

      toast({
        title: 'Usuário excluído',
        description: `O usuário ${displayName} foi excluído com sucesso.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description: err.message || 'Falha ao excluir o usuário da base de dados.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getRoleBadge = (roleName: string | null | undefined) => {
    const r = (roleName || 'leitor').toLowerCase()
    if (r === 'admin') {
      return (
        <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs border-purple-700 shadow-xs">
          admin
        </Badge>
      )
    }
    if (r === 'operador') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs border-blue-700 shadow-xs">
          operador
        </Badge>
      )
    }
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs border-emerald-700 shadow-xs">
        leitor
      </Badge>
    )
  }

  const getInitials = (name?: string | null, email?: string) => {
    const raw = name || email || 'U'
    const parts = raw.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return raw.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-600" />
            Controle de Usuários
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gerencie permissões de acesso, papéis (admin, operador, leitor) e status de bloqueio dos
            usuários cadastrados.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProfiles}
            disabled={loading}
            className="text-xs font-medium gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setUserModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Acesso Restrito</p>
            <p className="text-amber-800">
              Esta área é destinada exclusivamente a administradores do sistema para gestão de
              permissões.
            </p>
          </div>
        </div>
      )}

      {/* Search & Stats Card */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar usuário por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Limpar busca
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Usuários Cadastrados
              </CardTitle>
              <CardDescription className="text-xs">
                Total de {filteredProfiles.length}{' '}
                {filteredProfiles.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs text-slate-500 font-medium">Carregando lista de usuários...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Shield className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">Nenhum usuário encontrado</p>
              <p className="text-xs text-slate-400">
                {searchTerm
                  ? 'Tente ajustar os termos de busca digitados.'
                  : 'Nenhum perfil cadastrado na base de dados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-bold text-slate-700 w-[240px]">
                      Nome
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">Email</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-center">
                      Papel
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-700">
                      Data de Cadastro
                    </TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 text-right w-[80px]">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => {
                    const isCurrentUser = isSelf(p)
                    const role = p.papel || p.role || 'leitor'
                    const isBusy = updatingId === p.id
                    const displayName = p.nome || p.full_name || 'Sem nome'

                    return (
                      <TableRow key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Nome */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-slate-200">
                              <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                {getInitials(p.nome || p.full_name, p.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                                {displayName}
                              </p>
                              {isCurrentUser && (
                                <span className="inline-block text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                                  Você (Logado)
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="text-xs text-slate-700 font-mono">
                          {p.email}
                        </TableCell>

                        {/* Papel */}
                        <TableCell className="text-center">{getRoleBadge(role)}</TableCell>

                        {/* Status (Bloqueado/Ativo) */}
                        <TableCell className="text-center">
                          {p.bloqueado ? (
                            <Badge
                              variant="destructive"
                              className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 text-xs font-medium"
                            >
                              Bloqueado
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 text-xs font-medium"
                            >
                              Ativo
                            </Badge>
                          )}
                        </TableCell>

                        {/* Data de cadastro */}
                        <TableCell className="text-xs text-slate-600">
                          {formatDate(p.created_at)}
                        </TableCell>

                        {/* Ações */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isBusy}
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                aria-label="Ações do usuário"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                ) : (
                                  <MoreHorizontal className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="text-xs text-slate-500">
                                Gerenciar {displayName}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {/* Alterar Papel */}
                              <div className="px-2 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <UserCog className="w-3.5 h-3.5 text-slate-500" />
                                Alterar Papel:
                              </div>
                              <DropdownMenuRadioGroup
                                value={role}
                                onValueChange={(val) =>
                                  handleUpdateRole(p, val as 'admin' | 'operador' | 'leitor')
                                }
                              >
                                <DropdownMenuRadioItem
                                  value="admin"
                                  className="text-xs cursor-pointer focus:bg-purple-50 focus:text-purple-900"
                                >
                                  <span className="w-2 h-2 rounded-full bg-purple-600 mr-2" />
                                  Admin (Administrador)
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="operador"
                                  disabled={isCurrentUser && role === 'admin'}
                                  className="text-xs cursor-pointer focus:bg-blue-50 focus:text-blue-900"
                                >
                                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
                                  Operador (Bibliotecário)
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="leitor"
                                  disabled={isCurrentUser && role === 'admin'}
                                  className="text-xs cursor-pointer focus:bg-emerald-50 focus:text-emerald-900"
                                >
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
                                  Leitor (Padrão)
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>

                              <DropdownMenuSeparator />

                              {/* Bloquear / Desbloquear */}
                              <DropdownMenuItem
                                onClick={() => handleToggleBlock(p)}
                                disabled={isCurrentUser && !p.bloqueado}
                                className={`text-xs cursor-pointer ${
                                  p.bloqueado
                                    ? 'text-emerald-700 focus:text-emerald-800 focus:bg-emerald-50'
                                    : 'text-rose-600 focus:text-rose-700 focus:bg-rose-50'
                                }`}
                              >
                                {p.bloqueado ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                    Desbloquear Usuário
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                    Bloquear Usuário
                                  </>
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Excluir Usuário */}
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(p)}
                                disabled={isCurrentUser}
                                className="text-xs cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                Excluir Usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação de Usuário */}
      <UserModal open={userModalOpen} onOpenChange={setUserModalOpen} onSuccess={fetchProfiles} />
    </div>
  )
}
