import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  salePrice: z.coerce.number().positive().optional().or(z.literal(0)),
  costPrice: z.coerce.number().positive().optional().or(z.literal(0)),
  sku: z.string().min(3, "SKU is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  lowStockAlert: z.coerce.number().int().min(0).optional(),
  category: z.string().min(1, "Category is required"),
  gender: z.enum(["boy", "girl", "unisex"]),
  ageGroup: z.enum(["newborn", "infant", "toddler"]),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
