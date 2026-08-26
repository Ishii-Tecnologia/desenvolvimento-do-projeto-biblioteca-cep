import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert } from '@/lib/supabase/types'
import { HistoricoService } from './historico'
import { getPrazoEmprestimoDias } from './parametros'

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

  async fulfill(id_reserva: number, operatorName = 'Sistema') {
    // 1. Obter dados completos da reserva atual
    const { data: reservaData, error: resErr } = await supabase
      .from('reserva')
      .select(`
        *,
        titulo (
          id_titulo,
          titulo_de_livro
        ),
        leitor (
          id_leitor,
          nome_do_leitor
        )
      `)
      .eq('id_reserva', id_reserva)
      .single()

    if (resErr || !reservaData) {
      throw new Error('Reserva não encontrada.')
    }

    // 2. Buscar um exemplar disponível ou reservado para este título
    const { data: exemplares, error: exErr } = await supabase
      .from('exemplar')
      .select('*')
      .eq('id_titulo', reservaData.id_titulo)
      .order('seq', { ascending: true })

    if (exErr) throw exErr

    const exemplarDisponivel = exemplares?.find(
      (e) => e.status === 'Disponivel' || e.status === 'Reservado',
    )

    if (!exemplarDisponivel) {
      throw new Error('Nenhum exemplar disponível para atender esta reserva no momento.')
    }

    // 3. Atualizar status da reserva para "Atendida"
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

    // 4. Criar o empréstimo correspondente
    const prazoDias = await getPrazoEmprestimoDias()
    const now = new Date()
    const expected = new Date()
    expected.setDate(now.getDate() + prazoDias)

    const { error: loanErr } = await supabase.from('emprestimo').insert({
      id_exemplar: exemplarDisponivel.id_exemplar,
      id_leitor: reservaData.id_leitor,
      data_emprestimo: now.toISOString(),
      data_prevista_devolucao: expected.toISOString(),
      atraso: false,
      dias_atraso: 0,
      numero_renovacoes: 0,
    })

    if (loanErr) throw loanErr

    // 5. Atualizar o status do exemplar para 'Emprestado'
    await supabase
      .from('exemplar')
      .update({ status: 'Emprestado' })
      .eq('id_exemplar', exemplarDisponivel.id_exemplar)

    // 6. Registrar log no HistoricoService
    const leitorNome =
      (reservaData.leitor as any)?.nome_do_leitor || `Leitor #${reservaData.id_leitor}`
    const copyId = exemplarDisponivel.id_exemplar

    try {
      await HistoricoService.log(
        copyId,
        'Empréstimo',
        reservaData.id_leitor,
        `Reserva atendida: empréstimo do livro ${copyId} para o leitor ${leitorNome}`,
        operatorName,
      )
    } catch (logError) {
      console.warn('Erro ao registrar log da reserva atendida:', logError)
    }

    return data
  },
}
