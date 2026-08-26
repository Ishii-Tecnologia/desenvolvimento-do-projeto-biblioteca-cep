import { supabase } from '@/lib/supabase/client'

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
  async getAll(limit = 100, operationFilter?: string): Promise<HistoricoDetailed[]> {
    let query = supabase
      .from('historico')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (operationFilter && operationFilter !== 'all') {
      query = query.ilike('tipo', operationFilter)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Fallback historico query:', error)
      return []
    }

    // Map columns from public.historico:
    // tipo -> tipo_operacao
    // created_at -> data_hora
    // descricao -> detalhes
    // entidade_id -> id_exemplar
    // id -> id_log
    const mapped: HistoricoDetailed[] = (data || []).map((item) => ({
      id_log: item.id,
      id_exemplar: item.entidade_id ? String(item.entidade_id) : '-',
      tipo_operacao: item.tipo,
      data_hora: item.created_at,
      id_leitor: null,
      usuario_sistema: null,
      detalhes: item.descricao,
    }))

    return mapped
  },

  async log(
    id_exemplar: string,
    tipo_operacao: string,
    id_leitor?: number,
    detalhes?: string,
    usuario_sistema = 'Sistema',
    usuario_id?: string,
  ) {
    const insertPayload: any = {
      tipo: tipo_operacao,
      descricao: detalhes || `${tipo_operacao} realizado`,
      entidade_tipo: 'exemplar',
      entidade_id: id_exemplar || '',
    }

    if (usuario_id) {
      insertPayload.usuario_id = usuario_id
    }

    const { data, error } = await supabase.from('historico').insert(insertPayload).select().single()

    if (error) {
      console.error('Erro ao registrar log de historico:', error)
      throw error
    }
    return data
  },
}
