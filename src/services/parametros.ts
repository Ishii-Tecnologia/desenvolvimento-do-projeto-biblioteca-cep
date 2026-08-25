import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

export type Parametro = Tables<'parametros'>

export const ParametrosService = {
  async getAll() {
    const { data, error } = await supabase.from('parametros').select('*')

    if (error) throw error
    return data
  },

  async getByName(name: string, defaultValue: string): Promise<string> {
    const { data } = await supabase
      .from('parametros')
      .select('valor')
      .eq('chave', name)
      .maybeSingle()

    return data?.valor || defaultValue
  },

  async updateParam(chave: string, valor: string, descricao?: string) {
    const { data, error } = await supabase
      .from('parametros')
      .upsert(
        {
          chave,
          valor,
          ...(descricao ? { descricao } : {}),
        },
        { onConflict: 'chave' },
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
