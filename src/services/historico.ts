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

// Helper to convert string to a valid deterministic UUID format if needed
function stringToUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(str)) {
    return str
  }
  // Generate a valid RFC4122 v4-ish or standard UUID from arbitrary string
  const clean = str
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .padEnd(32, '0')
    .slice(0, 32)
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-4${clean.slice(13, 16)}-a${clean.slice(17, 20)}-${clean.slice(20, 32)}`
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
    // entidade_id -> id_exemplar (if entidade_tipo = 'exemplar' or fallback)
    // id -> id_log
    const mapped: HistoricoDetailed[] = (data || []).map((item) => ({
      id_log: item.id,
      id_exemplar:
        item.entidade_tipo === 'exemplar'
          ? String(item.entidade_id)
          : String(item.entidade_id || '-'),
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
    const entidadeId = stringToUuid(id_exemplar || '00000000-0000-0000-0000-000000000000')

    const insertPayload: any = {
      tipo: tipo_operacao,
      descricao: detalhes || `${tipo_operacao} realizado`,
      entidade_tipo: 'exemplar',
      entidade_id: entidadeId,
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
