import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ParametrosService, ParametroSistema } from '@/services/parametros'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Settings, Clock, RotateCw, Save, Loader2, ShieldCheck, Zap, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Configuracoes() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const [params, setParams] = useState<ParametroSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [runningRoutine, setRunningRoutine] = useState(false)

  const [prazoDias, setPrazoDias] = useState('15')
  const [maxRenovacoes, setMaxRenovacoes] = useState('1')

  const loadParams = async () => {
    setLoading(true)
    try {
      const data = await ParametrosService.getAll()
      setParams(data)

      const prazo = data.find((p) => p.nome_parametro === 'prazo_devolucao_dias')
      if (prazo) setPrazoDias(prazo.valor_parametro)

      const ren = data.find((p) => p.nome_parametro === 'max_renovacoes')
      if (ren) setMaxRenovacoes(ren.valor_parametro)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar parâmetros',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParams()
  }, [])

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await Promise.all([
        ParametrosService.updateParam('prazo_devolucao_dias', prazoDias),
        ParametrosService.updateParam('max_renovacoes', maxRenovacoes),
      ])
      toast({
        title: 'Configurações salvas',
        description: 'Os parâmetros operacionais da biblioteca foram atualizados com sucesso.',
      })
      loadParams()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRunOverdueCheck = async () => {
    setRunningRoutine(true)
    try {
      const count = await ParametrosService.checkOverdueRoutine()
      toast({
        title: 'Rotina executada',
        description: `Verificação de atrasos concluída com sucesso (${count || 0} registros avaliados/atualizados).`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro na rotina',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setRunningRoutine(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Configurações & Parâmetros do Sistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Defina as regras de negócio de empréstimos, prazos e rotinas de integridade da Biblioteca.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 font-medium">Carregando configurações...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Rules Form */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Políticas de Empréstimos e Renovações
              </CardTitle>
              <CardDescription>
                Ajuste os valores padrão aplicados a todos os novos empréstimos criados na
                plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveParams} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="prazo" className="text-xs font-semibold text-slate-700">
                      Prazo Padrão de Devolução (Dias Corridos)
                    </Label>
                    <Input
                      id="prazo"
                      type="number"
                      min={1}
                      max={90}
                      value={prazoDias}
                      onChange={(e) => setPrazoDias(e.target.value)}
                      disabled={!isAdmin}
                      className="text-sm font-semibold"
                    />
                    <p className="text-[11px] text-slate-500">
                      Padrão de referência do projeto: 15 dias corridos.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="renovacoes" className="text-xs font-semibold text-slate-700">
                      Limite Máximo de Renovações
                    </Label>
                    <Input
                      id="renovacoes"
                      type="number"
                      min={0}
                      max={10}
                      value={maxRenovacoes}
                      onChange={(e) => setMaxRenovacoes(e.target.value)}
                      disabled={!isAdmin}
                      className="text-sm font-semibold"
                    />
                    <p className="text-[11px] text-slate-500">
                      Padrão: 1 renovação (desde que não haja reservas ativas).
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5 shadow-sm"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Maintenance Routines */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Rotinas de Manutenção & Verificação de Atrasos
              </CardTitle>
              <CardDescription>
                Execute o trigger do banco de dados para recalcular o status de atraso de todos os
                empréstimos em aberto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800">
                    Recalcular Atrasos Imediatamente
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Chama a função segura{' '}
                    <code className="bg-slate-200 px-1 rounded font-mono text-[10px]">
                      verificar_atrasos_geral()
                    </code>{' '}
                    no Supabase.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRunOverdueCheck}
                  disabled={runningRoutine || !isAdmin}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shrink-0"
                >
                  {runningRoutine ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                  )}
                  Executar Verificação
                </Button>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p className="font-semibold text-emerald-950">
                    Ambiente de Operação Gratuita (Biblioteca Pública / Escolar)
                  </p>
                  <p>
                    Conforme especificação funcional do projeto, o sistema não realiza cobranças de
                    taxas, taxas de adesão ou multas por atraso. O controle visa zelar pelo retorno
                    das obras e circulação democrática do acervo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
