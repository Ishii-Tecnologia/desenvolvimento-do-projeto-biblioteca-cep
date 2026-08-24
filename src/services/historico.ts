import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

export interface HistoricoDetailed {
  id_log: number | string
  id_exemplar: string
  tipo_operacao: string
  data_hora: string
  id_leitor?: number | null
  usuario_sistema?: string | null
  detalhes?: string | null
  exemplar?: {
    id_exemplar: string
    titulo?: {
      titulo_de_livro: string
      autor: string
    }
  }
  leitor?: {
    nome_do_leitor: string
    email: string
  }
}

export const HistoricoService = {
  async getAll(limit = 100, operationFilter?: string) {
    let query = (supabase.from as any)('historico_movimentacao')
      .select(`
        *,
        exemplar (
          id_exemplar,
          titulo (
            titulo_de_livro,
            autor
          )
        ),
        leitor (
          nome_do_leitor,
          email
        )
      `)
      .order('data_hora', { ascending: false })
      .limit(limit)

    if (operationFilter && operationFilter !== 'all') {
      query = query.eq('tipo_operacao', operationFilter)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Fallback historico query:', error)
      return []
    }
    return (data || []) as unknown as HistoricoDetailed[]
  },

  async log(
    id_exemplar: string,
    tipo_operacao: string,
    id_leitor?: number,
    detalhes?: string,
    usuario_sistema = 'Sistema',
  ) {
    const { data, error } = await (supabase.from as any)('historico_movimentacao')
      .insert({
        id_exemplar,
        tipo_operacao,
        id_leitor: id_leitor || null,
        detalhes: detalhes || null,
        usuario_sistema,
      })
      .select()
      .single()

    if (error) console.error('Erro ao registrar log de movimentação:', error)
    return data
  },
}
