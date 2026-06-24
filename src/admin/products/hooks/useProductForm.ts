import { useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export interface DropdownItem {
  id: string;
  name: string;
  categoryId?: string;
  color?: string;
  slug?: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string;
  collectionId: string;
  brandId: string;
  sizeGuideId: string;
  material: string;
  careInstructions: string;
  basePrice: number;
  compareAtPrice: number;
  costPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  gender: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDesc: string;
  scheduledPublishAt: string;
  scheduledArchiveAt: string;
  sizeChartUrl: string;
}

export interface VariantImage {
  id?: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  type?: string;
}

export interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  priceAdjustment: number;
  stock: number;
  weight: number;
  isActive: boolean;
  videoUrl?: string;
  videoPublicId?: string;
  images?: VariantImage[];
}

export interface ProductImage {
  id?: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  type?: string;
}

// ─── Dirty Tracking ───

export function useFormDirty(
  form: ProductFormData,
  variants: Variant[],
  images: ProductImage[],
  selectedLabels: string[]
) {
  const initialRef = useRef<{
    form: string;
    variants: string;
    images: string;
    labels: string;
  } | null>(null);

  const snapshot = useMemo(
    () => ({
      form: JSON.stringify(form),
      variants: JSON.stringify(variants),
      images: JSON.stringify(images),
      labels: JSON.stringify(selectedLabels),
    }),
    [form, variants, images, selectedLabels]
  );

  const dirty = useMemo(() => {
    if (!initialRef.current) return false;
    return (
      snapshot.form !== initialRef.current.form ||
      snapshot.variants !== initialRef.current.variants ||
      snapshot.images !== initialRef.current.images ||
      snapshot.labels !== initialRef.current.labels
    );
  }, [snapshot]);

  const setInitial = useCallback(
    (
      initForm: ProductFormData,
      initVariants: Variant[],
      initImages: ProductImage[],
      initLabels: string[]
    ) => {
      initialRef.current = {
        form: JSON.stringify(initForm),
        variants: JSON.stringify(initVariants),
        images: JSON.stringify(initImages),
        labels: JSON.stringify(initLabels),
      };
    },
    []
  );

  const resetDirty = useCallback(() => {
    initialRef.current = null;
  }, []);

  return { dirty, setInitial, resetDirty };
}

// ─── Validation ───

export interface FormErrors {
  name?: string;
  basePrice?: string;
}

export function validateProductForm(form: ProductFormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Product name is required";
  if (form.basePrice <= 0) errors.basePrice = "Price must be greater than 0";
  return errors;
}

// ─── React Query Hooks ───

export function useProductDropdowns() {
  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.getCategories().then((r: any) => (r.categories ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  const subcategories = useQuery({
    queryKey: ["admin", "subcategories"],
    queryFn: () => adminApi.getSubcategories().then((r: any) => (r.subcategories ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  const collections = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: () => adminApi.getCollections().then((r: any) => (r.collections ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  const brands = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: () => adminApi.getBrands().then((r: any) => (r.brands ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  const labels = useQuery({
    queryKey: ["admin", "labels"],
    queryFn: () => adminApi.getLabels().then((r: any) => (r.labels ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  const sizeGuides = useQuery({
    queryKey: ["admin", "sizeGuides"],
    queryFn: () => adminApi.getSizeGuides().then((r: any) => (r.sizeGuides ?? []) as DropdownItem[]),
    staleTime: 1000 * 60 * 10,
  });

  return { categories, subcategories, collections, brands, labels, sizeGuides };
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await adminApi.getProduct(id);
      return res.product as Record<string, unknown>;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

// ─── Form Helpers ───

export function buildDefaultForm(): ProductFormData {
  return {
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    subcategoryId: "",
    collectionId: "",
    brandId: "",
    sizeGuideId: "",
    material: "",
    careInstructions: "",
    basePrice: 0,
    compareAtPrice: 0,
    costPrice: 0,
    salePrice: 0,
    discountPercent: 0,
    currency: "INR",
    gender: "unisex",
    isActive: false,
    isFeatured: false,
    isNew: false,
    sortOrder: 0,
    metaTitle: "",
    metaDesc: "",
    scheduledPublishAt: "",
    scheduledArchiveAt: "",
    sizeChartUrl: "",
  };
}

export function productToForm(p: Record<string, unknown>): ProductFormData {
  return {
    name: (p.name as string) ?? "",
    slug: (p.slug as string) ?? "",
    description: (p.description as string) ?? "",
    shortDescription: (p.shortDescription as string) ?? "",
    categoryId: (p.categoryId as string) ?? "",
    subcategoryId: (p.subcategoryId as string) ?? "",
    collectionId: (p.collectionId as string) ?? "",
    brandId: (p.brandId as string) ?? "",
    sizeGuideId: (p.sizeGuideId as string) ?? "",
    material: (p.material as string) ?? "",
    careInstructions: (p.careInstructions as string) ?? "",
    basePrice: Number(p.basePrice ?? 0),
    compareAtPrice: Number(p.compareAtPrice ?? 0),
    costPrice: Number(p.costPrice ?? 0),
    salePrice: Number(p.salePrice ?? 0),
    discountPercent: Number(p.discountPercent ?? 0),
    currency: (p.currency as string) ?? "INR",
    gender: (p.gender as string) ?? "unisex",
    isActive: (p.isActive as boolean) ?? false,
    isFeatured: (p.isFeatured as boolean) ?? false,
    isNew: (p.isNew as boolean) ?? false,
    sortOrder: (p.sortOrder as number) ?? 0,
    metaTitle: (p.metaTitle as string) ?? "",
    metaDesc: (p.metaDesc as string) ?? "",
    scheduledPublishAt: (p.scheduledPublishAt as string) ?? "",
    scheduledArchiveAt: (p.scheduledArchiveAt as string) ?? "",
    sizeChartUrl: (p.sizeChartUrl as string) ?? "",
  };
}

export function productToVariants(p: Record<string, unknown>): Variant[] {
  const rawVariants = (p.variants as Variant[]) ?? [];
  return rawVariants.map((v) => ({
    ...v,
    images: ((v as unknown as Record<string, unknown>).images as VariantImage[]) ?? [],
  }));
}

export function productToImages(p: Record<string, unknown>): ProductImage[] {
  return (p.images as ProductImage[]) ?? [];
}

export function productToSelectedLabels(p: Record<string, unknown>): string[] {
  const tags = (p.productLabels as { label: Record<string, unknown> }[]) ?? [];
  return tags.map((t) => t.label.id as string);
}
