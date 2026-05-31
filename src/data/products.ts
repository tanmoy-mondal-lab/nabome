export type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: "Men" | "Women" | "Unisex" | "Accessories";
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  tags: string[];
  material: string;
  fit: string;
  rating: number;
  reviews: number;
};

const gallery = {
  black: "/images/products/product1.jpeg",
  white: "/images/products/product2.jpeg",
  hoodie: "/images/products/product3.jpeg",
  community: "/images/community/community.jpeg",
};

export const products: Product[] = [
  {
    id: 1,
    name: "NABOME Signature Oversized Tee",
    price: 1199,
    originalPrice: 1499,
    category: "Men",
    image: gallery.black,
    images: [gallery.black, gallery.white, gallery.hoodie],
    description:
      "Heavyweight 240 GSM cotton with a structured oversized drape, made for Kolkata evenings, college streets and quiet luxury styling.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Jet Black", "Off White", "Steel Grey"],
    stock: 50,
    isNew: true,
    isBestSeller: true,
    tags: ["oversized", "premium", "streetwear", "heavyweight"],
    material: "240 GSM combed cotton",
    fit: "Oversized",
    rating: 4.9,
    reviews: 128,
  },
  {
    id: 2,
    name: "Bengal Heritage Typography Tee",
    price: 999,
    originalPrice: 1299,
    category: "Women",
    image: gallery.white,
    images: [gallery.white, gallery.black, gallery.community],
    description:
      "Minimal Bengali typography on breathable cotton, balancing cultural memory with a clean contemporary streetwear silhouette.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Cream", "White"],
    stock: 40,
    isNew: true,
    tags: ["bengali", "culture", "minimal", "casual"],
    material: "Bio-washed cotton jersey",
    fit: "Relaxed",
    rating: 4.8,
    reviews: 86,
  },
  {
    id: 3,
    name: "Urban Essentials Hoodie",
    price: 1999,
    originalPrice: 2499,
    category: "Unisex",
    image: gallery.hoodie,
    images: [gallery.hoodie, gallery.black, gallery.white],
    description:
      "Premium 320 GSM brushed fleece with a warm handfeel, clean branding and an easy oversized shape for all-season layering.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal", "Grey"],
    stock: 25,
    isBestSeller: true,
    isLimited: true,
    tags: ["hoodie", "winter", "premium", "oversized"],
    material: "320 GSM brushed fleece",
    fit: "Oversized",
    rating: 4.9,
    reviews: 94,
  },
  {
    id: 4,
    name: "Creator Club Oversized Tee",
    price: 1299,
    originalPrice: 1599,
    category: "Men",
    image: gallery.black,
    images: [gallery.black, gallery.community, gallery.white],
    description:
      "A refined daily uniform for creators and founders, cut from premium cotton with a clean luxury streetwear attitude.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Sand"],
    stock: 35,
    isNew: true,
    isBestSeller: true,
    tags: ["creator", "streetwear", "premium"],
    material: "Heavy cotton jersey",
    fit: "Boxy oversized",
    rating: 4.7,
    reviews: 77,
  },
  {
    id: 5,
    name: "Minimal Logo Sweatshirt",
    price: 1799,
    originalPrice: 2199,
    category: "Unisex",
    image: gallery.hoodie,
    images: [gallery.hoodie, gallery.white, gallery.black],
    description:
      "A soft, structured sweatshirt with subtle branding, designed for travel days, adda sessions and elevated everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Cream"],
    stock: 30,
    isNew: true,
    tags: ["sweatshirt", "minimal", "premium"],
    material: "Brushed cotton blend",
    fit: "Relaxed",
    rating: 4.8,
    reviews: 65,
  },
  {
    id: 6,
    name: "Statement Tote Bag",
    price: 799,
    originalPrice: 999,
    category: "Accessories",
    image: gallery.community,
    images: [gallery.community, gallery.black, gallery.white],
    description:
      "A heavy-duty canvas carryall for books, markets and studio days, finished with a restrained NABOME graphic.",
    sizes: ["One Size"],
    colors: ["Natural", "Black"],
    stock: 60,
    isNew: true,
    isBestSeller: true,
    tags: ["bag", "accessories", "canvas"],
    material: "Heavy canvas",
    fit: "Daily carry",
    rating: 4.6,
    reviews: 42,
  },
  {
    id: 7,
    name: "Premium Dad Cap",
    price: 699,
    originalPrice: 899,
    category: "Accessories",
    image: gallery.black,
    images: [gallery.black, gallery.white, gallery.community],
    description:
      "A structured adjustable cap with tonal embroidery and a comfortable all-day fit.",
    sizes: ["One Size"],
    colors: ["Black", "Stone", "Navy"],
    stock: 80,
    isBestSeller: true,
    tags: ["cap", "accessories", "premium"],
    material: "Cotton twill",
    fit: "Adjustable",
    rating: 4.7,
    reviews: 51,
  },
  {
    id: 8,
    name: "NABOME Essential Joggers",
    price: 1599,
    originalPrice: 1999,
    category: "Men",
    image: gallery.hoodie,
    images: [gallery.hoodie, gallery.black, gallery.white],
    description:
      "Premium cotton joggers with a tapered streetwear shape, engineered for movement and elevated daily comfort.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal", "Grey"],
    stock: 45,
    isNew: true,
    isLimited: true,
    tags: ["joggers", "lifestyle", "premium"],
    material: "Loopback cotton fleece",
    fit: "Tapered relaxed",
    rating: 4.8,
    reviews: 58,
  },
];

export const getBadges = (product: Product) =>
  [
    product.isNew ? "New" : "",
    product.isBestSeller ? "Best Seller" : "",
    product.isLimited ? "Limited Edition" : "",
  ].filter(Boolean);
