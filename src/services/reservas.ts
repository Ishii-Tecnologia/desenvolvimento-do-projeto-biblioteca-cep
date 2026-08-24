import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert } from '@/lib/supabase/types'

export type Reserva = Tables<'reserva'>
export type ReservaInsert = TablesInsert<'reserva'>

export interface ReservaDetailed extends Reserva {
  titulo?: {
    id_titulo: string
    titulo_de_livro: string
    autor: string
    capa_url: string | null
    categoria: string | null
  }
  leitor?: {
    id_leitor: number
    nome_do_leitor: string
    email: string
    telefone: string | null
    bloqueado: boolean
  }
}

export const ReservasService = {
  async getAll(statusFilter = 'Ativa') {
    let query = supabase
      .from('reserva')
      .select(`
        *,
        titulo (
          id_titulo,
          titulo_de_livro,
          autor,
          capa_url,
          categoria
        ),
        leitor (
          id_leitor,
          nome_do_leitor,
          email,
          telefone,
          bloqueado
        )
      `)
      .order('data_reserva', { ascending: true })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status_reserva', statusFilter)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as unknown as ReservaDetailed[]
  },

  async create(id_titulo: string, id_leitor: number) {
    // Check if reader already has an active reservation for this book
    const { data: existing } = await supabase
      .from('reserva')
      .select('id_reserva')
      .eq('id_titulo', id_titulo)
      .eq('id_leitor', id_leitor)
      .eq('status_reserva', 'Ativa')
      .maybeSingle()

    if (existing) {
      throw new Error('Você já possui uma reserva ativa para esta obra.')
    }

    // Check if reader is blocked
    const { data: leitor } = await supabase
      .from('leitor')
      .select('bloqueado')
      .eq('id_leitor', id_leitor)
      .single()

    if (leitor?.bloqueado) {
      throw new Error('Leitor com cadastro bloqueado não pode solicitar reservas.')
    }

    const { data, error } = await supabase
      .from('reserva')
      .insert({
        id_titulo,
        id_leitor,
        status_reserva: 'Ativa',
        data_reserva: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancel(id_reserva: number) {
    const { data, error } = await supabase
      .from('reserva')
      .update({
        status_reserva: 'Cancelada',
      })
      .eq('id_reserva', id_reserva)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async fulfill(id_reserva: number) {
    const { data, error } = await supabase
      .from('reserva')
      .update({
        status_reserva: 'Atendida',
        data_atendimento: new Date().toISOString(),
      })
      .eq('id_reserva', id_reserva)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
