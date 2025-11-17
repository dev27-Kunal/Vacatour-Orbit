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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          conversions: number | null
          experiment_id: string | null
          exposures: number | null
          id: string
          last_conversion: string | null
          last_exposure: string | null
          user_id: string | null
          variant_name: string
        }
        Insert: {
          assigned_at?: string | null
          conversions?: number | null
          experiment_id?: string | null
          exposures?: number | null
          id?: string
          last_conversion?: string | null
          last_exposure?: string | null
          user_id?: string | null
          variant_name: string
        }
        Update: {
          assigned_at?: string | null
          conversions?: number | null
          experiment_id?: string | null
          exposures?: number | null
          id?: string
          last_conversion?: string | null
          last_exposure?: string | null
          user_id?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_experiments: {
        Row: {
          completed_at: string | null
          confidence_level: number | null
          control_variant: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          minimum_detectable_effect: number | null
          name: string
          primary_metric: string
          secondary_metrics: string[] | null
          start_date: string | null
          statistical_significance: number | null
          status: string | null
          target_sample_size: number | null
          test_variants: Json[]
          type: string
          updated_at: string | null
          winner_variant: string | null
        }
        Insert: {
          completed_at?: string | null
          confidence_level?: number | null
          control_variant: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          minimum_detectable_effect?: number | null
          name: string
          primary_metric: string
          secondary_metrics?: string[] | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: string | null
          target_sample_size?: number | null
          test_variants: Json[]
          type: string
          updated_at?: string | null
          winner_variant?: string | null
        }
        Update: {
          completed_at?: string | null
          confidence_level?: number | null
          control_variant?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          minimum_detectable_effect?: number | null
          name?: string
          primary_metric?: string
          secondary_metrics?: string[] | null
          start_date?: string | null
          statistical_significance?: number | null
          status?: string | null
          target_sample_size?: number | null
          test_variants?: Json[]
          type?: string
          updated_at?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_experiments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_results: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string
          experiment_id: string | null
          id: string
          impressions: number | null
          p_value: number | null
          updated_at: string | null
          variant_name: string
          z_score: number | null
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          experiment_id?: string | null
          id?: string
          impressions?: number | null
          p_value?: number | null
          updated_at?: string | null
          variant_name: string
          z_score?: number | null
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          experiment_id?: string | null
          id?: string
          impressions?: number | null
          p_value?: number | null
          updated_at?: string | null
          variant_name?: string
          z_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_results_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_test_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_dashboard_cache: {
        Row: {
          cache_key: string
          cache_type: string
          calculated_at: string
          calculation_time: number | null
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          updated_at: string | null
        }
        Insert: {
          cache_key: string
          cache_type: string
          calculated_at: string
          calculation_time?: number | null
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          cache_key?: string
          cache_type?: string
          calculated_at?: string
          calculation_time?: number | null
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          availability: string
          bureau_id: string | null
          candidate_email: string
          candidate_id: string | null
          candidate_name: string
          candidate_phone: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          internal_notes: string | null
          job_id: string
          motivation: string
          status: Database["public"]["Enums"]["application_status"]
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability: string
          bureau_id?: string | null
          candidate_email: string
          candidate_id?: string | null
          candidate_name: string
          candidate_phone?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          job_id: string
          motivation: string
          status?: Database["public"]["Enums"]["application_status"]
          tenant_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: string
          bureau_id?: string | null
          candidate_email?: string
          candidate_id?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          internal_notes?: string | null
          job_id?: string
          motivation?: string
          status?: Database["public"]["Enums"]["application_status"]
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          application_id: string | null
          created_at: string | null
          filename: string
          filesize: number
          id: string
          job_id: string | null
          message_id: string | null
          mimetype: string
          tenant_id: string
          url: string
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          filename: string
          filesize: number
          id?: string
          job_id?: string | null
          message_id?: string | null
          mimetype: string
          tenant_id?: string
          url: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          filename?: string
          filesize?: number
          id?: string
          job_id?: string | null
          message_id?: string | null
          mimetype?: string
          tenant_id?: string
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "attachments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_candidate_ownership: {
        Row: {
          bureau_id: string
          candidate_id: string
          created_at: string
          fee_protection_notes: string | null
          first_submitted_at: string
          id: string
          is_fee_protected: boolean
          original_job_id: string | null
          ownership_expires_at: string
          updated_at: string
        }
        Insert: {
          bureau_id: string
          candidate_id: string
          created_at?: string
          fee_protection_notes?: string | null
          first_submitted_at?: string
          id?: string
          is_fee_protected?: boolean
          original_job_id?: string | null
          ownership_expires_at?: string
          updated_at?: string
        }
        Update: {
          bureau_id?: string
          candidate_id?: string
          created_at?: string
          fee_protection_notes?: string | null
          first_submitted_at?: string
          id?: string
          is_fee_protected?: boolean
          original_job_id?: string | null
          ownership_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bureau_candidate_ownership_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bureau_candidate_ownership_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bureau_candidate_ownership_original_job_id_fkey"
            columns: ["original_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_fee_structures: {
        Row: {
          applicable_employment_types: string[] | null
          bureau_id: string
          created_at: string
          currency: string
          description: string | null
          fee_calculation_type: Database["public"]["Enums"]["fee_calculation_type"]
          hourly_markup_percentage: number | null
          id: string
          is_active: boolean
          is_default: boolean
          max_salary: number | null
          min_salary: number | null
          monthly_fee: number | null
          name: string
          payment_terms_days: number | null
          placement_fee_fixed: number | null
          placement_fee_percentage: number | null
          replacement_guarantee_days: number | null
          tiered_rates: Json | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_employment_types?: string[] | null
          bureau_id: string
          created_at?: string
          currency?: string
          description?: string | null
          fee_calculation_type?: Database["public"]["Enums"]["fee_calculation_type"]
          hourly_markup_percentage?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_salary?: number | null
          min_salary?: number | null
          monthly_fee?: number | null
          name: string
          payment_terms_days?: number | null
          placement_fee_fixed?: number | null
          placement_fee_percentage?: number | null
          replacement_guarantee_days?: number | null
          tiered_rates?: Json | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_employment_types?: string[] | null
          bureau_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          fee_calculation_type?: Database["public"]["Enums"]["fee_calculation_type"]
          hourly_markup_percentage?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_salary?: number | null
          min_salary?: number | null
          monthly_fee?: number | null
          name?: string
          payment_terms_days?: number | null
          placement_fee_fixed?: number | null
          placement_fee_percentage?: number | null
          replacement_guarantee_days?: number | null
          tiered_rates?: Json | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bureau_fee_structures_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_geographic_coverage: {
        Row: {
          bureau_id: string
          city: string | null
          country: string
          coverage_priority: number
          created_at: string
          id: string
          postal_code: string | null
          province: string | null
          radius_km: number | null
        }
        Insert: {
          bureau_id: string
          city?: string | null
          country?: string
          coverage_priority?: number
          created_at?: string
          id?: string
          postal_code?: string | null
          province?: string | null
          radius_km?: number | null
        }
        Update: {
          bureau_id?: string
          city?: string | null
          country?: string
          coverage_priority?: number
          created_at?: string
          id?: string
          postal_code?: string | null
          province?: string | null
          radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bureau_geographic_coverage_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_performance_metrics: {
        Row: {
          avg_fee_per_placement: number | null
          avg_response_time_hours: number | null
          avg_time_to_fill_days: number | null
          bureau_id: string
          calculated_at: string
          candidate_quality_score: number | null
          created_at: string
          fill_rate: number | null
          id: string
          interview_rate: number | null
          performance_score: number | null
          performance_tier:
            | Database["public"]["Enums"]["performance_tier"]
            | null
          period_end: string
          period_start: string
          period_type: string
          placement_rate: number | null
          quality_sla_breaches: number
          rejection_rate: number | null
          response_time_sla_breaches: number
          sla_violations: number
          submission_rate: number | null
          total_candidates_interviewed: number
          total_candidates_placed: number
          total_candidates_submitted: number
          total_fees_generated: number | null
          total_jobs_accepted: number
          total_jobs_received: number
        }
        Insert: {
          avg_fee_per_placement?: number | null
          avg_response_time_hours?: number | null
          avg_time_to_fill_days?: number | null
          bureau_id: string
          calculated_at?: string
          candidate_quality_score?: number | null
          created_at?: string
          fill_rate?: number | null
          id?: string
          interview_rate?: number | null
          performance_score?: number | null
          performance_tier?:
            | Database["public"]["Enums"]["performance_tier"]
            | null
          period_end: string
          period_start: string
          period_type?: string
          placement_rate?: number | null
          quality_sla_breaches?: number
          rejection_rate?: number | null
          response_time_sla_breaches?: number
          sla_violations?: number
          submission_rate?: number | null
          total_candidates_interviewed?: number
          total_candidates_placed?: number
          total_candidates_submitted?: number
          total_fees_generated?: number | null
          total_jobs_accepted?: number
          total_jobs_received?: number
        }
        Update: {
          avg_fee_per_placement?: number | null
          avg_response_time_hours?: number | null
          avg_time_to_fill_days?: number | null
          bureau_id?: string
          calculated_at?: string
          candidate_quality_score?: number | null
          created_at?: string
          fill_rate?: number | null
          id?: string
          interview_rate?: number | null
          performance_score?: number | null
          performance_tier?:
            | Database["public"]["Enums"]["performance_tier"]
            | null
          period_end?: string
          period_start?: string
          period_type?: string
          placement_rate?: number | null
          quality_sla_breaches?: number
          rejection_rate?: number | null
          response_time_sla_breaches?: number
          sla_violations?: number
          submission_rate?: number | null
          total_candidates_interviewed?: number
          total_candidates_placed?: number
          total_candidates_submitted?: number
          total_fees_generated?: number | null
          total_jobs_accepted?: number
          total_jobs_received?: number
        }
        Relationships: [
          {
            foreignKeyName: "bureau_performance_metrics_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_response_times: {
        Row: {
          accepted_candidates: number
          bureau_id: string
          completed_at: string | null
          completion_time_hours: number | null
          created_at: string
          distributed_at: string
          distribution_id: string
          first_response_at: string | null
          first_submission_at: string | null
          id: string
          job_id: string
          response_time_hours: number | null
          submitted_candidates: number
          target_candidates: number
          updated_at: string
        }
        Insert: {
          accepted_candidates?: number
          bureau_id: string
          completed_at?: string | null
          completion_time_hours?: number | null
          created_at?: string
          distributed_at: string
          distribution_id: string
          first_response_at?: string | null
          first_submission_at?: string | null
          id?: string
          job_id: string
          response_time_hours?: number | null
          submitted_candidates?: number
          target_candidates: number
          updated_at?: string
        }
        Update: {
          accepted_candidates?: number
          bureau_id?: string
          completed_at?: string | null
          completion_time_hours?: number | null
          created_at?: string
          distributed_at?: string
          distribution_id?: string
          first_response_at?: string | null
          first_submission_at?: string | null
          id?: string
          job_id?: string
          response_time_hours?: number | null
          submitted_candidates?: number
          target_candidates?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bureau_response_times_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bureau_response_times_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: true
            referencedRelation: "distributed_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bureau_response_times_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_specializations: {
        Row: {
          bureau_id: string
          category: Database["public"]["Enums"]["bureau_specialization_category"]
          created_at: string
          id: string
          match_priority: number
          seniority_levels:
            | Database["public"]["Enums"]["seniority_level"][]
            | null
          subcategory: string | null
          successful_placements: number | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          bureau_id: string
          category: Database["public"]["Enums"]["bureau_specialization_category"]
          created_at?: string
          id?: string
          match_priority?: number
          seniority_levels?:
            | Database["public"]["Enums"]["seniority_level"][]
            | null
          subcategory?: string | null
          successful_placements?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          bureau_id?: string
          category?: Database["public"]["Enums"]["bureau_specialization_category"]
          created_at?: string
          id?: string
          match_priority?: number
          seniority_levels?:
            | Database["public"]["Enums"]["seniority_level"][]
            | null
          subcategory?: string | null
          successful_placements?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bureau_specializations_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          available_from: string | null
          created_at: string
          current_job_title: string | null
          cv_url: string | null
          email: string
          experience_years: number | null
          first_name: string | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          notice_period_days: number | null
          phone: string | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          created_at?: string
          current_job_title?: string | null
          cv_url?: string | null
          email: string
          experience_years?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          notice_period_days?: number | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          created_at?: string
          current_job_title?: string | null
          cv_url?: string | null
          email?: string
          experience_years?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          notice_period_days?: number | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      contract_amendments: {
        Row: {
          amendment_number: string
          amendment_pdf_url: string | null
          amendment_type: string
          approved_at: string | null
          approved_by: string | null
          changes_json: Json
          contract_id: string
          created_at: string | null
          created_by: string
          description: string
          effective_date: string
          id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amendment_number: string
          amendment_pdf_url?: string | null
          amendment_type: string
          approved_at?: string | null
          approved_by?: string | null
          changes_json: Json
          contract_id: string
          created_at?: string | null
          created_by: string
          description: string
          effective_date: string
          id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amendment_number?: string
          amendment_pdf_url?: string | null
          amendment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          changes_json?: Json
          contract_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          effective_date?: string
          id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_amendments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_amendments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_approvals: {
        Row: {
          approval_status: string
          approved_at: string | null
          approver_id: string
          approver_role: string
          can_delegate: boolean | null
          comments: string | null
          contract_id: string
          created_at: string | null
          delegated_to: string | null
          due_by: string | null
          id: string
          is_required: boolean | null
          rejection_reason: string | null
          sequence_order: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approver_id: string
          approver_role: string
          can_delegate?: boolean | null
          comments?: string | null
          contract_id: string
          created_at?: string | null
          delegated_to?: string | null
          due_by?: string | null
          id?: string
          is_required?: boolean | null
          rejection_reason?: string | null
          sequence_order: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approver_id?: string
          approver_role?: string
          can_delegate?: boolean | null
          comments?: string | null
          contract_id?: string
          created_at?: string | null
          delegated_to?: string | null
          due_by?: string | null
          id?: string
          is_required?: boolean | null
          rejection_reason?: string | null
          sequence_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_approvals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_approvals_delegated_to_fkey"
            columns: ["delegated_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_audit_log: {
        Row: {
          action: string
          changes_json: Json | null
          contract_id: string
          created_at: string | null
          field_name: string | null
          id: string
          ip_address: unknown
          new_value: string | null
          old_value: string | null
          performed_by: string
          performed_by_name: string
          performed_by_role: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changes_json?: Json | null
          contract_id: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          ip_address?: unknown
          new_value?: string | null
          old_value?: string | null
          performed_by: string
          performed_by_name: string
          performed_by_role?: string | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changes_json?: Json | null
          contract_id?: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          ip_address?: unknown
          new_value?: string | null
          old_value?: string | null
          performed_by?: string
          performed_by_name?: string
          performed_by_role?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_audit_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_history: {
        Row: {
          contract_title: string
          contract_type: string
          created_at: string | null
          created_by: string
          form_data: Json
          id: string
          pdf_url: string | null
          search_text: string | null
        }
        Insert: {
          contract_title: string
          contract_type: string
          created_at?: string | null
          created_by: string
          form_data: Json
          id?: string
          pdf_url?: string | null
          search_text?: string | null
        }
        Update: {
          contract_title?: string
          contract_type?: string
          created_at?: string | null
          created_by?: string
          form_data?: Json
          id?: string
          pdf_url?: string | null
          search_text?: string | null
        }
        Relationships: []
      }
      contract_signatures: {
        Row: {
          contract_id: string
          created_at: string | null
          docusign_envelope_id: string | null
          docusign_recipient_id: string | null
          id: string
          ip_address: unknown
          reminder_count: number | null
          reminder_sent_at: string | null
          signature_data: string | null
          signature_type: Database["public"]["Enums"]["signature_type"]
          signed_at: string | null
          signer_email: string
          signer_id: string
          signer_name: string
          signer_type: string
          user_agent: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          docusign_envelope_id?: string | null
          docusign_recipient_id?: string | null
          id?: string
          ip_address?: unknown
          reminder_count?: number | null
          reminder_sent_at?: string | null
          signature_data?: string | null
          signature_type: Database["public"]["Enums"]["signature_type"]
          signed_at?: string | null
          signer_email: string
          signer_id: string
          signer_name: string
          signer_type: string
          user_agent?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          docusign_envelope_id?: string | null
          docusign_recipient_id?: string | null
          id?: string
          ip_address?: unknown
          reminder_count?: number | null
          reminder_sent_at?: string | null
          signature_data?: string | null
          signature_type?: Database["public"]["Enums"]["signature_type"]
          signed_at?: string | null
          signer_email?: string
          signer_id?: string
          signer_name?: string
          signer_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          approval_roles: string[] | null
          contract_type: Database["public"]["Enums"]["employment_type"]
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          parent_template_id: string | null
          requires_approval: boolean | null
          template_content: string
          tenant_id: string
          updated_at: string | null
          variables: Json
          version: number | null
        }
        Insert: {
          approval_roles?: string[] | null
          contract_type: Database["public"]["Enums"]["employment_type"]
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          parent_template_id?: string | null
          requires_approval?: boolean | null
          template_content: string
          tenant_id: string
          updated_at?: string | null
          variables?: Json
          version?: number | null
        }
        Update: {
          approval_roles?: string[] | null
          contract_type?: Database["public"]["Enums"]["employment_type"]
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          parent_template_id?: string | null
          requires_approval?: boolean | null
          template_content?: string
          tenant_id?: string
          updated_at?: string | null
          variables?: Json
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          application_id: string
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          benefits: Json | null
          bureau_fee_amount: number | null
          bureau_fee_percentage: number | null
          bureau_id: string | null
          candidate_id: string
          company_id: string
          contract_number: string
          contract_type: Database["public"]["Enums"]["employment_type"]
          created_at: string | null
          created_by: string
          currency: string | null
          department: string | null
          end_date: string | null
          fee_calculation_details: Json | null
          fully_signed_at: string | null
          generated_pdf_url: string | null
          hourly_rate: number | null
          hours_per_week: number | null
          id: string
          job_id: string
          job_title: string
          monthly_salary: number | null
          msa_id: string | null
          notice_period_days: number | null
          overtime_rate: number | null
          probation_period_months: number | null
          rate_card_id: string | null
          remote_percentage: number | null
          signatures_received: number | null
          signatures_required: number | null
          signed_pdf_url: string | null
          special_clauses: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"] | null
          template_id: string | null
          tenant_id: string
          terminated_at: string | null
          terminated_by: string | null
          termination_reason: string | null
          updated_at: string | null
          vacation_allowance: number | null
          vacation_days: number | null
          work_location: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          application_id: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: Json | null
          bureau_fee_amount?: number | null
          bureau_fee_percentage?: number | null
          bureau_id?: string | null
          candidate_id: string
          company_id: string
          contract_number: string
          contract_type: Database["public"]["Enums"]["employment_type"]
          created_at?: string | null
          created_by: string
          currency?: string | null
          department?: string | null
          end_date?: string | null
          fee_calculation_details?: Json | null
          fully_signed_at?: string | null
          generated_pdf_url?: string | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          job_id: string
          job_title: string
          monthly_salary?: number | null
          msa_id?: string | null
          notice_period_days?: number | null
          overtime_rate?: number | null
          probation_period_months?: number | null
          rate_card_id?: string | null
          remote_percentage?: number | null
          signatures_received?: number | null
          signatures_required?: number | null
          signed_pdf_url?: string | null
          special_clauses?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          template_id?: string | null
          tenant_id: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          updated_at?: string | null
          vacation_allowance?: number | null
          vacation_days?: number | null
          work_location?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          application_id?: string
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: Json | null
          bureau_fee_amount?: number | null
          bureau_fee_percentage?: number | null
          bureau_id?: string | null
          candidate_id?: string
          company_id?: string
          contract_number?: string
          contract_type?: Database["public"]["Enums"]["employment_type"]
          created_at?: string | null
          created_by?: string
          currency?: string | null
          department?: string | null
          end_date?: string | null
          fee_calculation_details?: Json | null
          fully_signed_at?: string | null
          generated_pdf_url?: string | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          job_id?: string
          job_title?: string
          monthly_salary?: number | null
          msa_id?: string | null
          notice_period_days?: number | null
          overtime_rate?: number | null
          probation_period_months?: number | null
          rate_card_id?: string | null
          remote_percentage?: number | null
          signatures_received?: number | null
          signatures_required?: number | null
          signed_pdf_url?: string | null
          special_clauses?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"] | null
          template_id?: string | null
          tenant_id?: string
          terminated_at?: string | null
          terminated_by?: string | null
          termination_reason?: string | null
          updated_at?: string | null
          vacation_allowance?: number | null
          vacation_days?: number | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_msa_id_fkey"
            columns: ["msa_id"]
            isOneToOne: false
            referencedRelation: "master_service_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_terminated_by_fkey"
            columns: ["terminated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      distributed_jobs: {
        Row: {
          access_expires_at: string | null
          bureau_id: string
          candidates_submitted: number
          closed_at: string | null
          closure_reason: string | null
          created_at: string
          distributed_at: string
          distribution_method: string | null
          distribution_tier: Database["public"]["Enums"]["distribution_tier"]
          exclusive_until: string | null
          id: string
          invitation_accepted: boolean | null
          invitation_accepted_at: string | null
          invitation_sent: boolean
          invitation_sent_at: string | null
          is_exclusive: boolean
          job_id: string
          max_candidates_allowed: number | null
          paused_at: string | null
          status: Database["public"]["Enums"]["distribution_status"]
          updated_at: string
        }
        Insert: {
          access_expires_at?: string | null
          bureau_id: string
          candidates_submitted?: number
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          distributed_at?: string
          distribution_method?: string | null
          distribution_tier?: Database["public"]["Enums"]["distribution_tier"]
          exclusive_until?: string | null
          id?: string
          invitation_accepted?: boolean | null
          invitation_accepted_at?: string | null
          invitation_sent?: boolean
          invitation_sent_at?: string | null
          is_exclusive?: boolean
          job_id: string
          max_candidates_allowed?: number | null
          paused_at?: string | null
          status?: Database["public"]["Enums"]["distribution_status"]
          updated_at?: string
        }
        Update: {
          access_expires_at?: string | null
          bureau_id?: string
          candidates_submitted?: number
          closed_at?: string | null
          closure_reason?: string | null
          created_at?: string
          distributed_at?: string
          distribution_method?: string | null
          distribution_tier?: Database["public"]["Enums"]["distribution_tier"]
          exclusive_until?: string | null
          id?: string
          invitation_accepted?: boolean | null
          invitation_accepted_at?: string | null
          invitation_sent?: boolean
          invitation_sent_at?: string | null
          is_exclusive?: boolean
          job_id?: string
          max_candidates_allowed?: number | null
          paused_at?: string | null
          status?: Database["public"]["Enums"]["distribution_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributed_jobs_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributed_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics: {
        Row: {
          created_at: string | null
          email_id: string
          event_timestamp: string | null
          event_type: string
          id: string
          ip_address: unknown
          job_id: string | null
          link_url: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_id: string
          event_timestamp?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          job_id?: string | null
          link_url?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_id?: string
          event_timestamp?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          job_id?: string | null
          link_url?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_confirmations: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          bucket_name: string
          context_type: string
          created_at: string
          file_name: string
          id: string
          metadata: Json | null
          mimetype: string
          original_name: string
          related_id: string | null
          size: number
          storage_path: string
          tenant_id: string
          updated_at: string
          uploaded_by: string
          virus_scan_result: string | null
          virus_scanned: boolean
        }
        Insert: {
          bucket_name?: string
          context_type: string
          created_at?: string
          file_name: string
          id?: string
          metadata?: Json | null
          mimetype: string
          original_name: string
          related_id?: string | null
          size: number
          storage_path: string
          tenant_id: string
          updated_at?: string
          uploaded_by: string
          virus_scan_result?: string | null
          virus_scanned?: boolean
        }
        Update: {
          bucket_name?: string
          context_type?: string
          created_at?: string
          file_name?: string
          id?: string
          metadata?: Json | null
          mimetype?: string
          original_name?: string
          related_id?: string | null
          size?: number
          storage_path?: string
          tenant_id?: string
          updated_at?: string
          uploaded_by?: string
          virus_scan_result?: string | null
          virus_scanned?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_distribution_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean
          id: string
          interim_jobs_enabled: boolean
          tenant_id: string
          updated_at: string | null
          user_id: string
          vast_jobs_enabled: boolean
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          interim_jobs_enabled?: boolean
          tenant_id?: string
          updated_at?: string | null
          user_id: string
          vast_jobs_enabled?: boolean
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean
          id?: string
          interim_jobs_enabled?: boolean
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
          vast_jobs_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "job_distribution_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_distribution_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "job_distribution_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_performance_metrics: {
        Row: {
          application_rate: number | null
          avg_time_on_page: number | null
          avg_time_to_apply: unknown
          bounce_rate: number | null
          click_rate: number | null
          click_to_open_rate: number | null
          created_at: string | null
          date: string
          emails_clicked: number | null
          emails_delivered: number | null
          emails_opened: number | null
          id: string
          job_id: string | null
          open_rate: number | null
          qualified_applications: number | null
          total_applications: number | null
          total_emails_sent: number | null
          unique_applicants: number | null
          unique_clicks: number | null
          unique_opens: number | null
          unique_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          application_rate?: number | null
          avg_time_on_page?: number | null
          avg_time_to_apply?: unknown
          bounce_rate?: number | null
          click_rate?: number | null
          click_to_open_rate?: number | null
          created_at?: string | null
          date: string
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          id?: string
          job_id?: string | null
          open_rate?: number | null
          qualified_applications?: number | null
          total_applications?: number | null
          total_emails_sent?: number | null
          unique_applicants?: number | null
          unique_clicks?: number | null
          unique_opens?: number | null
          unique_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          application_rate?: number | null
          avg_time_on_page?: number | null
          avg_time_to_apply?: unknown
          bounce_rate?: number | null
          click_rate?: number | null
          click_to_open_rate?: number | null
          created_at?: string | null
          date?: string
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          id?: string
          job_id?: string | null
          open_rate?: number | null
          qualified_applications?: number | null
          total_applications?: number | null
          total_emails_sent?: number | null
          unique_applicants?: number | null
          unique_clicks?: number | null
          unique_opens?: number | null
          unique_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_performance_metrics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date: string | null
          hourly_rate: number | null
          id: string
          location: string
          requires_distribution: boolean | null
          salary: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_status"]
          tenant_id: string
          title: string
          updated_at: string | null
          user_id: string
          visibility_mode: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          location: string
          requires_distribution?: boolean | null
          salary?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tenant_id?: string
          title: string
          updated_at?: string | null
          user_id: string
          visibility_mode?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          end_date?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string
          requires_distribution?: boolean | null
          salary?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          tenant_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string
          successful: boolean
          tenant_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address: string
          successful: boolean
          tenant_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string
          successful?: boolean
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      master_service_agreements: {
        Row: {
          auto_renew: boolean | null
          bureau_id: string
          bureau_signed_at: string | null
          bureau_signed_by: string | null
          company_id: string
          company_signed_at: string | null
          company_signed_by: string | null
          created_at: string | null
          created_by: string
          effective_date: string
          expiration_date: string
          id: string
          liability_cap: number | null
          msa_document_url: string | null
          msa_number: string
          name: string
          notice_period_days: number | null
          payment_terms_days: number | null
          renewal_period_months: number | null
          signed_document_url: string | null
          status: Database["public"]["Enums"]["msa_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          bureau_id: string
          bureau_signed_at?: string | null
          bureau_signed_by?: string | null
          company_id: string
          company_signed_at?: string | null
          company_signed_by?: string | null
          created_at?: string | null
          created_by: string
          effective_date: string
          expiration_date: string
          id?: string
          liability_cap?: number | null
          msa_document_url?: string | null
          msa_number: string
          name: string
          notice_period_days?: number | null
          payment_terms_days?: number | null
          renewal_period_months?: number | null
          signed_document_url?: string | null
          status?: Database["public"]["Enums"]["msa_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          bureau_id?: string
          bureau_signed_at?: string | null
          bureau_signed_by?: string | null
          company_id?: string
          company_signed_at?: string | null
          company_signed_by?: string | null
          created_at?: string | null
          created_by?: string
          effective_date?: string
          expiration_date?: string
          id?: string
          liability_cap?: number | null
          msa_document_url?: string | null
          msa_number?: string
          name?: string
          notice_period_days?: number | null
          payment_terms_days?: number | null
          renewal_period_months?: number | null
          signed_document_url?: string | null
          status?: Database["public"]["Enums"]["msa_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_service_agreements_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_service_agreements_bureau_signed_by_fkey"
            columns: ["bureau_signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_service_agreements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_service_agreements_company_signed_by_fkey"
            columns: ["company_signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_service_agreements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_scores: {
        Row: {
          applied: boolean | null
          availability_match: number | null
          calculated_at: string | null
          email_opened: boolean | null
          email_sent: boolean | null
          experience_match: number | null
          id: string
          job_id: string | null
          job_viewed: boolean | null
          location_match: number | null
          matching_skills: string[] | null
          missing_skills: string[] | null
          overall_score: number
          recommendation_rank: number | null
          salary_match: number | null
          skills_match: number | null
          user_id: string | null
        }
        Insert: {
          applied?: boolean | null
          availability_match?: number | null
          calculated_at?: string | null
          email_opened?: boolean | null
          email_sent?: boolean | null
          experience_match?: number | null
          id?: string
          job_id?: string | null
          job_viewed?: boolean | null
          location_match?: number | null
          matching_skills?: string[] | null
          missing_skills?: string[] | null
          overall_score: number
          recommendation_rank?: number | null
          salary_match?: number | null
          skills_match?: number | null
          user_id?: string | null
        }
        Update: {
          applied?: boolean | null
          availability_match?: number | null
          calculated_at?: string | null
          email_opened?: boolean | null
          email_sent?: boolean | null
          experience_match?: number | null
          id?: string
          job_id?: string | null
          job_viewed?: boolean | null
          location_match?: number | null
          matching_skills?: string[] | null
          missing_skills?: string[] | null
          overall_score?: number
          recommendation_rank?: number | null
          salary_match?: number | null
          skills_match?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matching_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          applicant_user_id: string
          application_id: string
          archived_at: string | null
          archived_by: string | null
          company_user_id: string
          created_at: string | null
          id: string
          job_id: string
          last_message_at: string | null
          status: Database["public"]["Enums"]["thread_status"]
          tenant_id: string
          unread_by_applicant: number
          unread_by_company: number
          updated_at: string | null
        }
        Insert: {
          applicant_user_id: string
          application_id: string
          archived_at?: string | null
          archived_by?: string | null
          company_user_id: string
          created_at?: string | null
          id?: string
          job_id: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          tenant_id?: string
          unread_by_applicant?: number
          unread_by_company?: number
          updated_at?: string | null
        }
        Update: {
          applicant_user_id?: string
          application_id?: string
          archived_at?: string | null
          archived_by?: string | null
          company_user_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          tenant_id?: string
          unread_by_applicant?: number
          unread_by_company?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_company_user_id_fkey"
            columns: ["company_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          email_notification_sent: boolean
          id: string
          is_read: boolean
          sender_id: string
          tenant_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          email_notification_sent?: boolean
          id?: string
          is_read?: boolean
          sender_id: string
          tenant_id?: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          email_notification_sent?: boolean
          id?: string
          is_read?: boolean
          sender_id?: string
          tenant_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: number
          operation: string
          records_affected: number | null
          started_at: string | null
          status: string
          table_name: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          operation: string
          records_affected?: number | null
          started_at?: string | null
          status: string
          table_name: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: number
          operation?: string
          records_affected?: number | null
          started_at?: string | null
          status?: string
          table_name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean
          id: string
          job_status_email: boolean
          new_application_email: boolean
          new_message_email: boolean
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          job_status_email?: boolean
          new_application_email?: boolean
          new_message_email?: boolean
          tenant_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean
          id?: string
          job_status_email?: boolean
          new_application_email?: boolean
          new_message_email?: boolean
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          tenant_id?: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description: string
          id?: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          tenant_id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_fees: {
        Row: {
          application_id: string
          bureau_fee_amount: number
          bureau_fee_percentage: number | null
          bureau_id: string
          bureau_markup: number | null
          candidate_annual_salary: number | null
          candidate_hourly_rate: number | null
          candidate_monthly_salary: number | null
          created_at: string
          currency: string
          fee_calculation_details: Json | null
          fee_structure_id: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          job_id: string
          payment_due_date: string | null
          payment_received_date: string | null
          payment_status: string | null
          total_cost_to_company: number
          updated_at: string
        }
        Insert: {
          application_id: string
          bureau_fee_amount: number
          bureau_fee_percentage?: number | null
          bureau_id: string
          bureau_markup?: number | null
          candidate_annual_salary?: number | null
          candidate_hourly_rate?: number | null
          candidate_monthly_salary?: number | null
          created_at?: string
          currency?: string
          fee_calculation_details?: Json | null
          fee_structure_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_id: string
          payment_due_date?: string | null
          payment_received_date?: string | null
          payment_status?: string | null
          total_cost_to_company: number
          updated_at?: string
        }
        Update: {
          application_id?: string
          bureau_fee_amount?: number
          bureau_fee_percentage?: number | null
          bureau_id?: string
          bureau_markup?: number | null
          candidate_annual_salary?: number | null
          candidate_hourly_rate?: number | null
          candidate_monthly_salary?: number | null
          created_at?: string
          currency?: string
          fee_calculation_details?: Json | null
          fee_structure_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_id?: string
          payment_due_date?: string | null
          payment_received_date?: string | null
          payment_status?: string | null
          total_cost_to_company?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_fees_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_fees_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "bureau_fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_fees_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_card_lines: {
        Row: {
          created_at: string | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          fixed_fee_amount: number | null
          hourly_markup_amount: number | null
          hourly_markup_percentage: number | null
          id: string
          job_category: string
          max_hourly_rate: number | null
          max_monthly_salary: number | null
          min_hourly_rate: number | null
          min_monthly_salary: number | null
          placement_fee_percentage: number | null
          rate_card_id: string
          seniority_level: string
          updated_at: string | null
          volume_discount_percentage: number | null
          volume_discount_threshold: number | null
        }
        Insert: {
          created_at?: string | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          fixed_fee_amount?: number | null
          hourly_markup_amount?: number | null
          hourly_markup_percentage?: number | null
          id?: string
          job_category: string
          max_hourly_rate?: number | null
          max_monthly_salary?: number | null
          min_hourly_rate?: number | null
          min_monthly_salary?: number | null
          placement_fee_percentage?: number | null
          rate_card_id: string
          seniority_level: string
          updated_at?: string | null
          volume_discount_percentage?: number | null
          volume_discount_threshold?: number | null
        }
        Update: {
          created_at?: string | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          fixed_fee_amount?: number | null
          hourly_markup_amount?: number | null
          hourly_markup_percentage?: number | null
          id?: string
          job_category?: string
          max_hourly_rate?: number | null
          max_monthly_salary?: number | null
          min_hourly_rate?: number | null
          min_monthly_salary?: number | null
          placement_fee_percentage?: number | null
          rate_card_id?: string
          seniority_level?: string
          updated_at?: string | null
          volume_discount_percentage?: number | null
          volume_discount_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_lines_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          bureau_id: string
          bureau_locked: boolean | null
          company_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          msa_id: string | null
          name: string
          tenant_id: string
          updated_at: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          bureau_id: string
          bureau_locked?: boolean | null
          company_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          msa_id?: string | null
          name: string
          tenant_id: string
          updated_at?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          bureau_id?: string
          bureau_locked?: boolean | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          msa_id?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_msa_id_fkey"
            columns: ["msa_id"]
            isOneToOne: false
            referencedRelation: "master_service_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_analytics: {
        Row: {
          annual_recurring_revenue: number | null
          average_revenue_per_user: number | null
          cancelled_subscriptions: number | null
          churn_rate: number | null
          created_at: string | null
          date: string
          downgraded_subscriptions: number | null
          id: string
          lifetime_value: number | null
          monthly_recurring_revenue: number | null
          mrr_growth_rate: number | null
          net_revenue_retention: number | null
          new_subscriptions: number | null
          revenue_by_plan: Json | null
          subscriptions_by_plan: Json | null
          total_active_subscriptions: number | null
          updated_at: string | null
          upgraded_subscriptions: number | null
        }
        Insert: {
          annual_recurring_revenue?: number | null
          average_revenue_per_user?: number | null
          cancelled_subscriptions?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date: string
          downgraded_subscriptions?: number | null
          id?: string
          lifetime_value?: number | null
          monthly_recurring_revenue?: number | null
          mrr_growth_rate?: number | null
          net_revenue_retention?: number | null
          new_subscriptions?: number | null
          revenue_by_plan?: Json | null
          subscriptions_by_plan?: Json | null
          total_active_subscriptions?: number | null
          updated_at?: string | null
          upgraded_subscriptions?: number | null
        }
        Update: {
          annual_recurring_revenue?: number | null
          average_revenue_per_user?: number | null
          cancelled_subscriptions?: number | null
          churn_rate?: number | null
          created_at?: string | null
          date?: string
          downgraded_subscriptions?: number | null
          id?: string
          lifetime_value?: number | null
          monthly_recurring_revenue?: number | null
          mrr_growth_rate?: number | null
          net_revenue_retention?: number | null
          new_subscriptions?: number | null
          revenue_by_plan?: Json | null
          subscriptions_by_plan?: Json | null
          total_active_subscriptions?: number | null
          updated_at?: string | null
          upgraded_subscriptions?: number | null
        }
        Relationships: []
      }
      samenwerkingsovereenkomsten: {
        Row: {
          adres: string
          bedrijfsnaam: string
          berekend_tarief: number | null
          betalingsvoorwaarden_ws: string | null
          contactpersoon: string
          created_at: string | null
          created_by: string
          datum_brief: string
          facturering_splitsen: boolean | null
          functie_contactpersoon: string | null
          functie_handtekening: string | null
          functie_ondertekenaar: string | null
          garantie_proeftijd: boolean | null
          geldigheid_dagen: number | null
          geldigheid_jaren: number | null
          id: string
          include_uitzenden: boolean | null
          include_werving_selectie: boolean | null
          omrekenfactor: number | null
          ondertekenaar_opdrachtgever: string | null
          opzegtermijn_maanden: number | null
          overnamefee_tekst: string | null
          pdf_generated_at: string | null
          pdf_url: string | null
          plaats: string
          postcode: string
          primadeta_ondertekenaar: string | null
          primadeta_plaats: string | null
          status: string | null
          titel_ondertekenaar_opdrachtgever: string | null
          updated_at: string | null
          uren_overname: number | null
          voorbeeld_uurloon: number | null
          ws_percentage: number | null
        }
        Insert: {
          adres: string
          bedrijfsnaam: string
          berekend_tarief?: number | null
          betalingsvoorwaarden_ws?: string | null
          contactpersoon: string
          created_at?: string | null
          created_by: string
          datum_brief?: string
          facturering_splitsen?: boolean | null
          functie_contactpersoon?: string | null
          functie_handtekening?: string | null
          functie_ondertekenaar?: string | null
          garantie_proeftijd?: boolean | null
          geldigheid_dagen?: number | null
          geldigheid_jaren?: number | null
          id?: string
          include_uitzenden?: boolean | null
          include_werving_selectie?: boolean | null
          omrekenfactor?: number | null
          ondertekenaar_opdrachtgever?: string | null
          opzegtermijn_maanden?: number | null
          overnamefee_tekst?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          plaats: string
          postcode: string
          primadeta_ondertekenaar?: string | null
          primadeta_plaats?: string | null
          status?: string | null
          titel_ondertekenaar_opdrachtgever?: string | null
          updated_at?: string | null
          uren_overname?: number | null
          voorbeeld_uurloon?: number | null
          ws_percentage?: number | null
        }
        Update: {
          adres?: string
          bedrijfsnaam?: string
          berekend_tarief?: number | null
          betalingsvoorwaarden_ws?: string | null
          contactpersoon?: string
          created_at?: string | null
          created_by?: string
          datum_brief?: string
          facturering_splitsen?: boolean | null
          functie_contactpersoon?: string | null
          functie_handtekening?: string | null
          functie_ondertekenaar?: string | null
          garantie_proeftijd?: boolean | null
          geldigheid_dagen?: number | null
          geldigheid_jaren?: number | null
          id?: string
          include_uitzenden?: boolean | null
          include_werving_selectie?: boolean | null
          omrekenfactor?: number | null
          ondertekenaar_opdrachtgever?: string | null
          opzegtermijn_maanden?: number | null
          overnamefee_tekst?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          plaats?: string
          postcode?: string
          primadeta_ondertekenaar?: string | null
          primadeta_plaats?: string | null
          status?: string | null
          titel_ondertekenaar_opdrachtgever?: string | null
          updated_at?: string | null
          uren_overname?: number | null
          voorbeeld_uurloon?: number | null
          ws_percentage?: number | null
        }
        Relationships: []
      }
      session_audit_log: {
        Row: {
          created_at: string | null
          device_info: Json | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          session_id: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          session_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_audit_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          last_active_at: string | null
          tenant_id: string | null
          tenant_role: string | null
          token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          tenant_id?: string | null
          tenant_role?: string | null
          token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          tenant_id?: string | null
          tenant_role?: string | null
          token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          breach_id: string | null
          bureau_id: string
          created_at: string
          delivered_at: string | null
          delivery_method: Database["public"]["Enums"]["alert_delivery_method"]
          failed_at: string | null
          failure_reason: string | null
          id: string
          message: string
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          opened_at: string | null
          recipient: string
          sent_at: string | null
          severity: Database["public"]["Enums"]["sla_severity"]
          subject: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          breach_id?: string | null
          bureau_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_method: Database["public"]["Enums"]["alert_delivery_method"]
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message: string
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          opened_at?: string | null
          recipient: string
          sent_at?: string | null
          severity: Database["public"]["Enums"]["sla_severity"]
          subject: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          breach_id?: string | null
          bureau_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_method?: Database["public"]["Enums"]["alert_delivery_method"]
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          message?: string
          metric_type?: Database["public"]["Enums"]["sla_metric_type"]
          opened_at?: string | null
          recipient?: string
          sent_at?: string | null
          severity?: Database["public"]["Enums"]["sla_severity"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_alerts_breach_id_fkey"
            columns: ["breach_id"]
            isOneToOne: false
            referencedRelation: "sla_breaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_alerts_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_breaches: {
        Row: {
          actual_value: number
          breach_time: string
          bureau_id: string
          created_at: string
          distribution_id: string | null
          duration_minutes: number | null
          id: string
          impact_score: number | null
          job_id: string | null
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["sla_severity"]
          target_value: number
          threshold_breached: number
          updated_at: string
        }
        Insert: {
          actual_value: number
          breach_time?: string
          bureau_id: string
          created_at?: string
          distribution_id?: string | null
          duration_minutes?: number | null
          id?: string
          impact_score?: number | null
          job_id?: string | null
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["sla_severity"]
          target_value: number
          threshold_breached: number
          updated_at?: string
        }
        Update: {
          actual_value?: number
          breach_time?: string
          bureau_id?: string
          created_at?: string
          distribution_id?: string | null
          duration_minutes?: number | null
          id?: string
          impact_score?: number | null
          job_id?: string | null
          metric_type?: Database["public"]["Enums"]["sla_metric_type"]
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["sla_severity"]
          target_value?: number
          threshold_breached?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_breaches_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_breaches_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributed_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_breaches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configurations: {
        Row: {
          alert_recipients: Json | null
          bureau_id: string
          check_interval_minutes: number
          created_at: string
          created_by: string | null
          critical_threshold: number
          id: string
          is_enabled: boolean
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          send_critical_alerts: boolean
          send_warning_alerts: boolean
          target_value: number
          unit: string
          updated_at: string
          warning_threshold: number
        }
        Insert: {
          alert_recipients?: Json | null
          bureau_id: string
          check_interval_minutes?: number
          created_at?: string
          created_by?: string | null
          critical_threshold: number
          id?: string
          is_enabled?: boolean
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          send_critical_alerts?: boolean
          send_warning_alerts?: boolean
          target_value: number
          unit: string
          updated_at?: string
          warning_threshold: number
        }
        Update: {
          alert_recipients?: Json | null
          bureau_id?: string
          check_interval_minutes?: number
          created_at?: string
          created_by?: string | null
          critical_threshold?: number
          id?: string
          is_enabled?: boolean
          metric_type?: Database["public"]["Enums"]["sla_metric_type"]
          send_critical_alerts?: boolean
          send_warning_alerts?: boolean
          target_value?: number
          unit?: string
          updated_at?: string
          warning_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "sla_configurations_bureau_id_fkey"
            columns: ["bureau_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_performance_metrics: {
        Row: {
          api_calls: number | null
          api_errors: number | null
          avg_processing_time: number | null
          avg_query_time: number | null
          avg_response_time: number | null
          cpu_usage: number | null
          created_at: string | null
          db_connections: number | null
          disk_usage: number | null
          error_count: number | null
          error_types: Json | null
          failed_jobs: number | null
          id: string
          jobs_processed: number | null
          memory_usage: number | null
          p95_response_time: number | null
          p99_response_time: number | null
          queue_size: number | null
          slow_queries: number | null
          timestamp: string
        }
        Insert: {
          api_calls?: number | null
          api_errors?: number | null
          avg_processing_time?: number | null
          avg_query_time?: number | null
          avg_response_time?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          db_connections?: number | null
          disk_usage?: number | null
          error_count?: number | null
          error_types?: Json | null
          failed_jobs?: number | null
          id?: string
          jobs_processed?: number | null
          memory_usage?: number | null
          p95_response_time?: number | null
          p99_response_time?: number | null
          queue_size?: number | null
          slow_queries?: number | null
          timestamp?: string
        }
        Update: {
          api_calls?: number | null
          api_errors?: number | null
          avg_processing_time?: number | null
          avg_query_time?: number | null
          avg_response_time?: number | null
          cpu_usage?: number | null
          created_at?: string | null
          db_connections?: number | null
          disk_usage?: number | null
          error_count?: number | null
          error_types?: Json | null
          failed_jobs?: number | null
          id?: string
          jobs_processed?: number | null
          memory_usage?: number | null
          p95_response_time?: number | null
          p99_response_time?: number | null
          queue_size?: number | null
          slow_queries?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          message: string | null
          responded_by: string | null
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          invited_by: string
          message?: string | null
          responded_by?: string | null
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          message?: string | null
          responded_by?: string | null
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_memberships: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["membership_role"]
          settings: Json | null
          status: Database["public"]["Enums"]["membership_status"]
          suspended_at: string | null
          suspended_reason: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["membership_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["membership_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["membership_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["membership_status"]
          suspended_at?: string | null
          suspended_reason?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          billing_email: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          domain: string | null
          features_enabled: string[] | null
          id: string
          job_limit: string | null
          kvk_number: string | null
          logo_url: string | null
          name: string
          plan: Database["public"]["Enums"]["tenant_plan"]
          postal_code: string | null
          settings: Json | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          storage_limit_mb: string | null
          stripe_customer_id: string | null
          subdomain: string | null
          suspended_at: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_limit: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          billing_email?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          domain?: string | null
          features_enabled?: string[] | null
          id?: string
          job_limit?: string | null
          kvk_number?: string | null
          logo_url?: string | null
          name: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          postal_code?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          storage_limit_mb?: string | null
          stripe_customer_id?: string | null
          subdomain?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          billing_email?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          domain?: string | null
          features_enabled?: string[] | null
          id?: string
          job_limit?: string | null
          kvk_number?: string | null
          logo_url?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["tenant_plan"]
          postal_code?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          storage_limit_mb?: string | null
          stripe_customer_id?: string | null
          subdomain?: string | null
          suspended_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_limit?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      translations: {
        Row: {
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          is_auto_translated: boolean | null
          language: string
          tenant_id: string
          translated_by: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          is_auto_translated?: boolean | null
          language: string
          tenant_id?: string
          translated_by?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          is_auto_translated?: boolean | null
          language?: string
          tenant_id?: string
          translated_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "translations_translated_by_fkey"
            columns: ["translated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_engagement_metrics: {
        Row: {
          activity_level: string | null
          applications_submitted: number | null
          avg_session_duration: number | null
          churn_risk_score: number | null
          created_at: string | null
          date: string
          emails_opened: number | null
          emails_received: number | null
          engagement_score: number | null
          id: string
          jobs_viewed: number | null
          links_clicked: number | null
          pages_viewed: number | null
          searches_performed: number | null
          total_session_duration: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_level?: string | null
          applications_submitted?: number | null
          avg_session_duration?: number | null
          churn_risk_score?: number | null
          created_at?: string | null
          date: string
          emails_opened?: number | null
          emails_received?: number | null
          engagement_score?: number | null
          id?: string
          jobs_viewed?: number | null
          links_clicked?: number | null
          pages_viewed?: number | null
          searches_performed?: number | null
          total_session_duration?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_level?: string | null
          applications_submitted?: number | null
          avg_session_duration?: number | null
          churn_risk_score?: number | null
          created_at?: string | null
          date?: string
          emails_opened?: number | null
          emails_received?: number | null
          engagement_score?: number | null
          id?: string
          jobs_viewed?: number | null
          links_clicked?: number | null
          pages_viewed?: number | null
          searches_performed?: number | null
          total_session_duration?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          date_format: string | null
          id: string
          language: string
          tenant_id: string
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          id?: string
          language?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          average_rating: number | null
          company_name: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          is_verified: boolean | null
          name: string
          notification_email: string | null
          password: string | null
          total_ratings: number | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          average_rating?: number | null
          company_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          name: string
          notification_email?: string | null
          password?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          average_rating?: number | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          name?: string
          notification_email?: string | null
          password?: string | null
          total_ratings?: number | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      zzp_profiles: {
        Row: {
          availability: string | null
          created_at: string | null
          cv_url: string | null
          description: string | null
          education: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          job_title: string | null
          kvk_number: string | null
          portfolio_urls: string[] | null
          skills: string[] | null
          specialization: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          cv_url?: string | null
          description?: string | null
          education?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          job_title?: string | null
          kvk_number?: string | null
          portfolio_urls?: string[] | null
          skills?: string[] | null
          specialization?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          cv_url?: string | null
          description?: string | null
          education?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          job_title?: string | null
          kvk_number?: string | null
          portfolio_urls?: string[] | null
          skills?: string[] | null
          specialization?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zzp_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zzp_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_active_sessions_per_tenant"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "zzp_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tenant_storage_quotas: {
        Row: {
          file_count: number | null
          last_upload_at: string | null
          tenant_id: string | null
          used_bytes: number | null
        }
        Relationships: []
      }
      v_active_sessions_per_tenant: {
        Row: {
          active_sessions: number | null
          last_activity: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
        }
        Relationships: []
      }
      v_session_statistics: {
        Row: {
          active_sessions: number | null
          active_tenants: number | null
          active_users: number | null
          avg_idle_seconds: number | null
          expired_sessions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_tenant_invitation: {
        Args: { p_invitation_token: string; p_user_id: string }
        Returns: boolean
      }
      calculate_bureau_fee: {
        Args: {
          p_contract_type: Database["public"]["Enums"]["employment_type"]
          p_hourly_rate?: number
          p_rate_card_id: string
          p_salary?: number
        }
        Returns: Json
      }
      calculate_engagement_score: {
        Args: {
          p_applications: number
          p_emails_opened: number
          p_jobs_viewed: number
          p_links_clicked: number
        }
        Returns: number
      }
      calculate_response_time_hours: {
        Args: { p_distributed_at: string; p_first_submission_at: string }
        Returns: number
      }
      check_duplicate_candidate:
        | {
            Args: {
              p_email: string
              p_first_name?: string
              p_last_name?: string
              p_linkedin_url?: string
              p_phone?: string
            }
            Returns: {
              candidate_id: string
              email: string
              existing_bureau_id: string
              first_name: string
              last_name: string
              linkedin_url: string
              match_reason: string
              ownership_expires_at: string
              phone: string
            }[]
          }
        | {
            Args: {
              p_email: string
              p_first_name?: string
              p_last_name?: string
              p_phone?: string
            }
            Returns: {
              candidate_id: string
              is_fee_protected: boolean
              match_type: string
              owned_by_bureau_id: string
              ownership_expires_at: string
            }[]
          }
      check_sla_breach: {
        Args: {
          p_actual_value: number
          p_bureau_id: string
          p_metric_type: Database["public"]["Enums"]["sla_metric_type"]
        }
        Returns: {
          is_breached: boolean
          severity: Database["public"]["Enums"]["sla_severity"]
          threshold_value: number
        }[]
      }
      cleanup_expired_sessions: {
        Args: never
        Returns: {
          deleted_count: number
        }[]
      }
      clear_tenant_context: { Args: never; Returns: undefined }
      create_default_sla_config: {
        Args: { p_bureau_id: string }
        Returns: undefined
      }
      create_tenant_with_owner: {
        Args: {
          p_owner_user_id: string
          p_plan?: Database["public"]["Enums"]["tenant_plan"]
          p_tenant_name: string
          p_tenant_slug: string
        }
        Returns: string
      }
      create_user_profile_direct: {
        Args: {
          p_company_name?: string
          p_email: string
          p_id: string
          p_is_admin?: boolean
          p_is_verified?: boolean
          p_name: string
          p_user_type?: string
        }
        Returns: undefined
      }
      determine_activity_level: { Args: { score: number }; Returns: string }
      generate_contract_number: {
        Args: {
          p_contract_type: Database["public"]["Enums"]["employment_type"]
          p_tenant_id: string
        }
        Returns: string
      }
      generate_invitation_token: { Args: never; Returns: string }
      generate_msa_number: { Args: { p_tenant_id: string }; Returns: string }
      get_bureau_sla_status: {
        Args: { p_bureau_id: string }
        Returns: {
          active_breaches_count: number
          critical_threshold: number
          current_value: number
          is_breached: boolean
          metric_type: Database["public"]["Enums"]["sla_metric_type"]
          severity: Database["public"]["Enums"]["sla_severity"]
          target_value: number
          total_breaches_count: number
          warning_threshold: number
        }[]
      }
      get_current_tenant_context: {
        Args: never
        Returns: {
          tenant_id: string
          user_id: string
          user_role: string
        }[]
      }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_tenant_ids: { Args: never; Returns: string[] }
      has_job_access: {
        Args: { bureau_id_param: string; job_id_param: string }
        Returns: boolean
      }
      invite_user_to_tenant: {
        Args: {
          p_email: string
          p_invited_by: string
          p_message?: string
          p_role?: Database["public"]["Enums"]["membership_role"]
          p_tenant_id: string
        }
        Returns: string
      }
      is_bureau_user: { Args: never; Returns: boolean }
      match_bureaus_to_job: {
        Args: { p_job_id: string; p_limit?: number }
        Returns: {
          bureau_id: string
          bureau_name: string
          location_match: boolean
          match_score: number
          performance_score: number
          performance_tier: Database["public"]["Enums"]["performance_tier"]
          specialization_match: boolean
        }[]
      }
      normalize_linkedin_url: { Args: { url: string }; Returns: string }
      normalize_phone: { Args: { phone_number: string }; Returns: string }
      owns_bureau: { Args: { bureau_id_param: string }; Returns: boolean }
      refresh_storage_quotas: { Args: never; Returns: undefined }
      set_current_tenant_context: {
        Args: { p_tenant_id: string; p_user_id: string; p_user_role: string }
        Returns: undefined
      }
      user_has_role_in_tenant: {
        Args: {
          check_tenant_id: string
          required_roles: Database["public"]["Enums"]["membership_role"][]
        }
        Returns: boolean
      }
      user_has_tenant_access: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_delivery_method: "EMAIL" | "SMS" | "IN_APP" | "WEBHOOK"
      application_status:
        | "NEW"
        | "VIEWED"
        | "SHORTLIST"
        | "REJECTED"
        | "INTERVIEW"
        | "PLACED"
      bureau_performance_tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "NEW"
      bureau_specialization_category:
        | "IT"
        | "FINANCE"
        | "HEALTHCARE"
        | "ENGINEERING"
        | "SALES"
        | "MARKETING"
        | "HR"
        | "LEGAL"
        | "LOGISTICS"
        | "CONSTRUCTION"
        | "HOSPITALITY"
        | "EDUCATION"
        | "OTHER"
      contract_status:
        | "DRAFT"
        | "PENDING_REVIEW"
        | "PENDING_APPROVAL"
        | "APPROVED"
        | "PENDING_SIGNATURE"
        | "PARTIALLY_SIGNED"
        | "FULLY_SIGNED"
        | "ACTIVE"
        | "COMPLETED"
        | "CANCELLED"
        | "TERMINATED"
      distribution_status:
        | "PENDING"
        | "ACTIVE"
        | "PAUSED"
        | "CLOSED"
        | "AUTO_STOPPED"
      distribution_tier: "EXCLUSIVE" | "PREFERRED" | "STANDARD" | "OPEN"
      employment_type: "VAST" | "INTERIM" | "UITZENDEN"
      fee_calculation_type:
        | "PERCENTAGE"
        | "FIXED_AMOUNT"
        | "TIERED"
        | "HOURLY_MARKUP"
        | "CUSTOM"
      fee_type: "PERCENTAGE" | "FIXED_AMOUNT" | "HOURLY_MARKUP"
      invitation_status:
        | "PENDING"
        | "ACCEPTED"
        | "DECLINED"
        | "EXPIRED"
        | "CANCELLED"
      job_status: "OPEN" | "PAUSED" | "CLOSED"
      membership_role: "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER"
      membership_status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE"
      msa_status: "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED"
      notification_type: "MESSAGE" | "APPLICATION" | "JOB_STATUS" | "SYSTEM"
      payment_status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"
      performance_tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
      seniority_level:
        | "JUNIOR"
        | "MEDIOR"
        | "SENIOR"
        | "LEAD"
        | "PRINCIPAL"
        | "C_LEVEL"
      signature_type: "ELECTRONIC" | "DIGITAL" | "WET" | "CLICK_TO_SIGN"
      sla_metric_type:
        | "RESPONSE_TIME"
        | "SUBMISSION_RATE"
        | "QUALITY_RATE"
        | "FILL_RATE"
        | "ACCEPTANCE_RATE"
      sla_severity: "INFO" | "WARNING" | "CRITICAL" | "RESOLVED"
      subscription_plan: "STARTER" | "GROWTH" | "UNLIMITED"
      subscription_status:
        | "TRIAL"
        | "ACTIVE"
        | "PAST_DUE"
        | "CANCELED"
        | "PAUSED"
      tenant_plan: "STARTER" | "GROWTH" | "UNLIMITED" | "ENTERPRISE"
      tenant_status: "ACTIVE" | "SUSPENDED" | "INACTIVE" | "DELETED"
      thread_status: "ACTIVE" | "ARCHIVED" | "CLOSED"
      user_type: "BEDRIJF" | "ZZP" | "BUREAU" | "SOLLICITANT"
      verification_status: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      alert_delivery_method: ["EMAIL", "SMS", "IN_APP", "WEBHOOK"],
      application_status: [
        "NEW",
        "VIEWED",
        "SHORTLIST",
        "REJECTED",
        "INTERVIEW",
        "PLACED",
      ],
      bureau_performance_tier: ["PLATINUM", "GOLD", "SILVER", "BRONZE", "NEW"],
      bureau_specialization_category: [
        "IT",
        "FINANCE",
        "HEALTHCARE",
        "ENGINEERING",
        "SALES",
        "MARKETING",
        "HR",
        "LEGAL",
        "LOGISTICS",
        "CONSTRUCTION",
        "HOSPITALITY",
        "EDUCATION",
        "OTHER",
      ],
      contract_status: [
        "DRAFT",
        "PENDING_REVIEW",
        "PENDING_APPROVAL",
        "APPROVED",
        "PENDING_SIGNATURE",
        "PARTIALLY_SIGNED",
        "FULLY_SIGNED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "TERMINATED",
      ],
      distribution_status: [
        "PENDING",
        "ACTIVE",
        "PAUSED",
        "CLOSED",
        "AUTO_STOPPED",
      ],
      distribution_tier: ["EXCLUSIVE", "PREFERRED", "STANDARD", "OPEN"],
      employment_type: ["VAST", "INTERIM", "UITZENDEN"],
      fee_calculation_type: [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "TIERED",
        "HOURLY_MARKUP",
        "CUSTOM",
      ],
      fee_type: ["PERCENTAGE", "FIXED_AMOUNT", "HOURLY_MARKUP"],
      invitation_status: [
        "PENDING",
        "ACCEPTED",
        "DECLINED",
        "EXPIRED",
        "CANCELLED",
      ],
      job_status: ["OPEN", "PAUSED", "CLOSED"],
      membership_role: ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"],
      membership_status: ["ACTIVE", "PENDING", "SUSPENDED", "INACTIVE"],
      msa_status: ["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"],
      notification_type: ["MESSAGE", "APPLICATION", "JOB_STATUS", "SYSTEM"],
      payment_status: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      performance_tier: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
      seniority_level: [
        "JUNIOR",
        "MEDIOR",
        "SENIOR",
        "LEAD",
        "PRINCIPAL",
        "C_LEVEL",
      ],
      signature_type: ["ELECTRONIC", "DIGITAL", "WET", "CLICK_TO_SIGN"],
      sla_metric_type: [
        "RESPONSE_TIME",
        "SUBMISSION_RATE",
        "QUALITY_RATE",
        "FILL_RATE",
        "ACCEPTANCE_RATE",
      ],
      sla_severity: ["INFO", "WARNING", "CRITICAL", "RESOLVED"],
      subscription_plan: ["STARTER", "GROWTH", "UNLIMITED"],
      subscription_status: [
        "TRIAL",
        "ACTIVE",
        "PAST_DUE",
        "CANCELED",
        "PAUSED",
      ],
      tenant_plan: ["STARTER", "GROWTH", "UNLIMITED", "ENTERPRISE"],
      tenant_status: ["ACTIVE", "SUSPENDED", "INACTIVE", "DELETED"],
      thread_status: ["ACTIVE", "ARCHIVED", "CLOSED"],
      user_type: ["BEDRIJF", "ZZP", "BUREAU", "SOLLICITANT"],
      verification_status: ["PENDING", "VERIFIED", "REJECTED", "EXPIRED"],
    },
  },
} as const
