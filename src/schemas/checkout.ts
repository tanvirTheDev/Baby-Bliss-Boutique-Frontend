import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP code is required"),
  paymentMethod: z.enum(["credit_card", "paypal"], {
    message: "Please select a payment method",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
