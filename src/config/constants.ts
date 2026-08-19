export const AGE_RANGES = [
  { value: "ZERO_TO_SIX_MONTHS", label: "0-6 Months" },
  { value: "SIX_TO_TWELVE_MONTHS", label: "6-12 Months" },
  { value: "ONE_YEAR", label: "1 Year" },
  { value: "TWO_YEARS", label: "2 Years" },
  { value: "THREE_YEARS", label: "3 Years" },
  { value: "FOUR_YEARS", label: "4 Years" },
  { value: "FIVE_YEARS", label: "5 Years" },
  { value: "SIX_YEARS", label: "6 Years" },
  { value: "SEVEN_YEARS", label: "7 Years" },
  { value: "EIGHT_YEARS", label: "8 Years" },
  { value: "NINE_YEARS", label: "9 Years" },
  { value: "TEN_YEARS", label: "10 Years" },
  { value: "ELEVEN_YEARS", label: "11 Years" },
  { value: "TWELVE_YEARS", label: "12 Years" },
  { value: "THIRTEEN_YEARS", label: "13 Years" },
  { value: "FOURTEEN_YEARS", label: "14 Years" },
] as const;

export const AGE_GROUPS = AGE_RANGES;

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

/** Prisma `Gender` — use for product create/update API */
export const PRODUCT_GENDER_API = [
  { value: "UNISEX", label: "Unisex" },
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" },
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
