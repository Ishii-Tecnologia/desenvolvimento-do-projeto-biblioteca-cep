import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types'

export type Emprestimo = Tables<'emprestimo'>
export type EmprestimoInsert = TablesInsert<'emprestimo'>
export type EmprestimoUpdate = TablesUpdate<'emprestimo'>

export interface EmprestimoDetailed extends Emprestimo {
  exemplar?: {
    id_exemplar: string
    seq: number
    status: string
    localizacao: string | null
    titulo?: {
      id_titulo: string
      titulo_de_livro: string
      autor: string
      editora: string | null
      capa_url: string | null
      categoria: string | null
    }
  }
  leitor?: {
    id_leitor: number
    nome_do_leitor: string
    email: string
    telefone: string | null
    cpf: string | null
    bloqueado: boolean
  }
}

export const EmprestimosService = {
  async getAll(
    statusFilter: 'todos' | 'ativos' | 'atrasados' | 'devolvidos' = 'todos',
    searchQuery?: string,
  ) {
    let query = supabase
      .from('emprestimo')
      .select(`
        *,
        exemplar (
          id_exemplar,
          seq,
          status,
          localizacao,
          titulo (
            id_titulo,
            titulo_de_livro,
            autor,
            editora,
            capa_url,
            categoria
          )
        ),
        leitor (
          id_leitor,
          nome_do_leitor,
          email,
          telefone,
          cpf,
          bloqueado
        )
      `)
      .order('data_emprestimo', { ascending: false })

    if (statusFilter === 'ativos') {
      query = query.is('data_devolucao_real', null)
    } else if (statusFilter === 'devolvidos') {
      query = query.not('data_devolucao_real', 'is', null)
    } else if (statusFilter === 'atrasados') {
      const now = new Date().toISOString()
      query = query.is('data_devolucao_real', null).lt('data_prevista_devolucao', now)
    }

    const { data, error } = await query
    if (error) throw error

    let result = (data || []) as unknown as EmprestimoDetailed[]

    // Calculate real-time delay status
    const now = new Date()
    result = result.map((emp) => {
      const isReturned = !!emp.data_devolucao_real
      const expected = new Date(emp.data_prevista_devolucao)
      const isOverdue = !isReturned && expected < now
      let diffDays = 0
      if (isOverdue) {
        diffDays = Math.ceil((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
      }

      return {
        ...emp,
        atraso: emp.atraso || isOverdue,
        dias_atraso: isOverdue ? diffDays : emp.dias_atraso || 0,
      }
    })

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        const bookTitle = item.exemplar?.titulo?.titulo_de_livro?.toLowerCase() || ''
        const author = item.exemplar?.titulo?.autor?.toLowerCase() || ''
        const readerName = item.leitor?.nome_do_leitor?.toLowerCase() || ''
        const readerEmail = item.leitor?.email?.toLowerCase() || ''
        const copyId = item.id_exemplar.toLowerCase()

        return (
          bookTitle.includes(q) ||
          author.includes(q) ||
          readerName.includes(q) ||
          readerEmail.includes(q) ||
          copyId.includes(q)
        )
      })
    }

    return result
  },

  async getDashboardMetrics() {
    // 1. Total books and available copies
    const { data: exemplares } = await supabase.from('exemplar').select('status')
    const totalExemplares = exemplares?.length || 0
    const disponiveis = exemplares?.filter((e) => e.status === 'Disponivel').length || 0
    const emprestados = exemplares?.filter((e) => e.status === 'Emprestado').length || 0
    const manutencao =
      exemplares?.filter((e) => e.status === 'Manutencao' || e.status === 'Perdido').length || 0

    // 2. Active readers
    const { count: totalLeitores } = await supabase
      .from('leitor')
      .select('*', { count: 'exact', head: true })
    const { count: leitoresBloqueados } = await supabase
      .from('leitor')
      .select('*', { count: 'exact', head: true })
      .eq('bloqueado', true)

    // 3. Titles count
    const { count: totalTitulos } = await supabase
      .from('titulo')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // 4. Active & Overdue Loans
    const { data: activeLoans } = await supabase
      .from('emprestimo')
      .select('id_emprestimo, data_prevista_devolucao, atraso, data_devolucao_real')
      .is('data_devolucao_real', null)

    const now = new Date()
    const totalAtivos = activeLoans?.length || 0
    const totalAtrasados =
      activeLoans?.filter((l) => l.atraso || new Date(l.data_prevista_devolucao) < now).length || 0

    // 5. Active Reservations
    const { count: totalReservas } = await supabase
      .from('reserva')
      .select('*', { count: 'exact', head: true })
      .eq('status_reserva', 'Ativa')

    return {
      totalTitulos: totalTitulos || 0,
      totalExemplares,
      exemplaresDisponiveis: disponiveis,
      exemplaresEmprestados: emprestados,
      exemplaresManutencao: manutencao,
      totalLeitores: totalLeitores || 0,
      leitoresBloqueados: leitoresBloqueados || 0,
      emprestimosAtivos: totalAtivos,
      emprestimosAtrasados: totalAtrasados,
      reservasAtivas: totalReservas || 0,
    }
  },

  async createLoan(id_exemplar: string, id_leitor: number, operatorName = 'Sistema') {
    // Check if the RPC emprestar_exemplar is available
    const { data, error } = await supabase.rpc('emprestar_exemplar', {
      p_id_exemplar: id_exemplar,
      p_id_leitor: id_leitor,
      p_usuario_sistema: operatorName,
    })

    if (error) {
      // Fallback direct execution if RPC fails
      console.warn('RPC loan failed, falling back to direct query', error)

      // 1. Check exemplar
      const { data: ex, error: exErr } = await supabase
        .from('exemplar')
        .select('*')
        .eq('id_exemplar', id_exemplar)
        .single()
      if (exErr || !ex) throw new Error('Exemplar não encontrado.')
      if (ex.status !== 'Disponivel')
        throw new Error(`Exemplar não disponível. Status atual: ${ex.status}`)

      // 2. Check reader
      const { data: reader, error: rErr } = await supabase
        .from('leitor')
        .select('*')
        .eq('id_leitor', id_leitor)
        .single()
      if (rErr || !reader) throw new Error('Leitor não encontrado.')
      if (reader.bloqueado) throw new Error('Leitor bloqueado para novos empréstimos.')

      // 3. Compute dates (15 days)
      const now = new Date()
      const expected = new Date()
      expected.setDate(now.getDate() + 15)

      // 4. Create loan
      const { data: newLoan, error: loanErr } = await supabase
        .from('emprestimo')
        .insert({
          id_exemplar: id_exemplar,
          id_leitor: id_leitor,
          data_emprestimo: now.toISOString(),
          data_prevista_devolucao: expected.toISOString(),
          atraso: false,
          dias_atraso: 0,
          numero_renovacoes: 0,
        })
        .select()
        .single()
      if (loanErr) throw loanErr

      // 5. Update exemplar
      await supabase
        .from('exemplar')
        .update({ status: 'Emprestado' })
        .eq('id_exemplar', id_exemplar)

      // 6. Log history
      try {
        await (supabase.from as any)('historico_movimentacao').insert({
          id_exemplar: id_exemplar,
          id_leitor: id_leitor,
          tipo_operacao: 'Empréstimo',
          usuario_sistema: operatorName,
          detalhes: `Empréstimo realizado. Devolução prevista: ${expected.toLocaleDateString('pt-BR')}`,
        })
      } catch (hErr) {
        console.warn('Log history error:', hErr)
      }

      return {
        sucesso: true,
        id_emprestimo: newLoan.id_emprestimo,
        message: 'Empréstimo realizado com sucesso!',
      }
    }

    const res = typeof data === 'string' ? JSON.parse(data) : data
    if (res && res.sucesso === false) {
      throw new Error(res.mensagem || res.error || 'Erro ao realizar empréstimo.')
    }
    return res
  },

  async returnLoan(id_exemplar: string, operatorName = 'Sistema') {
    const { data, error } = await supabase.rpc('devolver_exemplar', {
      p_id_exemplar: id_exemplar,
      p_usuario_sistema: operatorName,
    })

    if (error) {
      console.warn('RPC return failed, falling back to direct table update', error)
      // Fallback
      const { data: loan, error: lErr } = await supabase
        .from('emprestimo')
        .select('*')
        .eq('id_exemplar', id_exemplar)
        .is('data_devolucao_real', null)
        .order('data_emprestimo', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lErr || !loan) throw new Error('Empréstimo ativo não encontrado para este exemplar.')

      const now = new Date()
      const expected = new Date(loan.data_prevista_devolucao)
      const isLate = now > expected
      const daysLate = isLate
        ? Math.ceil((now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      await supabase
        .from('emprestimo')
        .update({
          data_devolucao_real: now.toISOString(),
          atraso: isLate,
          dias_atraso: daysLate,
        })
        .eq('id_emprestimo', loan.id_emprestimo)

      await supabase
        .from('exemplar')
        .update({ status: 'Disponivel' })
        .eq('id_exemplar', id_exemplar)

      try {
        await (supabase.from as any)('historico_movimentacao').insert({
          id_exemplar: id_exemplar,
          id_leitor: loan.id_leitor,
          tipo_operacao: 'Devolução',
          usuario_sistema: operatorName,
          detalhes: isLate ? `Devolução com ${daysLate} dias de atraso.` : 'Devolução no prazo.',
        })
      } catch (hErr) {
        console.warn('Log history error:', hErr)
      }

      return { sucesso: true, mensagem: 'Devolução registrada com sucesso!' }
    }

    const res = typeof data === 'string' ? JSON.parse(data) : data
    if (res && res.sucesso === false) {
      throw new Error(res.mensagem || res.error || 'Erro ao registrar devolução.')
    }
    return res
  },

  async renewLoan(id_emprestimo: number, operatorName = 'Sistema') {
    const { data, error } = await supabase.rpc('renovar_emprestimo', {
      p_id_emprestimo: id_emprestimo,
      p_usuario_sistema: operatorName,
    })

    if (error) {
      console.warn('RPC renew failed, falling back to manual renewal', error)
      // Fallback
      const { data: loan, error: lErr } = await supabase
        .from('emprestimo')
        .select('*, exemplar(*)')
        .eq('id_emprestimo', id_emprestimo)
        .single()

      if (lErr || !loan) throw new Error('Empréstimo não encontrado.')
      if (loan.data_devolucao_real) throw new Error('Livro já devolvido.')
      if (loan.numero_renovacoes >= 1)
        throw new Error('Limite de renovação atingido (máx: 1 renovação).')

      const currentExpected = new Date(loan.data_prevista_devolucao)
      const newExpected = new Date(currentExpected)
      newExpected.setDate(newExpected.getDate() + 15)

      await supabase
        .from('emprestimo')
        .update({
          data_prevista_devolucao: newExpected.toISOString(),
          numero_renovacoes: (loan.numero_renovacoes || 0) + 1,
          atraso: false,
          dias_atraso: 0,
        })
        .eq('id_emprestimo', id_emprestimo)

      try {
        await (supabase.from as any)('historico_movimentacao').insert({
          id_exemplar: loan.id_exemplar,
          id_leitor: loan.id_leitor,
          tipo_operacao: 'Renovação',
          usuario_sistema: operatorName,
          detalhes: `Renovado até ${newExpected.toLocaleDateString('pt-BR')}`,
        })
      } catch (hErr) {
        console.warn('Log history error:', hErr)
      }

      return {
        sucesso: true,
        nova_data_prevista: newExpected.toISOString(),
        mensagem: 'Empréstimo renovado com sucesso!',
      }
    }

    const res = typeof data === 'string' ? JSON.parse(data) : data
    if (res && res.sucesso === false) {
      throw new Error(res.mensagem || res.error || 'Erro ao renovar empréstimo.')
    }
    return res
  },
}
