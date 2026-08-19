export const siteConfig = {
  name: "Baby Bliss Boutique",
  description:
    "Nurturing every step with the softest organic fabrics and timeless designs for your little ones.",
  tagline: "Dress Your Little One in Pure Bliss",
  url: "https://babyblissboutique.com",
  ogImage: "/og.png",
  links: {
    instagram: "https://instagram.com/babyblissboutique",
    pinterest: "https://pinterest.com/babyblissboutique",
  },
  features: [
    { label: "Free Shipping", description: "On orders over ৳50" },
    { label: "Easy Returns", description: "30-day returns" },
    { label: "100% Cotton", description: "Organic materials" },
    { label: "Secure Checkout", description: "SSL encrypted" },
  ],
  navigation: {
    main: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Categories", href: "/shop?view=categories" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      shop: [
        { label: "New Arrivals", href: "/shop?sort=newest" },
        { label: "Best Sellers", href: "/shop?sort=popular" },
        { label: "Organic Cotton", href: "/shop?tag=organic" },
        { label: "Gifts", href: "/shop?category=gifts" },
      ],
      information: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Shipping & Returns", href: "/shipping" },
        { label: "Wholesale", href: "/wholesale" },
      ],
    },
  },
  admin: {
    navigation: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Inventory", href: "/dashboard/products", icon: "Package" },
      { label: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
      { label: "Customers", href: "/dashboard/customers", icon: "Users" },
      { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
      { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
    ],
  },
} as const;
