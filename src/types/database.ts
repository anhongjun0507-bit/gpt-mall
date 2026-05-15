// Supabase 스키마 타입 — 0001_initial_schema.sql 과 일대일 대응.
// 스키마 변경 시 이 파일도 함께 갱신할 것.
// (선택) 자동 생성으로 교체:
//   set -a && source .env.local && set +a
//   npx supabase gen types typescript --project-id rrgsbbwkafvkqwnodmir > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── enum 같은 합집합 타입 ─────────────────────────────────
export type UserRole = "customer" | "admin";
export type ProductCategory =
  | "ai_assistant"
  | "ai_image"
  | "ai_coding"
  | "ai_video"
  | "ai_voice"
  | "productivity";
export type ProductBadge = "BEST" | "NEW" | "HOT";
export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentMethod = "kakaopay" | "naverpay" | "card";

// 상품 옵션 — products.options jsonb 구조 (0006 마이그레이션 이후).
// price_modifier 는 products.price 에 더하는 금액 (음수 허용).
export type ProductOptionValue = {
  label: string;
  price_modifier: number;
};
export type ProductOption = {
  name: string; // 예: "기간"
  values: ProductOptionValue[];
};

// 주문 아이템에 담기는 선택 옵션 — order_items.selected_options jsonb
export type SelectedOptions = Record<string, string>;

// ─── Database 인터페이스 ────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: ProductCategory;
          price: number;
          original_price: number | null;
          image_url: string | null;
          description: string | null;
          short_description: string | null;
          stock: number;
          options: ProductOption[];
          badge: ProductBadge | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: ProductCategory;
          price: number;
          original_price?: number | null;
          image_url?: string | null;
          description?: string | null;
          short_description?: string | null;
          stock?: number;
          options?: ProductOption[];
          badge?: ProductBadge | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: ProductCategory;
          price?: number;
          original_price?: number | null;
          image_url?: string | null;
          description?: string | null;
          short_description?: string | null;
          stock?: number;
          options?: ProductOption[];
          badge?: ProductBadge | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          total: number;
          status: OrderStatus;
          payment_method: PaymentMethod | null;
          recipient_name: string;
          recipient_email: string | null;
          recipient_phone: string;
          memo: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          total: number;
          status?: OrderStatus;
          payment_method?: PaymentMethod | null;
          recipient_name: string;
          recipient_email?: string | null;
          recipient_phone: string;
          memo?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          total?: number;
          status?: OrderStatus;
          payment_method?: PaymentMethod | null;
          recipient_name?: string;
          recipient_email?: string | null;
          recipient_phone?: string;
          memo?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users"; // auth.users
            referencedColumns: ["id"];
          }
        ];
      };

      password_attempts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "password_attempts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users"; // auth.users
            referencedColumns: ["id"];
          }
        ];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          product_image: string | null;
          price: number;
          qty: number;
          selected_options: SelectedOptions;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          product_image?: string | null;
          price: number;
          qty?: number;
          selected_options?: SelectedOptions;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          product_image?: string | null;
          price?: number;
          qty?: number;
          selected_options?: SelectedOptions;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─── 헬퍼 ─────────────────────────────────────────────────────
// 사용 예: type Product = Tables<'products'>;
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// 도메인 별칭
export type Product = Tables<"products">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Profile = Tables<"profiles">;
