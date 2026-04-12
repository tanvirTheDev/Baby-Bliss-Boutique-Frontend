import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discount: z.coerce.number().min(0).max(100).optional(),
  categoryId: z.string().min(1, "Category is required"),
  ageRanges: z.array(z.string()).min(1, "Select at least one age range"),
  tags: z.array(z.string()).default([]),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
