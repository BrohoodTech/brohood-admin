export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order: number;
  created_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  logo_url?: string | null;
  is_featured?: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: 'size' | 'color' | 'dial' | 'edition';
  name: string;
  sku: string;
  stock_quantity: number;
  price_delta: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand_id?: string | null;
  category_id?: string | null;
  description?: string | null;
  specs?: Record<string, string> | null;
  mrp: number;
  price: number;
  primary_image?: string | null;
  is_hot: boolean;
  is_bestseller: boolean;
  is_new_arrival?: boolean;
  is_active: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  
  // Joined fields
  category?: Category | null;
  brand?: Brand | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  total_stock?: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  variant_name?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  product?: Product | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  final_total: number;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  courier_partner?: string | null;
  tracking_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  
  // Joined fields
  items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  description?: string | null;
  is_active: boolean;
  valid_until?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: 'customer' | 'manager' | 'admin';
  created_at?: string;
  
  // Aggregated analytics
  total_orders?: number;
  total_spent?: number;
}
