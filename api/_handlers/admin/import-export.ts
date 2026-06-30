import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";

export async function handleAdminImportExportRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "exportProducts":
      return handleExportProducts(req, ctx.env);
    case "importProducts":
      return handleImportProducts(req, ctx.env);
    case "exportOrders":
      return handleExportOrders(req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

function escapeCSV(val: unknown): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((r) => r.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\n");
}

async function handleExportProducts(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const categoryId = url.searchParams.get("categoryId");

  try {
    const prisma = getPrisma(env);
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;

    const products = await prisma.product.findMany({
      where: where as never,
      include: {
        variants: true,
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        collection: { select: { name: true } },
        productTags: { include: { tag: true } },
        productLabels: { include: { label: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      return success({ data: { products }, filename: "products-export.json" });
    }

    const headers = [
      "id", "name", "slug", "description", "shortDescription", "category", "subcategory", "collection",
      "basePrice", "compareAtPrice", "costPrice", "currency", "gender", "material", "careInstructions",
      "isActive", "isFeatured", "isNew", "tags", "labels",
      "variants",
    ];

    const rows = products.map((p) => [
      p.id, p.name, p.slug, p.description ?? "", p.shortDescription ?? "",
      p.category?.name ?? "", p.subcategory?.name ?? "", p.collection?.name ?? "",
      String(p.basePrice), String(p.compareAtPrice ?? ""), String(p.costPrice ?? ""),
      p.currency, p.gender, p.material ?? "", p.careInstructions ?? "",
      String(p.isActive), String(p.isFeatured), String(p.isNew),
      p.productTags.map((t) => t.tag.name).join("; "),
      p.productLabels.map((l) => l.label.name).join("; "),
      p.variants.map((v) => `${v.sku}:${v.size}:${v.color}:${v.stock}`).join(" | "),
    ]);

    const csv = toCSV(headers, rows);
    return success({ csv, filename: "products-export.csv" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleImportProducts(req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const contentType = req.headers.get("content-type") ?? "";
    let products: Record<string, unknown>[] = [];

    if (contentType.includes("json")) {
      const body = await req.json();
      products = Array.isArray(body.products) ? body.products : [];
    } else if (contentType.includes("multipart")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) return badRequest("CSV file is required");
      const text = await file.text();
      products = parseCSV(text);
    } else {
      const text = await req.text();
      products = parseCSV(text);
    }

    if (products.length === 0) return badRequest("No products to import");
    if (products.length > 500) return badRequest("Maximum 500 products per import");

    const results = { imported: 0, skipped: 0, errors: [] as string[] };

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const name = String(row.name ?? "");
      if (!name.trim()) {
        results.skipped++;
        results.errors.push(`Row ${i + 1}: Missing name`);
        continue;
      }

      let slug = String(row.slug ?? slugify(name));
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

      try {
        const basePrice = parseFloat(String(row.basePrice ?? "0"));
        if (isNaN(basePrice)) {
          results.skipped++;
          results.errors.push(`Row ${i + 1} ("${name}"): Invalid basePrice`);
          continue;
        }

        const gender = String(row.gender ?? "unisex");
        const validGenders = ["men", "women", "unisex"];
        const finalGender = validGenders.includes(gender) ? gender : "unisex";

        const product = await prisma.product.create({
          data: {
            name,
            slug,
            description: String(row.description ?? ""),
            shortDescription: String(row.shortDescription ?? ""),
            basePrice,
            compareAtPrice: row.compareAtPrice ? parseFloat(String(row.compareAtPrice)) : null,
            costPrice: row.costPrice ? parseFloat(String(row.costPrice)) : null,
            currency: String(row.currency ?? "INR"),
            gender: finalGender as never,
            material: String(row.material ?? ""),
            careInstructions: String(row.careInstructions ?? ""),
            isActive: row.isActive === "false" ? false : true,
            isFeatured: row.isFeatured === "true" ? true : false,
            isNew: row.isNew === "true" ? true : false,
          },
        });

        if (row.variants) {
          const variantStrings = String(row.variants).split("|").map((v) => v.trim()).filter(Boolean);
          for (const vs of variantStrings) {
            const parts = vs.split(":").map((p) => p.trim());
            if (parts.length >= 3) {
              await prisma.productVariant.create({
                data: {
                  productId: product.id,
                  sku: parts[0],
                  size: parts[1],
                  color: parts[2],
                  stock: parseInt(parts[3] ?? "0"),
                  isActive: true,
                },
              });
            }
          }
        }

        results.imported++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Row ${i + 1} ("${name}"): ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return success(results);
  } catch (err) {
    return serverError(err);
  }
}

async function handleExportOrders(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const status = url.searchParams.get("status");

  try {
    const prisma = getPrisma(env);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where: where as never,
      include: {
        items: true,
        profile: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      return success({ data: { orders }, filename: "orders-export.json" });
    }

    const headers = [
      "orderNumber", "date", "customerName", "email", "status", "paymentStatus",
      "subtotal", "shipping", "tax", "discount", "total", "currency", "items",
    ];

    const rows = orders.map((o) => [
      o.orderNumber, o.createdAt.toISOString(),
      o.profile ? `${o.profile.firstName} ${o.profile.lastName ?? ""}`.trim() : "Guest",
      o.email, o.status, o.paymentStatus,
      String(o.subtotal), String(o.shippingCost), String(o.tax), String(o.discount),
      String(o.total), o.currency,
      o.items.map((i) => `${i.productName} x${i.quantity}`).join("; "),
    ]);

    const csv = toCSV(headers, rows);
    return success({ csv, filename: "orders-export.csv" });
  } catch (err) {
    return serverError(err);
  }
}

// ─── CSV Parser ───

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    result.push(row);
  }
  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
