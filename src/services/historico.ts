import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

export type HistoricoMovimentacao = Tables<'historico_movimentacao'>

export interface HistoricoDetailed extends HistoricoMovimentacao {
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
    let query = supabase
      .from('historico_movimentacao')
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
    if (error) throw error
    return (data || []) as unknown as HistoricoDetailed[]
  },

  async log(
    id_exemplar: string,
    tipo_operacao: string,
    id_leitor?: number,
    detalhes?: string,
    usuario_sistema = 'Sistema',
  ) {
    const { data, error } = await supabase
      .from('historico_movimentacao')
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
