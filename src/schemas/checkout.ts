import { z } from "zod";

export const checkoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  area: z.string().trim().optional(),
  street: z.string().min(3, "Street address is required"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Zip must be 4 digits")
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
