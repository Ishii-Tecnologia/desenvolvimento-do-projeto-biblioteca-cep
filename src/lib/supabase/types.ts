// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
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
            foreignKeyName: "emprestimo_id_exemplar_fkey"
            columns: ["id_exemplar"]
            isOneToOne: false
            referencedRelation: "exemplar"
            referencedColumns: ["id_exemplar"]
          },
          {
            foreignKeyName: "emprestimo_id_leitor_fkey"
            columns: ["id_leitor"]
            isOneToOne: false
            referencedRelation: "leitor"
            referencedColumns: ["id_leitor"]
          },
        ]
      }
      emprestimos: {
        Row: {
          created_at: string
          data_devolucao: string | null
          data_emprestimo: string
          data_prevista: string
          exemplar_id: string
          id: string
          leitor_id: string
          renovado: boolean
          status: string
        }
        Insert: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista: string
          exemplar_id: string
          id?: string
          leitor_id: string
          renovado?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          data_devolucao?: string | null
          data_emprestimo?: string
          data_prevista?: string
          exemplar_id?: string
          id?: string
          leitor_id?: string
          renovado?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_exemplar_id_fkey"
            columns: ["exemplar_id"]
            isOneToOne: false
            referencedRelation: "exemplares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_leitor_id_fkey"
            columns: ["leitor_id"]
            isOneToOne: false
            referencedRelation: "leitores"
            referencedColumns: ["id"]
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
            foreignKeyName: "exemplar_id_titulo_fkey"
            columns: ["id_titulo"]
            isOneToOne: false
            referencedRelation: "titulo"
            referencedColumns: ["id_titulo"]
          },
        ]
      }
      exemplares: {
        Row: {
          codigo: string
          created_at: string
          estante: string | null
          id: string
          status: string
          titulo_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          estante?: string | null
          id?: string
          status?: string
          titulo_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          estante?: string | null
          id?: string
          status?: string
          titulo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exemplares_titulo_id_fkey"
            columns: ["titulo_id"]
            isOneToOne: false
            referencedRelation: "titulos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico: {
        Row: {
          created_at: string
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id?: string
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
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
            foreignKeyName: "historico_movimentacao_id_exemplar_fkey"
            columns: ["id_exemplar"]
            isOneToOne: false
            referencedRelation: "exemplar"
            referencedColumns: ["id_exemplar"]
          },
          {
            foreignKeyName: "historico_movimentacao_id_leitor_fkey"
            columns: ["id_leitor"]
            isOneToOne: false
            referencedRelation: "leitor"
            referencedColumns: ["id_leitor"]
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
      leitores: {
        Row: {
          bloqueado: boolean
          created_at: string
          email: string
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          bloqueado?: boolean
          created_at?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          bloqueado?: boolean
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
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
      parametros: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bloqueado: boolean | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          nome: string | null
          papel: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          bloqueado?: boolean | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          nome?: string | null
          papel?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          bloqueado?: boolean | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          nome?: string | null
          papel?: string | null
          role?: string | null
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
            foreignKeyName: "reserva_id_leitor_fkey"
            columns: ["id_leitor"]
            isOneToOne: false
            referencedRelation: "leitor"
            referencedColumns: ["id_leitor"]
          },
          {
            foreignKeyName: "reserva_id_titulo_fkey"
            columns: ["id_titulo"]
            isOneToOne: false
            referencedRelation: "titulo"
            referencedColumns: ["id_titulo"]
          },
        ]
      }
      reservas: {
        Row: {
          created_at: string
          data_reserva: string
          id: string
          leitor_id: string
          status: string
          titulo_id: string
        }
        Insert: {
          created_at?: string
          data_reserva?: string
          id?: string
          leitor_id: string
          status?: string
          titulo_id: string
        }
        Update: {
          created_at?: string
          data_reserva?: string
          id?: string
          leitor_id?: string
          status?: string
          titulo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_leitor_id_fkey"
            columns: ["leitor_id"]
            isOneToOne: false
            referencedRelation: "leitores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_titulo_id_fkey"
            columns: ["titulo_id"]
            isOneToOne: false
            referencedRelation: "titulos"
            referencedColumns: ["id"]
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
      titulos: {
        Row: {
          ano: number | null
          autor: string
          capa_url: string | null
          codigo: string | null
          created_at: string
          editora: string | null
          genero: string | null
          id: string
          isbn: string | null
          titulo: string
        }
        Insert: {
          ano?: number | null
          autor: string
          capa_url?: string | null
          codigo?: string | null
          created_at?: string
          editora?: string | null
          genero?: string | null
          id?: string
          isbn?: string | null
          titulo: string
        }
        Update: {
          ano?: number | null
          autor?: string
          capa_url?: string | null
          codigo?: string | null
          created_at?: string
          editora?: string | null
          genero?: string | null
          id?: string
          isbn?: string | null
          titulo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_atrasos: { Args: never; Returns: number }
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
      get_current_user_papel: { Args: never; Returns: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

