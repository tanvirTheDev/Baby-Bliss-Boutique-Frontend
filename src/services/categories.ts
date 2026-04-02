import { api } from "./api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  _count?: { products: number };
}

interface CategoriesResponse {
  message: string;
  data: Category[];
}

interface CategoryResponse {
  message: string;
  data: Category;
}

export const categoryService = {
  getAll() {
    return api.get<CategoriesResponse>("/categories");
  },

  getById(id: string) {
    return api.get<CategoryResponse>(`/categories/${id}`);
  },

  create(data: {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
  }) {
    return api.post<CategoryResponse>("/categories", data);
  },

  update(
    id: string,
    data: Partial<{ name: string; description: string; image: string; isActive: boolean }>
  ) {
    return api.patch<CategoryResponse>(`/categories/${id}`, data);
  },

  delete(id: string) {
    return api.delete<{ message: string }>(`/categories/${id}`);
  },
};
