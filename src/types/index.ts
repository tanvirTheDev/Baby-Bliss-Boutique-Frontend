export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  lowStockAlert?: number;
  category: ProductCategory;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  gender: Gender;
  ageGroup: AgeGroup;
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isOrganic: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export type ProductSize = "NB" | "0-3M" | "3-6M" | "6-12M" | "1Y" | "2Y";

export type ProductCategory =
  | "onesies"
  | "sleepwear"
  | "sets"
  | "accessories"
  | "outerwear"
  | "essentials";

export type Gender = "boy" | "girl" | "unisex";

export type AgeGroup = "newborn" | "infant" | "toddler";

export type ProductStatus = "active" | "draft" | "archived";

export interface CartItem {
  product: Product;
  variantId: string;
  quantity: number;
  size: ProductSize;
  color: ProductColor;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export type UserRole = "customer" | "admin";

export interface ShippingAddress {
  id: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Pick<User, "id" | "firstName" | "lastName" | "email">;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Pick<Product, "id" | "name" | "images">;
  quantity: number;
  size: ProductSize;
  color: ProductColor;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "credit_card" | "paypal";

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  activeCustomers: number;
  customersChange: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  size?: ProductSize;
  color?: string;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
  search?: string;
  page?: number;
  limit?: number;
}
