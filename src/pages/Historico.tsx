import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { HistoricoService, HistoricoDetailed } from '@/services/historico'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  Calendar,
  X,
  AlertTriangle,
  BookmarkCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Historico() {
  const { isOperadorOrAdmin } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [logs, setLogs] = useState<HistoricoDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [operationFilter, setOperationFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Modal de Exclusão de Logs
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteOpFilter, setDeleteOpFilter] = useState<string>('all')
  const [deleteStartDate, setDeleteStartDate] = useState<string>('')
  const [deleteEndDate, setDeleteEndDate] = useState<string>('')
  const [countToDelete, setCountToDelete] = useState<number | null>(null)
  const [countingDelete, setCountingDelete] = useState(false)
  const [executingDelete, setExecutingDelete] = useState(false)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await HistoricoService.getAll(300, operationFilter, startDate, endDate)
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
  }, [operationFilter, startDate, endDate])

  // Recalcula contagem no modal de exclusão quando os filtros mudam
  useEffect(() => {
    if (!deleteModalOpen) return
    let active = true
    setCountingDelete(true)
    HistoricoService.countWithFilters(deleteOpFilter, deleteStartDate, deleteEndDate)
      .then((cnt) => {
        if (active) setCountToDelete(cnt)
      })
      .catch(() => {
        if (active) setCountToDelete(0)
      })
      .finally(() => {
        if (active) setCountingDelete(false)
      })
    return () => {
      active = false
    }
  }, [deleteModalOpen, deleteOpFilter, deleteStartDate, deleteEndDate])

  const handleOpenDeleteModal = () => {
    // Inicializa os filtros do modal com os filtros da tela
    setDeleteOpFilter(operationFilter)
    setDeleteStartDate(startDate)
    setDeleteEndDate(endDate)
    setDeleteModalOpen(true)
  }

  const handleConfirmDeleteLogs = async () => {
    setExecutingDelete(true)
    try {
      const count = await HistoricoService.deleteWithFilters(
        deleteOpFilter,
        deleteStartDate,
        deleteEndDate,
      )
      toast({
        title: 'Logs excluídos',
        description: `${count} registro(s) de log foram removidos com sucesso.`,
      })
      setDeleteModalOpen(false)
      await loadLogs()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir logs',
        description: err.message || 'Não foi possível excluir os registros.',
        variant: 'destructive',
      })
    } finally {
      setExecutingDelete(false)
    }
  }

  // Exportar CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast({
        title: 'Nenhum log para exportar',
        description: 'Não há registros correspondentes aos filtros aplicados.',
        variant: 'destructive',
      })
      return
    }

    const headers = [
      'ID Log',
      'Data e Hora',
      'Tipo de Operação',
      'Exemplar',
      'Livro',
      'Autor',
      'Leitor',
      'Operador / Sistema',
      'Detalhes',
    ]

    const escapeCsv = (str: string | number | null | undefined) => {
      if (str === null || str === undefined) return '""'
      const s = String(str).replace(/"/g, '""')
      return `"${s}"`
    }

    const rows = logs.map((log) => [
      escapeCsv(log.id_log),
      escapeCsv(new Date(log.data_hora).toLocaleString('pt-BR')),
      escapeCsv(log.tipo_operacao),
      escapeCsv(log.id_exemplar),
      escapeCsv(log.exemplar?.titulo?.titulo_de_livro || ''),
      escapeCsv(log.exemplar?.titulo?.autor || ''),
      escapeCsv(log.leitor?.nome_do_leitor || ''),
      escapeCsv(log.usuario_sistema || 'Sistema'),
      escapeCsv(log.detalhes || ''),
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `relatorio_logs_biblioteca_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Exportação concluída',
      description: `${logs.length} registros exportados para CSV com sucesso.`,
    })
  }

  // Exportar PDF via window.print() estilizado
  const handleExportPDF = () => {
    if (logs.length === 0) {
      toast({
        title: 'Nenhum log para exportar',
        description: 'Não há registros correspondentes aos filtros aplicados.',
        variant: 'destructive',
      })
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Pop-up bloqueado',
        description: 'Por favor, autorize os pop-ups no navegador para gerar o PDF.',
        variant: 'destructive',
      })
      return
    }

    const filterDesc = [
      operationFilter !== 'all' ? `Operação: ${operationFilter}` : 'Todas as Operações',
      startDate ? `De: ${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : null,
      endDate ? `Até: ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : null,
    ]
      .filter(Boolean)
      .join(' | ')

    const rowsHtml = logs
      .map(
        (log) => `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">
            ${new Date(log.data_hora).toLocaleString('pt-BR')}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">
            ${log.tipo_operacao}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">
            ${log.id_exemplar}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <strong>${log.exemplar?.titulo?.titulo_de_livro || '-'}</strong>
            ${log.exemplar?.titulo?.autor ? `<br/><span style="color: #64748b; font-size: 10px;">${log.exemplar.titulo.autor}</span>` : ''}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            ${log.leitor?.nome_do_leitor || '-'}
          </td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #475569;">
            ${log.detalhes || '-'}
          </td>
        </tr>
      `,
      )
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relatório de Logs & Auditoria - Biblioteca CEP</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 20px;
              line-height: 1.4;
            }
            .header {
              border-bottom: 2px solid #059669;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            h1 {
              font-size: 18px;
              margin: 0 0 4px 0;
              color: #065f46;
            }
            p {
              margin: 0;
              font-size: 11px;
              color: #64748b;
            }
            .filters-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 11px;
              margin-bottom: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              padding: 8px;
              font-size: 11px;
              font-weight: bold;
              color: #334155;
              border-bottom: 2px solid #cbd5e1;
            }
            @media print {
              body { margin: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Biblioteca CEP — Histórico & Auditoria de Movimentações</h1>
              <p>Relatório oficial de movimentações emitido em: ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div class="filters-box">
            <strong>Filtros aplicados:</strong> ${filterDesc} | <strong>Total de registros:</strong> ${logs.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Operação</th>
                <th>Exemplar</th>
                <th>Livro / Autor</th>
                <th>Leitor</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const handleClearDateFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  const getOperationBadge = (op: string) => {
    switch (op.toLowerCase()) {
      case 'empréstimo':
      case 'emprestimo':
        return (
          <Badge
            onClick={() => navigate('/emprestimos')}
            className="bg-blue-100 text-blue-800 border-blue-200 text-xs gap-1 cursor-pointer hover:bg-blue-200 hover:shadow-xs transition-all select-none"
            title="Ir para Empréstimos"
          >
            <Repeat className="w-3 h-3" />
            Empréstimo
          </Badge>
        )
      case 'devolução':
      case 'devolucao':
        return (
          <Badge
            onClick={() => navigate('/emprestimos')}
            className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs gap-1 cursor-pointer hover:bg-emerald-200 hover:shadow-xs transition-all select-none"
            title="Ir para Empréstimos"
          >
            <CornerDownLeft className="w-3 h-3" />
            Devolução
          </Badge>
        )
      case 'renovação':
      case 'renovacao':
        return (
          <span
            onClick={() => navigate('/emprestimos')}
            className="inline-flex items-center rounded-full border border-teal-200 bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 gap-1 cursor-pointer hover:bg-teal-200 hover:shadow-xs transition-all select-none"
            title="Ir para Empréstimos"
          >
            <RotateCw className="w-3 h-3" />
            Renovação
          </span>
        )
      case 'reserva':
        return (
          <span
            onClick={() => navigate('/reservas')}
            className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 gap-1 cursor-pointer hover:bg-amber-200 hover:shadow-xs transition-all select-none"
            title="Ir para Reservas"
          >
            <BookmarkCheck className="w-3 h-3" />
            Reserva
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {op}
          </span>
        )
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
            Registro detalhado de operações de empréstimos, devoluções, renovações e reservas
            realizadas no sistema.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Dropdown de Exportação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 bg-white border-slate-200 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="text-xs cursor-pointer text-slate-700 hover:text-slate-900"
              >
                <FileText className="w-3.5 h-3.5 mr-2 text-rose-600" />
                Exportar PDF (Impressão)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportCSV}
                className="text-xs cursor-pointer text-slate-700 hover:text-slate-900"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                Exportar CSV (Planilha)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão Excluir Logs (Apenas Admin/Operador) */}
          {isOperadorOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDeleteModal}
              className="text-xs font-medium gap-1.5 bg-white border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Excluir Logs
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Filtros (Operação + Intervalo de Data De/Até) */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
            {/* Filtro por Tipo de Operação */}
            <div className="w-full md:w-56 space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Filter className="w-3 h-3 text-emerald-600" />
                Operação:
              </Label>
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger className="text-xs bg-slate-50/50 h-8">
                  <SelectValue placeholder="Todas as operações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Operações</SelectItem>
                  <SelectItem value="Empréstimo">Apenas Empréstimos</SelectItem>
                  <SelectItem value="Devolução">Apenas Devoluções</SelectItem>
                  <SelectItem value="Renovação">Apenas Renovações</SelectItem>
                  <SelectItem value="Reserva">Apenas Reservas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro De */}
            <div className="w-full sm:w-auto flex-1 space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                De:
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs bg-slate-50/50 h-8"
              />
            </div>

            {/* Filtro Até */}
            <div className="w-full sm:w-auto flex-1 space-y-1">
              <Label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Até:
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs bg-slate-50/50 h-8"
              />
            </div>

            {/* Botão Limpar Filtros de Data */}
            {(startDate || endDate || operationFilter !== 'all') && (
              <div className="self-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOperationFilter('all')
                    handleClearDateFilters()
                  }}
                  className="h-8 text-xs text-slate-500 hover:text-slate-800 gap-1 px-2.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contagem de registros exibidos */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong className="text-slate-800">{logs.length}</strong> registro(s)
          encontrado(s)
          {(startDate || endDate) && (
            <span className="text-slate-400"> (filtrado por período)</span>
          )}
        </span>
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

      {/* Modal de Exclusão de Logs com Filtros */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Excluir Registros de Logs
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600">
              Selecione o período e o tipo de operação para exclusão. Os registros correspondentes
              serão permanentemente deletados da base de dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Filtro de Operação para Deletar */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tipo de Operação</Label>
              <Select value={deleteOpFilter} onValueChange={setDeleteOpFilter}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue placeholder="Selecione a operação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Operações</SelectItem>
                  <SelectItem value="Empréstimo">Empréstimo</SelectItem>
                  <SelectItem value="Devolução">Devolução</SelectItem>
                  <SelectItem value="Renovação">Renovação</SelectItem>
                  <SelectItem value="Reserva">Reserva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intervalo de Data De/Até */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Data Inicial (De)</Label>
                <Input
                  type="date"
                  value={deleteStartDate}
                  onChange={(e) => setDeleteStartDate(e.target.value)}
                  className="text-xs bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Data Final (Até)</Label>
                <Input
                  type="date"
                  value={deleteEndDate}
                  onChange={(e) => setDeleteEndDate(e.target.value)}
                  className="text-xs bg-white"
                />
              </div>
            </div>

            {/* Impacto / Quantidade de Registros Afetados */}
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-semibold text-rose-900">
                  {countingDelete ? (
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      Calculando registros afetados...
                    </span>
                  ) : (
                    <span>
                      Registros a serem excluídos:{' '}
                      <strong className="text-rose-700 text-sm font-bold">
                        {countToDelete ?? 0}
                      </strong>
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-rose-800">
                  {countToDelete === 0
                    ? 'Nenhum registro encontrado para estes filtros.'
                    : 'Atenção: esta ação é irreversível e apagará permanentemente o histórico correspondente.'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={executingDelete}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDeleteLogs}
              disabled={executingDelete || countingDelete || countToDelete === 0}
              className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              {executingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Excluir {countToDelete ? `(${countToDelete}) Registros` : 'Registros'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
