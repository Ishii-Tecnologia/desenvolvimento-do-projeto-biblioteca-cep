// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      emprestimo: {
        Row: {
          atraso: boolean
          created_at: string
          data_devolucao_real: string | null
          data_emprestimo: string
          data_prevista_devolucao: string
          dias_atraso: number | null
          id_emprestimo: number
          id_exemplar: string
          id_leitor: number
          numero_renovacoes: number
        }
        Insert: {
          atraso?: boolean
          created_at?: string
          data_devolucao_real?: string | null
          data_emprestimo?: string
          data_prevista_devolucao: string
          dias_atraso?: number | null
          id_emprestimo?: never
          id_exemplar: string
          id_leitor: number
          numero_renovacoes?: number
        }
        Update: {
          atraso?: boolean
          created_at?: string
          data_devolucao_real?: string | null
          data_emprestimo?: string
          data_prevista_devolucao?: string
          dias_atraso?: number | null
          id_emprestimo?: never
          id_exemplar?: string
          id_leitor?: number
          numero_renovacoes?: number
        }
        Relationships: [
          {
            foreignKeyName: 'emprestimo_id_exemplar_fkey'
            columns: ['id_exemplar']
            isOneToOne: false
            referencedRelation: 'exemplar'
            referencedColumns: ['id_exemplar']
          },
          {
            foreignKeyName: 'emprestimo_id_leitor_fkey'
            columns: ['id_leitor']
            isOneToOne: false
            referencedRelation: 'leitor'
            referencedColumns: ['id_leitor']
          },
        ]
      }
      exemplar: {
        Row: {
          created_at: string
          id_exemplar: string
          id_titulo: string
          localizacao: string | null
          seq: number
          status: string
        }
        Insert: {
          created_at?: string
          id_exemplar: string
          id_titulo: string
          localizacao?: string | null
          seq: number
          status?: string
        }
        Update: {
          created_at?: string
          id_exemplar?: string
          id_titulo?: string
          localizacao?: string | null
          seq?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exemplar_id_titulo_fkey'
            columns: ['id_titulo']
            isOneToOne: false
            referencedRelation: 'titulo'
            referencedColumns: ['id_titulo']
          },
        ]
      }
      historico_movimentacao: {
        Row: {
          data_hora: string
          detalhes: string | null
          id_exemplar: string
          id_leitor: number | null
          id_log: number
          tipo_operacao: string
          usuario_sistema: string
        }
        Insert: {
          data_hora?: string
          detalhes?: string | null
          id_exemplar: string
          id_leitor?: number | null
          id_log?: never
          tipo_operacao: string
          usuario_sistema: string
        }
        Update: {
          data_hora?: string
          detalhes?: string | null
          id_exemplar?: string
          id_leitor?: number | null
          id_log?: never
          tipo_operacao?: string
          usuario_sistema?: string
        }
        Relationships: [
          {
            foreignKeyName: 'historico_movimentacao_id_exemplar_fkey'
            columns: ['id_exemplar']
            isOneToOne: false
            referencedRelation: 'exemplar'
            referencedColumns: ['id_exemplar']
          },
          {
            foreignKeyName: 'historico_movimentacao_id_leitor_fkey'
            columns: ['id_leitor']
            isOneToOne: false
            referencedRelation: 'leitor'
            referencedColumns: ['id_leitor']
          },
        ]
      }
      leitor: {
        Row: {
          bloqueado: boolean
          cpf: string | null
          created_at: string
          data_cadastro: string
          email: string
          id_auth: string | null
          id_leitor: number
          nome_do_leitor: string
          telefone: string | null
        }
        Insert: {
          bloqueado?: boolean
          cpf?: string | null
          created_at?: string
          data_cadastro?: string
          email: string
          id_auth?: string | null
          id_leitor?: never
          nome_do_leitor: string
          telefone?: string | null
        }
        Update: {
          bloqueado?: boolean
          cpf?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string
          id_auth?: string | null
          id_leitor?: never
          nome_do_leitor?: string
          telefone?: string | null
        }
        Relationships: []
      }
      parametro_sistema: {
        Row: {
          descricao: string | null
          id_parametro: number
          nome_parametro: string
          valor_parametro: string
        }
        Insert: {
          descricao?: string | null
          id_parametro?: never
          nome_parametro: string
          valor_parametro: string
        }
        Update: {
          descricao?: string | null
          id_parametro?: never
          nome_parametro?: string
          valor_parametro?: string
        }
        Relationships: []
      }
      reserva: {
        Row: {
          created_at: string
          data_atendimento: string | null
          data_reserva: string
          id_leitor: number
          id_reserva: number
          id_titulo: string
          status_reserva: string
        }
        Insert: {
          created_at?: string
          data_atendimento?: string | null
          data_reserva?: string
          id_leitor: number
          id_reserva?: never
          id_titulo: string
          status_reserva?: string
        }
        Update: {
          created_at?: string
          data_atendimento?: string | null
          data_reserva?: string
          id_leitor?: number
          id_reserva?: never
          id_titulo?: string
          status_reserva?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reserva_id_leitor_fkey'
            columns: ['id_leitor']
            isOneToOne: false
            referencedRelation: 'leitor'
            referencedColumns: ['id_leitor']
          },
          {
            foreignKeyName: 'reserva_id_titulo_fkey'
            columns: ['id_titulo']
            isOneToOne: false
            referencedRelation: 'titulo'
            referencedColumns: ['id_titulo']
          },
        ]
      }
      titulo: {
        Row: {
          ano_publicacao: number | null
          ativo: boolean
          autor: string
          capa_url: string | null
          categoria: string | null
          created_at: string
          editora: string | null
          id_titulo: string
          isbn: string | null
          titulo_de_livro: string
          vol: number
        }
        Insert: {
          ano_publicacao?: number | null
          ativo?: boolean
          autor: string
          capa_url?: string | null
          categoria?: string | null
          created_at?: string
          editora?: string | null
          id_titulo: string
          isbn?: string | null
          titulo_de_livro: string
          vol?: number
        }
        Update: {
          ano_publicacao?: number | null
          ativo?: boolean
          autor?: string
          capa_url?: string | null
          categoria?: string | null
          created_at?: string
          editora?: string | null
          id_titulo?: string
          isbn?: string | null
          titulo_de_livro?: string
          vol?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile: { Args: never; Returns: string }
      devolver_exemplar: {
        Args: { p_id_exemplar: string; p_usuario_sistema?: string }
        Returns: Json
      }
      emprestar_exemplar: {
        Args: {
          p_id_exemplar: string
          p_id_leitor: number
          p_usuario_sistema?: string
        }
        Returns: Json
      }
      gerar_id_titulo: {
        Args: { p_autor: string; p_titulo?: string }
        Returns: string
      }
      renovar_emprestimo: {
        Args: { p_id_emprestimo: number; p_usuario_sistema?: string }
        Returns: Json
      }
      verificar_atrasos_geral: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
