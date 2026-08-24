import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { HistoricoService, HistoricoDetailed } from '@/services/historico'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  History,
  Repeat,
  CornerDownLeft,
  RotateCw,
  Clock,
  Filter,
  Loader2,
  Book,
  User,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Historico() {
  const { isOperadorOrAdmin } = useAuth()
  const { toast } = useToast()

  const [logs, setLogs] = useState<HistoricoDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [operationFilter, setOperationFilter] = useState<string>('all')

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await HistoricoService.getAll(150, operationFilter)
      setLogs(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar histórico',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [operationFilter])

  const getOperationBadge = (op: string) => {
    switch (op.toLowerCase()) {
      case 'empréstimo':
      case 'emprestimo':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs gap-1">
            <Repeat className="w-3 h-3" />
            Empréstimo
          </Badge>
        )
      case 'devolução':
      case 'devolucao':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs gap-1">
            <CornerDownLeft className="w-3 h-3" />
            Devolução
          </Badge>
        )
      case 'renovação':
      case 'renovacao':
        return (
          <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-xs gap-1">
            <RotateCw className="w-3 h-3" />
            Renovação
          </Badge>
        )
      default:
        return <Badge variant="outline">{op}</Badge>
    }
  }

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            Histórico & Auditoria de Movimentações
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registro imutável de todas as operações de empréstimos, renovações e devoluções
            realizadas no sistema.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="text-xs bg-white">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <SelectValue placeholder="Todas as operações" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Operações</SelectItem>
              <SelectItem value="Empréstimo">Apenas Empréstimos</SelectItem>
              <SelectItem value="Devolução">Apenas Devoluções</SelectItem>
              <SelectItem value="Renovação">Apenas Renovações</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-medium">Carregando trilha de auditoria...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 p-12 text-center bg-slate-50/50">
          <div className="max-w-md mx-auto space-y-3">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-500">
              Não há movimentações registradas para o filtro selecionado.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <Card
              key={log.id_log}
              className="border-slate-200 bg-white hover:border-slate-300 transition-all p-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getOperationBadge(log.tipo_operacao)}
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border">
                      {log.id_exemplar}
                    </span>
                    {log.exemplar?.titulo && (
                      <span className="text-xs font-semibold text-slate-800">
                        {log.exemplar.titulo.titulo_de_livro}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    {log.leitor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Leitor:{' '}
                        <strong className="text-slate-800">{log.leitor.nome_do_leitor}</strong>
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-500">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Operador: {log.usuario_sistema || 'Sistema'}
                    </span>

                    {log.detalhes && (
                      <span className="text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded">
                        "{log.detalhes}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTimestamp(log.data_hora)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Log #{log.id_log}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
