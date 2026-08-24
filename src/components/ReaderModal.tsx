import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LeitoresService, Leitor } from '@/services/leitores'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Loader2 } from 'lucide-react'

interface ReaderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  readerToEdit?: Leitor | null
  onSuccess: () => void
}

export function ReaderModal({ open, onOpenChange, readerToEdit, onSuccess }: ReaderModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome_do_leitor: '',
    email: '',
    cpf: '',
    telefone: '',
    bloqueado: false,
  })

  useEffect(() => {
    if (readerToEdit) {
      setFormData({
        nome_do_leitor: readerToEdit.nome_do_leitor,
        email: readerToEdit.email,
        cpf: readerToEdit.cpf || '',
        telefone: readerToEdit.telefone || '',
        bloqueado: readerToEdit.bloqueado || false,
      })
    } else {
      setFormData({
        nome_do_leitor: '',
        email: '',
        cpf: '',
        telefone: '',
        bloqueado: false,
      })
    }
  }, [readerToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome_do_leitor.trim() || !formData.email.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome completo e e-mail são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      if (readerToEdit) {
        await LeitoresService.update(readerToEdit.id_leitor, {
          nome_do_leitor: formData.nome_do_leitor,
          email: formData.email,
          cpf: formData.cpf || null,
          telefone: formData.telefone || null,
          bloqueado: formData.bloqueado,
        })
        toast({ title: 'Sucesso', description: 'Dados do leitor atualizados com sucesso!' })
      } else {
        await LeitoresService.create({
          nome_do_leitor: formData.nome_do_leitor,
          email: formData.email,
          cpf: formData.cpf || null,
          telefone: formData.telefone || null,
          bloqueado: formData.bloqueado,
        })
        toast({ title: 'Sucesso', description: 'Novo leitor cadastrado com sucesso!' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar leitor',
        description: err.message || 'Verifique se o e-mail ou CPF já não estão cadastrados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              {readerToEdit ? 'Editar Cadastro do Leitor' : 'Cadastrar Novo Leitor'}
            </DialogTitle>
            <DialogDescription>
              {readerToEdit
                ? 'Atualize as informações de contato e permissão do leitor.'
                : 'Cadastre um leitor para habilitar a realização de empréstimos.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nome_do_leitor" className="text-xs font-semibold text-slate-700">
                Nome Completo *
              </Label>
              <Input
                id="nome_do_leitor"
                required
                placeholder="Ex: Maria dos Santos"
                value={formData.nome_do_leitor}
                onChange={(e) => setFormData({ ...formData, nome_do_leitor: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail Institucional ou Pessoal *
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Ex: maria.santos@escola.br"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cpf" className="text-xs font-semibold text-slate-700">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="telefone" className="text-xs font-semibold text-slate-700">
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="telefone"
                  placeholder="(41) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {readerToEdit && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-slate-800">
                    Bloquear Empréstimos
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Impede o leitor de solicitar novos livros por pendências
                  </p>
                </div>
                <Switch
                  checked={formData.bloqueado}
                  onCheckedChange={(checked) => setFormData({ ...formData, bloqueado: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {readerToEdit ? 'Salvar Alterações' : 'Salvar Cadastro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
