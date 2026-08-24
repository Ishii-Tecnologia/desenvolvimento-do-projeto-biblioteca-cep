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
import { TitulosService, Titulo } from '@/services/titulos'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Loader2, BookPlus, RefreshCw } from 'lucide-react'

interface BookFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookToEdit?: Titulo | null
  onSuccess: () => void
}

export function BookFormModal({ open, onOpenChange, bookToEdit, onSuccess }: BookFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState(false)

  const [formData, setFormData] = useState({
    id_titulo: '',
    titulo_de_livro: '',
    autor: '',
    editora: '',
    ano_publicacao: new Date().getFullYear(),
    isbn: '',
    categoria: 'Geral',
    vol: 0,
    capa_url: '',
    exemplaresIniciais: 1,
    localizacao: 'Estante Geral',
  })

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        id_titulo: bookToEdit.id_titulo,
        titulo_de_livro: bookToEdit.titulo_de_livro,
        autor: bookToEdit.autor,
        editora: bookToEdit.editora || '',
        ano_publicacao: bookToEdit.ano_publicacao || new Date().getFullYear(),
        isbn: bookToEdit.isbn || '',
        categoria: bookToEdit.categoria || 'Geral',
        vol: bookToEdit.vol || 0,
        capa_url: bookToEdit.capa_url || '',
        exemplaresIniciais: 0,
        localizacao: '',
      })
    } else {
      setFormData({
        id_titulo: '',
        titulo_de_livro: '',
        autor: '',
        editora: '',
        ano_publicacao: new Date().getFullYear(),
        isbn: '',
        categoria: 'Literatura Brasileira',
        vol: 0,
        capa_url: '',
        exemplaresIniciais: 1,
        localizacao: 'Estante A-1',
      })
    }
  }, [bookToEdit, open])

  const handleGenerateCode = async () => {
    if (!formData.autor.trim()) {
      toast({
        title: 'Informe o autor',
        description: 'Digite o nome do autor para gerar o código padronizado (Ex: MC-001).',
        variant: 'destructive',
      })
      return
    }
    setGeneratingId(true)
    try {
      const code = await TitulosService.generateId(formData.autor, formData.titulo_de_livro)
      setFormData((prev) => ({ ...prev, id_titulo: code }))
    } catch (e: any) {
      toast({ title: 'Erro ao gerar código', description: e.message, variant: 'destructive' })
    } finally {
      setGeneratingId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo_de_livro.trim() || !formData.autor.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Título e Autor são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      if (bookToEdit) {
        await TitulosService.update(bookToEdit.id_titulo, {
          titulo_de_livro: formData.titulo_de_livro,
          autor: formData.autor,
          editora: formData.editora || null,
          ano_publicacao: formData.ano_publicacao ? Number(formData.ano_publicacao) : null,
          isbn: formData.isbn || null,
          categoria: formData.categoria || null,
          vol: Number(formData.vol) || 0,
          capa_url: formData.capa_url || null,
        })
        toast({ title: 'Sucesso', description: 'Livro atualizado com sucesso!' })
      } else {
        await TitulosService.create(
          {
            id_titulo: formData.id_titulo || undefined,
            titulo_de_livro: formData.titulo_de_livro,
            autor: formData.autor,
            editora: formData.editora || null,
            ano_publicacao: formData.ano_publicacao ? Number(formData.ano_publicacao) : null,
            isbn: formData.isbn || null,
            categoria: formData.categoria || null,
            vol: Number(formData.vol) || 0,
            capa_url: formData.capa_url || null,
          },
          formData.exemplaresIniciais,
          formData.localizacao,
        )
        toast({ title: 'Sucesso', description: 'Novo livro cadastrado com sucesso!' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar livro',
        description: err.message || 'Ocorreu um erro ao processar a requisição.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <BookPlus className="w-5 h-5 text-emerald-600" />
              {bookToEdit ? 'Editar Obra do Acervo' : 'Cadastrar Novo Livro'}
            </DialogTitle>
            <DialogDescription>
              {bookToEdit
                ? 'Atualize os dados bibliográficos deste título.'
                : 'Insira os dados do livro e a quantidade inicial de cópias físicas (exemplares).'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label htmlFor="titulo_de_livro" className="text-xs font-semibold text-slate-700">
                  Título do Livro *
                </Label>
                <Input
                  id="titulo_de_livro"
                  required
                  placeholder="Ex: Dom Casmurro"
                  value={formData.titulo_de_livro}
                  onChange={(e) => setFormData({ ...formData, titulo_de_livro: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="id_titulo"
                  className="text-xs font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span>Código (ID)</span>
                  {!bookToEdit && (
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={generatingId}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-medium"
                    >
                      {generatingId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Auto
                    </button>
                  )}
                </Label>
                <Input
                  id="id_titulo"
                  disabled={!!bookToEdit}
                  placeholder="Ex: MC-001"
                  value={formData.id_titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, id_titulo: e.target.value.toUpperCase() })
                  }
                  className="mt-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="autor" className="text-xs font-semibold text-slate-700">
                  Autor(a) *
                </Label>
                <Input
                  id="autor"
                  required
                  placeholder="Ex: Machado de Assis"
                  value={formData.autor}
                  onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editora" className="text-xs font-semibold text-slate-700">
                  Editora
                </Label>
                <Input
                  id="editora"
                  placeholder="Ex: Companhia das Letras"
                  value={formData.editora}
                  onChange={(e) => setFormData({ ...formData, editora: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="categoria" className="text-xs font-semibold text-slate-700">
                  Categoria / Gênero
                </Label>
                <Input
                  id="categoria"
                  placeholder="Ex: Ficção, História, Exatas"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ano_publicacao" className="text-xs font-semibold text-slate-700">
                  Ano de Publicação
                </Label>
                <Input
                  id="ano_publicacao"
                  type="number"
                  placeholder="Ex: 2020"
                  value={formData.ano_publicacao || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ano_publicacao: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="vol" className="text-xs font-semibold text-slate-700">
                  Volume / Edição
                </Label>
                <Input
                  id="vol"
                  type="number"
                  min={0}
                  placeholder="0 se único"
                  value={formData.vol || ''}
                  onChange={(e) => setFormData({ ...formData, vol: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="isbn" className="text-xs font-semibold text-slate-700">
                  ISBN (opcional)
                </Label>
                <Input
                  id="isbn"
                  placeholder="Ex: 978-85-359-0277-8"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="capa_url" className="text-xs font-semibold text-slate-700">
                  URL da Imagem da Capa (opcional)
                </Label>
                <Input
                  id="capa_url"
                  placeholder="https://..."
                  value={formData.capa_url}
                  onChange={(e) => setFormData({ ...formData, capa_url: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {!bookToEdit && (
              <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100 space-y-3">
                <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  Gerar Cópias Físicas Iniciais (Exemplares)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="exemplaresIniciais"
                      className="text-xs font-medium text-emerald-800"
                    >
                      Quantidade de Cópias
                    </Label>
                    <Input
                      id="exemplaresIniciais"
                      type="number"
                      min={1}
                      max={50}
                      value={formData.exemplaresIniciais}
                      onChange={(e) =>
                        setFormData({ ...formData, exemplaresIniciais: Number(e.target.value) })
                      }
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="localizacao" className="text-xs font-medium text-emerald-800">
                      Localização na Biblioteca
                    </Label>
                    <Input
                      id="localizacao"
                      placeholder="Ex: Estante B - Prateleira 2"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
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
              {bookToEdit ? 'Salvar Alterações' : 'Cadastrar Livro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
