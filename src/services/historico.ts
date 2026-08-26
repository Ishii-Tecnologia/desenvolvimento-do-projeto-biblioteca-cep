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
  async getAll(
    limit = 200,
    operationFilter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<HistoricoDetailed[]> {
    let query = supabase.from('historico').select('*').order('created_at', { ascending: false })

    if (limit > 0) {
      query = query.limit(limit)
    }

    if (operationFilter && operationFilter !== 'all') {
      query = query.ilike('tipo', operationFilter)
    }

    if (startDate && startDate.trim()) {
      // Começo do dia em UTC/Local
      query = query.gte('created_at', `${startDate.trim()}T00:00:00`)
    }

    if (endDate && endDate.trim()) {
      // Fim do dia em UTC/Local
      query = query.lte('created_at', `${endDate.trim()}T23:59:59.999Z`)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Fallback historico query:', error)
      return []
    }

    const rows = data || []

    // Coletar id_leitores e id_exemplares únicos para busca e enriquecimento
    const readerIds = Array.from(
      new Set(
        rows
          .map((r: any) => r.id_leitor)
          .filter((id: any): id is number => typeof id === 'number' && id > 0),
      ),
    )

    const exemplarIds = Array.from(
      new Set(
        rows
          .map((r: any) => r.entidade_id)
          .filter((id: any): id is string => typeof id === 'string' && id.trim().length > 0),
      ),
    )

    // Buscar leitores em lote se houver id_leitor
    const readersMap = new Map<number, { nome_do_leitor: string; email: string }>()
    if (readerIds.length > 0) {
      const { data: readersData } = await supabase
        .from('leitor')
        .select('id_leitor, nome_do_leitor, email')
        .in('id_leitor', readerIds)

      if (readersData) {
        readersData.forEach((r) => {
          readersMap.set(r.id_leitor, {
            nome_do_leitor: r.nome_do_leitor,
            email: r.email,
          })
        })
      }
    }

    // Buscar exemplares e títulos relacionados
    const exemplarsMap = new Map<
      string,
      {
        id_exemplar: string
        titulo?: {
          titulo_de_livro: string
          autor: string
        }
      }
    >()

    if (exemplarIds.length > 0) {
      const { data: exemplarsData } = await supabase
        .from('exemplar')
        .select(`
          id_exemplar,
          titulo (
            titulo_de_livro,
            autor
          )
        `)
        .in('id_exemplar', exemplarIds)

      if (exemplarsData) {
        exemplarsData.forEach((ex: any) => {
          exemplarsMap.set(ex.id_exemplar, {
            id_exemplar: ex.id_exemplar,
            titulo: ex.titulo
              ? {
                  titulo_de_livro: ex.titulo.titulo_de_livro,
                  autor: ex.titulo.autor,
                }
              : undefined,
          })
        })
      }
    }

    // Map columns from public.historico:
    // tipo -> tipo_operacao
    // created_at -> data_hora
    // descricao -> detalhes
    // entidade_id -> id_exemplar
    // id -> id_log
    const mapped: HistoricoDetailed[] = rows.map((item: any) => {
      const exemplarId = item.entidade_id ? String(item.entidade_id) : '-'
      const leitorInfo = item.id_leitor ? readersMap.get(item.id_leitor) : undefined
      const exemplarInfo = exemplarsMap.get(exemplarId)

      return {
        id_log: item.id,
        id_exemplar: exemplarId,
        tipo_operacao: item.tipo,
        data_hora: item.created_at,
        id_leitor: item.id_leitor || null,
        usuario_sistema: null,
        detalhes: item.descricao,
        leitor: leitorInfo,
        exemplar: exemplarInfo,
      }
    })

    return mapped
  },

  async countWithFilters(
    operationFilter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    let query = supabase.from('historico').select('id', { count: 'exact', head: true })

    if (operationFilter && operationFilter !== 'all') {
      query = query.ilike('tipo', operationFilter)
    }

    if (startDate && startDate.trim()) {
      query = query.gte('created_at', `${startDate.trim()}T00:00:00`)
    }

    if (endDate && endDate.trim()) {
      query = query.lte('created_at', `${endDate.trim()}T23:59:59.999Z`)
    }

    const { count, error } = await query
    if (error) {
      console.error('Erro ao contar logs:', error)
      throw error
    }
    return count ?? 0
  },

  async deleteWithFilters(
    operationFilter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    // 1. Contar quantos serão afetados
    const count = await this.countWithFilters(operationFilter, startDate, endDate)
    if (count === 0) return 0

    // 2. Executar delete
    let query = supabase.from('historico').delete()

    if (operationFilter && operationFilter !== 'all') {
      query = query.ilike('tipo', operationFilter)
    }

    if (startDate && startDate.trim()) {
      query = query.gte('created_at', `${startDate.trim()}T00:00:00`)
    }

    if (endDate && endDate.trim()) {
      query = query.lte('created_at', `${endDate.trim()}T23:59:59.999Z`)
    }

    // Se nenhum filtro foi passado, garantir que deleta com neq id dummy
    if ((!operationFilter || operationFilter === 'all') && !startDate && !endDate) {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000')
    }

    const { error } = await query
    if (error) {
      console.error('Erro ao deletar logs:', error)
      throw error
    }

    return count
  },

  async log(
    id_exemplar: string,
    tipo_operacao: string,
    id_leitor?: number,
    detalhes?: string,
    usuario_sistema = 'Sistema',
    usuario_id?: string,
  ) {
    let finalDescricao = detalhes

    // Enriquecer a descrição automaticamente caso não tenha sido passada
    if (!finalDescricao) {
      if (id_leitor) {
        finalDescricao = `${tipo_operacao} do exemplar ${id_exemplar} para o leitor #${id_leitor}`
      } else {
        finalDescricao = `${tipo_operacao} do exemplar ${id_exemplar}`
      }
    }

    const insertPayload: any = {
      tipo: tipo_operacao,
      descricao: finalDescricao,
      entidade_tipo: 'exemplar',
      entidade_id: id_exemplar || '',
    }

    if (id_leitor) {
      insertPayload.id_leitor = id_leitor
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
