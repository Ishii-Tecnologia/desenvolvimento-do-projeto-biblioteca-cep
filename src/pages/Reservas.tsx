import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ReservasService, ReservaDetailed } from '@/services/reservas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookmarkCheck,
  Check,
  XCircle,
  Clock,
  Loader2,
  Book,
  User,
  PlusCircle,
  Calendar,
} from 'lucide-react'
import { ReserveModal } from '@/components/ReserveModal'
import { useToast } from '@/hooks/use-toast'

export default function Reservas() {
  const { isOperadorOrAdmin } = useAuth()
  const { toast } = useToast()

  const [reservas, setReservas] = useState<ReservaDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState<string>('Ativa')
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const loadReservas = async () => {
    setLoading(true)
    try {
      const data = await ReservasService.getAll(statusTab)
      setReservas(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar reservas',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservas()
  }, [statusTab])

  const handleFulfill = async (id_reserva: number) => {
    if (!confirm('Deseja marcar esta reserva como atendida (exemplar entregue/retirado)?')) return
    setActionLoadingId(id_reserva)
    try {
      await ReservasService.fulfill(id_reserva)
      toast({
        title: 'Reserva atendida',
        description: 'Status atualizado com sucesso.',
      })
      loadReservas()
    } catch (err: any) {
      toast({
        title: 'Erro ao atender reserva',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (id_reserva: number) => {
    if (!confirm('Deseja cancelar esta solicitação de reserva?')) return
    setActionLoadingId(id_reserva)
    try {
      await ReservasService.cancel(id_reserva)
      toast({
        title: 'Reserva cancelada',
        description: 'A solicitação foi encerrada.',
      })
      loadReservas()
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar reserva',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-emerald-600" />
            Fila de Espera & Reservas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerenciamento de solicitações de reserva para obras com todos os exemplares emprestados.
          </p>
        </div>

        <Button
          onClick={() => setReserveModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full sm:w-96 bg-slate-100 p-1">
          <TabsTrigger value="Ativa" className="text-xs font-semibold">
            Ativas na Fila
          </TabsTrigger>
          <TabsTrigger value="Atendida" className="text-xs font-semibold">
            Atendidas
          </TabsTrigger>
          <TabsTrigger value="Cancelada" className="text-xs font-semibold">
            Canceladas
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs font-semibold">
            Todas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List of reservations */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-medium">Buscando lista de reservas...</p>
        </div>
      ) : reservas.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 p-12 text-center bg-slate-50/50">
          <div className="max-w-md mx-auto space-y-3">
            <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Nenhuma reserva encontrada</h3>
            <p className="text-xs text-slate-500">
              Não constam solicitações para a categoria selecionada.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservas.map((res) => {
            const isLoadingThis = actionLoadingId === res.id_reserva
            return (
              <Card
                key={res.id_reserva}
                className="border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-sm"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
                        Reserva #{res.id_reserva}
                      </span>
                      {res.status_reserva === 'Ativa' && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Aguardando Disponibilidade
                        </Badge>
                      )}
                      {res.status_reserva === 'Atendida' && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Atendida em {formatDate(res.data_atendimento)}
                        </Badge>
                      )}
                      {res.status_reserva === 'Cancelada' && (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-300 text-[11px]">
                          Cancelada
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-start gap-2">
                        <Book className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {res.titulo?.titulo_de_livro}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {res.titulo?.autor} • Código: {res.id_titulo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {res.leitor?.nome_do_leitor}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {res.leitor?.email}{' '}
                            {res.leitor?.telefone ? `• ${res.leitor?.telefone}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Solicitado em:{' '}
                      <span className="font-semibold text-slate-700">
                        {formatDate(res.data_reserva)}
                      </span>
                    </div>

                    {res.status_reserva === 'Ativa' && isOperadorOrAdmin && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingThis}
                          onClick={() => handleCancel(res.id_reserva)}
                          className="h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-100 gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          disabled={isLoadingThis}
                          onClick={() => handleFulfill(res.id_reserva)}
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shadow-sm"
                        >
                          {isLoadingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Atender Reserva
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <ReserveModal
        open={reserveModalOpen}
        onOpenChange={setReserveModalOpen}
        onSuccess={loadReservas}
      />
    </div>
  )
}
