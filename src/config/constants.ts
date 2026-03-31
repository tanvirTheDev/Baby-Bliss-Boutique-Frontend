export const PRODUCT_SIZES = ["NB", "0-3M", "3-6M", "6-12M", "1Y", "2Y"] as const;

export const PRODUCT_CATEGORIES = [
  { value: "onesies", label: "Onesies" },
  { value: "sleepwear", label: "Sleepwear" },
  { value: "sets", label: "Sets" },
  { value: "accessories", label: "Accessories" },
  { value: "outerwear", label: "Outerwear" },
  { value: "essentials", label: "Essentials" },
] as const;

export const GENDERS = [
  { value: "boy", label: "Boy" },
  { value: "girl", label: "Girl" },
  { value: "unisex", label: "Unisex" },
] as const;

export const AGE_GROUPS = [
  { value: "newborn", label: "Newborn (0-3 months)" },
  { value: "infant", label: "Infant (3-12 months)" },
  { value: "toddler", label: "Toddler (1-2 years)" },
] as const;

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
] as const;

export const ITEMS_PER_PAGE = 12;

export const FREE_SHIPPING_THRESHOLD = 50;

export const TAX_RATE = 0.07;
