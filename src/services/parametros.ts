import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

export type ParametroSistema = Tables<'parametro_sistema'>

export const ParametrosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('parametro_sistema')
      .select('*')
      .order('id_parametro', { ascending: true })

    if (error) throw error
    return data
  },

  async getByName(name: string, defaultValue: string): Promise<string> {
    const { data } = await supabase
      .from('parametro_sistema')
      .select('valor_parametro')
      .eq('nome_parametro', name)
      .maybeSingle()

    return data?.valor_parametro || defaultValue
  },

  async updateParam(nome_parametro: string, valor_parametro: string, descricao?: string) {
    const { data, error } = await supabase
      .from('parametro_sistema')
      .upsert(
        {
          nome_parametro,
          valor_parametro,
          ...(descricao ? { descricao } : {}),
        },
        { onConflict: 'nome_parametro' },
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  async checkOverdueRoutine() {
    try {
      const { data, error } = await supabase.rpc('verificar_atrasos_geral')
      if (error) console.error('Erro na rotina de verificação de atrasos:', error)
      return data
    } catch (e) {
      console.error('Erro ao chamar verificar_atrasos_geral:', e)
      return 0
    }
  },
}
