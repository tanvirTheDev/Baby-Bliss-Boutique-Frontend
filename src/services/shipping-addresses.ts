import { api } from "./api";

export interface ShippingAddress {
  id: string;
  userId?: string;
  fullName: string;
  phoneNumber: string;
  division: string;
  district: string;
  upazila: string;
  area?: string | null;
  street: string;
  zip?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShippingAddressInput {
  fullName: string;
  phoneNumber: string;
  division: string;
  district: string;
  upazila: string;
  area?: string;
  street: string;
  zip?: string;
  isDefault?: boolean;
}

export type UpdateShippingAddressInput = Partial<CreateShippingAddressInput>;

type AddressResponse = { message: string; data: ShippingAddress };
type AddressListResponse = { message: string; data: ShippingAddress[] };

export const shippingAddressService = {
  create(data: CreateShippingAddressInput) {
    return api.post<AddressResponse>("/shipping-addresses", data);
  },

  getById(id: string) {
    return api.get<AddressResponse>(`/shipping-addresses/${id}`);
  },

  update(id: string, data: UpdateShippingAddressInput) {
    return api.patch<AddressResponse>(`/shipping-addresses/${id}`, data);
  },

  delete(id: string) {
    return api.delete<{ message: string }>(`/shipping-addresses/${id}`);
  },

  getByUser(userId: string) {
    return api.get<AddressListResponse>(`/users/${userId}/shipping-addresses`);
  },
};
