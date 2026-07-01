import { MediaPicker } from "../common/MediaPicker";
import { useState, useCallback, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { Plus, Eye, Check, Palette, Type, Layout, Image, Code } from "lucide-react";
import { type Theme, type ThemeColors, type ThemeTypography, type ThemeButtonStyle } from "../../cms/core/cms-types";
import { useToast } from "../../components/ui/Toast";

const DEFAULT_THEME: Theme = {
  id: "",
  name: "Premium Fashion",
  description: "Default premium fashion theme",
  isActive: true, isSystem: false, previewImage: "",
  branding: {
    logo: "", logoLight: "", logoDark: "", logoMobile: "",
    favicon: "", brandName: "নবME", brandDescription: "", brandTagline: "",
  },
  design: {
    colors: {
      primary: "#000000", primaryLight: "#333333", primaryDark: "#000000",
      secondary: "#ffffff", secondaryLight: "#ffffff", secondaryDark: "#f5f5f5",
      accent: "#d4a853", accentLight: "#e8c97a", accentDark: "#b8912e",
      background: "#ffffff", backgroundSecondary: "#f9fafb",
      surface: "#ffffff", text: "#1f2937", textSecondary: "#6b7280",
      textInverse: "#ffffff", success: "#10b981", warning: "#f59e0b", error: "#ef4444", info: "#3b82f6",
    },
    typography: {
      displayFont: "Playfair Display", headingFont: "Inter", bodyFont: "Inter", monoFont: "SF Mono",
      baseSize: "16px", scaleRatio: "1.25",
      h1Size: "3rem", h2Size: "2.25rem", h3Size: "1.875rem", h4Size: "1.5rem",
      bodySize: "1rem", smallSize: "0.875rem",
      fontWeightLight: 300, fontWeightNormal: 400, fontWeightMedium: 500, fontWeightBold: 700,
      lineHeightTight: "1.2", lineHeightNormal: "1.5", lineHeightRelaxed: "1.75",
      letterSpacing: "0",
    },
    buttons: {
      primaryBg: "#000000", primaryText: "#ffffff", primaryBorder: "#000000",
      primaryRadius: "0.375rem", primaryPadding: "0.75rem 1.5rem", primaryFontWeight: 500,
      primaryHoverBg: "#1f2937", primaryHoverText: "#ffffff",
      secondaryBg: "#ffffff", secondaryText: "#1f2937", secondaryBorder: "#d1d5db",
      secondaryRadius: "0.375rem", secondaryPadding: "0.75rem 1.5rem", secondaryFontWeight: 500,
      secondaryHoverBg: "#f9fafb", secondaryHoverText: "#1f2937",
      outlineBg: "transparent", outlineText: "#000000", outlineBorder: "#000000",
      outlineRadius: "9999px", outlinePadding: "0.5rem 1.25rem", outlineFontWeight: 500,
      outlineHoverBg: "#000000", outlineHoverText: "#ffffff",
    } as ThemeButtonStyle,
    borderRadius: { none: "0", sm: "0.125rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    },
    cards: {
      productBg: "#ffffff", productRadius: "0.5rem", productShadow: "sm",
      productHoverShadow: "lg", productHoverTransform: "translateY(-2px)",
      productImageRatio: "75%",
      collectionBg: "#ffffff", collectionRadius: "0.75rem", collectionShadow: "md",
      collectionOverlay: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7))",
    },
  },
  layout: {
    containerWidth: "1280px", maxWidth: "1440px", contentGutter: "2rem",
    headerStyle: "sticky", footerStyle: "standard",
    sidebarWidth: "16rem", productCardLayout: "standard",
  },
  header: {
    style: "standard", sticky: true, transparent: false,
    announcementBar: false, searchBar: true, cartIcon: true,
    wishlistIcon: true, accountIcon: true,
    menuLocation: "center", menuStyle: "standard",
  },
  footer: {
    style: "standard", columns: 4, showNewsletter: true,
    showSocialLinks: true, showContact: true, showPolicyLinks: true, paymentIcons: true,
  },
  customCSS: "",
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeButton(
  source: Record<string, unknown>,
  legacy: Record<string, unknown>,
  style: "primary" | "secondary" | "outline",
  defaults: ThemeButtonStyle
): Pick<ThemeButtonStyle,
  | `${typeof style}Bg`
  | `${typeof style}Text`
  | `${typeof style}Border`
  | `${typeof style}Radius`
  | `${typeof style}Padding`
  | `${typeof style}FontWeight`
  | `${typeof style}HoverBg`
  | `${typeof style}HoverText`
> {
  const prefix = style as "primary" | "secondary" | "outline";
  const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const flat = (suffix: string) => source[`${prefix}${suffix}`];
  return {
    [`${prefix}Bg`]: asString(flat("Bg"), asString(legacy.bg, defaults[`${prefix}Bg` as keyof ThemeButtonStyle] as string)),
    [`${prefix}Text`]: asString(flat("Text"), asString(legacy.text, defaults[`${prefix}Text` as keyof ThemeButtonStyle] as string)),
    [`${prefix}Border`]: asString(flat("Border"), asString(legacy.border, defaults[`${prefix}Border` as keyof ThemeButtonStyle] as string)),
    [`${prefix}Radius`]: asString(flat("Radius"), asString(legacy.radius, defaults[`${prefix}Radius` as keyof ThemeButtonStyle] as string)),
    [`${prefix}Padding`]: asString(
      flat("Padding"),
      legacy.padding
        ? String(legacy.padding)
        : legacy.paddingY || legacy.paddingX
          ? `${asString(legacy.paddingY, "0.75rem")} ${asString(legacy.paddingX, "1.5rem")}`
          : defaults[`${prefix}Padding` as keyof ThemeButtonStyle] as string
    ),
    [`${prefix}FontWeight`]: asNumber(flat("FontWeight"), asNumber(legacy.fontWeight, defaults[`${prefix}FontWeight` as keyof ThemeButtonStyle] as number)),
    [`${prefix}HoverBg`]: asString(flat("HoverBg"), asString(legacy.hoverBg, defaults[`${prefix}HoverBg` as keyof ThemeButtonStyle] as string)),
    [`${prefix}HoverText`]: asString(flat("HoverText"), asString(legacy.hoverText, defaults[`${prefix}HoverText` as keyof ThemeButtonStyle] as string)),
  } as Pick<ThemeButtonStyle,
    | `${typeof style}Bg`
    | `${typeof style}Text`
    | `${typeof style}Border`
    | `${typeof style}Radius`
    | `${typeof style}Padding`
    | `${typeof style}FontWeight`
    | `${typeof style}HoverBg`
    | `${typeof style}HoverText`
  >;
}

function normalizeTheme(value: unknown): Theme {
  const source = asRecord(value);
  const design = asRecord(source.design);
  const brandingSource = { ...asRecord(design.branding), ...asRecord(source.branding) };
  const colorSource = { ...asRecord(source.colors), ...asRecord(design.colors) };
  const typographySource = { ...asRecord(source.typography), ...asRecord(design.typography) };
  const displaySizes = asRecord(typographySource.displaySizes);
  const headingWeights = asRecord(typographySource.headingWeights);
  const buttonSource = { ...asRecord(source.buttons), ...asRecord(design.buttons) };
  const layoutSource = { ...asRecord(design.layout), ...asRecord(source.layout) };
  const headerSource = { ...asRecord(design.header), ...asRecord(source.header) };
  const footerSource = asRecord(source.footer);

  const buttons: ThemeButtonStyle = {
    ...DEFAULT_THEME.design.buttons,
    ...normalizeButton(buttonSource, asRecord(buttonSource.primary), "primary", DEFAULT_THEME.design.buttons),
    ...normalizeButton(buttonSource, asRecord(buttonSource.secondary), "secondary", DEFAULT_THEME.design.buttons),
    ...normalizeButton(buttonSource, asRecord(buttonSource.outline), "outline", DEFAULT_THEME.design.buttons),
  };

  return {
    ...DEFAULT_THEME,
    ...source,
    branding: {
      ...DEFAULT_THEME.branding,
      logo: asString(brandingSource.logo, asString(brandingSource.logoLight, DEFAULT_THEME.branding.logo)),
      logoLight: asString(brandingSource.logoLight, asString(brandingSource.logo, DEFAULT_THEME.branding.logoLight)),
      logoDark: asString(brandingSource.logoDark, DEFAULT_THEME.branding.logoDark),
      logoMobile: asString(brandingSource.logoMobile, DEFAULT_THEME.branding.logoMobile),
      favicon: asString(brandingSource.favicon, DEFAULT_THEME.branding.favicon),
      brandName: asString(brandingSource.brandName, asString(brandingSource.siteName, DEFAULT_THEME.branding.brandName)),
      brandDescription: asString(brandingSource.brandDescription, asString(brandingSource.description, DEFAULT_THEME.branding.brandDescription)),
      brandTagline: asString(brandingSource.brandTagline, asString(brandingSource.tagline, DEFAULT_THEME.branding.brandTagline)),
    },
    design: {
      ...DEFAULT_THEME.design,
      colors: {
        ...DEFAULT_THEME.design.colors,
        ...colorSource,
        textInverse: asString(colorSource.textInverse, asString(colorSource.textOnPrimary, DEFAULT_THEME.design.colors.textInverse)),
        backgroundSecondary: asString(colorSource.backgroundSecondary, asString(colorSource.surface, DEFAULT_THEME.design.colors.backgroundSecondary)),
      } as ThemeColors,
      typography: {
        ...DEFAULT_THEME.design.typography,
        ...typographySource,
        baseSize: asString(typographySource.baseSize, asString(typographySource.bodySize, DEFAULT_THEME.design.typography.baseSize)),
        h1Size: asString(typographySource.h1Size, asString(displaySizes.lg, DEFAULT_THEME.design.typography.h1Size)),
        h2Size: asString(typographySource.h2Size, asString(displaySizes.md, DEFAULT_THEME.design.typography.h2Size)),
        h3Size: asString(typographySource.h3Size, asString(displaySizes.sm, DEFAULT_THEME.design.typography.h3Size)),
        fontWeightNormal: asNumber(typographySource.fontWeightNormal, asNumber(headingWeights.regular, DEFAULT_THEME.design.typography.fontWeightNormal)),
        fontWeightMedium: asNumber(typographySource.fontWeightMedium, asNumber(headingWeights.medium, DEFAULT_THEME.design.typography.fontWeightMedium)),
        fontWeightBold: asNumber(typographySource.fontWeightBold, asNumber(headingWeights.bold, DEFAULT_THEME.design.typography.fontWeightBold)),
        lineHeightNormal: asString(typographySource.lineHeightNormal, typographySource.lineHeight ? String(typographySource.lineHeight) : DEFAULT_THEME.design.typography.lineHeightNormal),
      } as ThemeTypography,
      buttons,
      borderRadius: { ...DEFAULT_THEME.design.borderRadius, ...asRecord(design.borderRadius) },
      shadows: { ...DEFAULT_THEME.design.shadows, ...asRecord(design.shadows) },
      cards: { ...DEFAULT_THEME.design.cards, ...asRecord(design.cards) },
    },
    layout: {
      ...DEFAULT_THEME.layout,
      ...layoutSource,
      containerWidth: asString(layoutSource.containerWidth, asString(layoutSource.maxWidth, DEFAULT_THEME.layout.containerWidth)),
      maxWidth: asString(layoutSource.maxWidth, asString(layoutSource.containerMaxWidth, DEFAULT_THEME.layout.maxWidth)),
      headerStyle: ["standard", "fixed", "sticky", "glass", "transparent"].includes(String(layoutSource.headerStyle))
        ? layoutSource.headerStyle as Theme["layout"]["headerStyle"]
        : DEFAULT_THEME.layout.headerStyle,
      footerStyle: ["standard", "minimal", "expanded", "compact"].includes(String(layoutSource.footerStyle))
        ? layoutSource.footerStyle as Theme["layout"]["footerStyle"]
        : DEFAULT_THEME.layout.footerStyle,
      productCardLayout: ["standard", "minimal", "editorial", "expanded"].includes(String(layoutSource.productCardLayout))
        ? layoutSource.productCardLayout as Theme["layout"]["productCardLayout"]
        : DEFAULT_THEME.layout.productCardLayout,
    },
    header: {
      ...DEFAULT_THEME.header,
      ...headerSource,
      style: ["standard", "mega", "minimal", "centered"].includes(String(headerSource.style))
        ? headerSource.style as Theme["header"]["style"]
        : DEFAULT_THEME.header.style,
      menuLocation: ["left", "center", "right"].includes(String(headerSource.menuLocation))
        ? headerSource.menuLocation as Theme["header"]["menuLocation"]
        : DEFAULT_THEME.header.menuLocation,
    },
    footer: {
      ...DEFAULT_THEME.footer,
      ...footerSource,
      showSocialLinks: typeof footerSource.showSocialLinks === "boolean"
        ? footerSource.showSocialLinks
        : typeof footerSource.showSocial === "boolean"
          ? footerSource.showSocial
          : DEFAULT_THEME.footer.showSocialLinks,
      paymentIcons: typeof footerSource.paymentIcons === "boolean"
        ? footerSource.paymentIcons
        : typeof footerSource.showPaymentIcons === "boolean"
          ? footerSource.showPaymentIcons
          : DEFAULT_THEME.footer.paymentIcons,
    },
    customCSS: asString(source.customCSS, DEFAULT_THEME.customCSS),
  } as Theme;
}

export default function ThemeBuilder() {
  const [activeTheme, setActiveTheme] = useState<Theme>(DEFAULT_THEME);
  const [activeTab, setActiveTab] = useState<"branding" | "colors" | "typography" | "buttons" | "layout" | "header" | "footer" | "css">("branding");
  const [themeListOpen, setThemeListOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: queryTheme, isLoading } = useQuery({
    queryKey: ["admin", "themes"],
    queryFn: async () => {
      const res = await adminApi.getSettings();
      const s = res.settings as Record<string, unknown> ?? {};
      return normalizeTheme(s.theme);
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (queryTheme) setActiveTheme(queryTheme);
  }, [queryTheme]);

  const saveMutation = useMutation({
    mutationFn: async (theme: Theme) => {
      const current = await adminApi.getSettings();
      const settings = current.settings as Record<string, unknown> ?? {};
      const branding = theme.branding as unknown as Record<string, unknown>;
      return adminApi.updateSettings({
        ...settings,
        siteName: theme.branding.brandName || settings.siteName,
        tagline: theme.branding.brandTagline || null,
        logoUrl: theme.branding.logo || null,
        logoPublicId: branding.logoPublicId || null,
        faviconUrl: theme.branding.favicon || null,
        faviconPublicId: branding.faviconPublicId || null,
        theme,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      toast("Theme saved successfully", "success");
    },
    onError: () => {
      toast("Failed to save theme", "error");
    },
  });

  const updateTheme = useCallback((path: string, value: unknown) => {
    setActiveTheme((prev) => {
      const keys = path.split(".");
      const newTheme = structuredClone(prev);
      let obj: Record<string, unknown> = newTheme as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return newTheme;
    });
  }, []);

  const handleSave = () => {
    saveMutation.mutate(activeTheme);
  };

  const renderColorInput = (label: string, key: string, color: string) => (
    <div key={key} className="flex items-center gap-2">
      <label className="text-xs text-neutral-500 w-24 shrink-0">{label}</label>
      <input type="color" value={color}
        onChange={(e) => updateTheme(`design.colors.${key}`, e.target.value)}
        className="w-8 h-8 p-0.5 border border-neutral-200 rounded cursor-pointer" />
      <input type="text" value={color}
        onChange={(e) => updateTheme(`design.colors.${key}`, e.target.value)}
        className="flex-1 px-2 py-1 text-xs font-mono border border-neutral-200 rounded" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "branding" as const, label: "Branding", icon: Image },
    { id: "colors" as const, label: "Colors", icon: Palette },
    { id: "typography" as const, label: "Typography", icon: Type },
    { id: "buttons" as const, label: "Buttons", icon: Code },
    { id: "layout" as const, label: "Layout", icon: Layout },
    { id: "header" as const, label: "Header", icon: Layout },
    { id: "footer" as const, label: "Footer", icon: Layout },
    { id: "css" as const, label: "Custom CSS", icon: Code },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Theme Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Customize your store's appearance</p>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
          {saveMutation.isPending ? "Saving…" : "Save Theme"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded p-2 space-y-0.5">
            {tabs.map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}>
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-neutral-200 rounded p-6">
            {/* Branding */}
            {activeTab === "branding" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Brand Identity</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <MediaPicker value={activeTheme.branding.logo} onChange={(url, publicId) => { updateTheme("branding.logo", url); updateTheme("branding.logoPublicId", publicId ?? null); }} label="Logo URL (Light)" folder="branding" />
                  </div>
                  <div>
                    <MediaPicker value={activeTheme.branding.logoDark} onChange={(url, publicId) => { updateTheme("branding.logoDark", url); updateTheme("branding.logoDarkPublicId", publicId ?? null); }} label="Logo URL (Dark)" folder="branding" />
                  </div>
                  <div>
                    <MediaPicker value={activeTheme.branding.logoMobile} onChange={(url, publicId) => { updateTheme("branding.logoMobile", url); updateTheme("branding.logoMobilePublicId", publicId ?? null); }} label="Logo URL (Mobile)" folder="branding" />
                  </div>
                  <div>
                    <MediaPicker value={activeTheme.branding.favicon} onChange={(url, publicId) => { updateTheme("branding.favicon", url); updateTheme("branding.faviconPublicId", publicId ?? null); }} label="Favicon URL" folder="branding" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Brand Name</label>
                    <input value={activeTheme.branding.brandName}
                      onChange={(e) => updateTheme("branding.brandName", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Tagline</label>
                    <input value={activeTheme.branding.brandTagline}
                      onChange={(e) => updateTheme("branding.brandTagline", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Brand Description</label>
                  <textarea rows={3} value={activeTheme.branding.brandDescription}
                    onChange={(e) => updateTheme("branding.brandDescription", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
              </div>
            )}

            {/* Colors */}
            {activeTab === "colors" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Theme Colors</h2>
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Primary Colors</p>
                  {renderColorInput("Primary", "primary", activeTheme.design.colors.primary)}
                  {renderColorInput("Primary Light", "primaryLight", activeTheme.design.colors.primaryLight)}
                  {renderColorInput("Primary Dark", "primaryDark", activeTheme.design.colors.primaryDark)}
                </div>
                <hr className="border-neutral-100" />
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Accent / Gold</p>
                  {renderColorInput("Accent", "accent", activeTheme.design.colors.accent)}
                  {renderColorInput("Accent Light", "accentLight", activeTheme.design.colors.accentLight)}
                  {renderColorInput("Accent Dark", "accentDark", activeTheme.design.colors.accentDark)}
                </div>
                <hr className="border-neutral-100" />
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Background</p>
                  {renderColorInput("Background", "background", activeTheme.design.colors.background)}
                  {renderColorInput("Bg Secondary", "backgroundSecondary", activeTheme.design.colors.backgroundSecondary)}
                  {renderColorInput("Surface", "surface", activeTheme.design.colors.surface)}
                </div>
                <hr className="border-neutral-100" />
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Text</p>
                  {renderColorInput("Text", "text", activeTheme.design.colors.text)}
                  {renderColorInput("Text Secondary", "textSecondary", activeTheme.design.colors.textSecondary)}
                  {renderColorInput("Text Inverse", "textInverse", activeTheme.design.colors.textInverse)}
                </div>
                <hr className="border-neutral-100" />
                <div className="grid grid-cols-1 gap-2">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1">Status</p>
                  {renderColorInput("Success", "success", activeTheme.design.colors.success)}
                  {renderColorInput("Warning", "warning", activeTheme.design.colors.warning)}
                  {renderColorInput("Error", "error", activeTheme.design.colors.error)}
                  {renderColorInput("Info", "info", activeTheme.design.colors.info)}
                </div>
              </div>
            )}

            {/* Typography */}
            {activeTab === "typography" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Typography</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Display Font</label>
                    <select value={activeTheme.design.typography.displayFont}
                      onChange={(e) => updateTheme("design.typography.displayFont", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option>Playfair Display</option>
                      <option>DM Serif Display</option>
                      <option>Cormorant Garamond</option>
                      <option>Georgia</option>
                      <option>Libre Baskerville</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Heading Font</label>
                    <select value={activeTheme.design.typography.headingFont}
                      onChange={(e) => updateTheme("design.typography.headingFont", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option>Inter</option>
                      <option>Montserrat</option>
                      <option>Poppins</option>
                      <option>DM Sans</option>
                      <option>Space Grotesk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Body Font</label>
                    <select value={activeTheme.design.typography.bodyFont}
                      onChange={(e) => updateTheme("design.typography.bodyFont", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option>Inter</option>
                      <option>DM Sans</option>
                      <option>Public Sans</option>
                      <option>IBM Plex Sans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Base Size</label>
                    <select value={activeTheme.design.typography.baseSize}
                      onChange={(e) => updateTheme("design.typography.baseSize", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">H1 Size</label>
                    <input value={activeTheme.design.typography.h1Size}
                      onChange={(e) => updateTheme("design.typography.h1Size", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">H2 Size</label>
                    <input value={activeTheme.design.typography.h2Size}
                      onChange={(e) => updateTheme("design.typography.h2Size", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">H3 Size</label>
                    <input value={activeTheme.design.typography.h3Size}
                      onChange={(e) => updateTheme("design.typography.h3Size", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Line Height (Tight)</label>
                    <input value={activeTheme.design.typography.lineHeightTight}
                      onChange={(e) => updateTheme("design.typography.lineHeightTight", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Line Height (Normal)</label>
                    <input value={activeTheme.design.typography.lineHeightNormal}
                      onChange={(e) => updateTheme("design.typography.lineHeightNormal", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            {activeTab === "buttons" && (
              <div className="space-y-6">
                {(["primary", "secondary", "outline"] as const).map((style) => (
                  <div key={style}>
                    <h3 className="font-medium text-sm text-neutral-900 capitalize mb-3">{style} Button</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Bg", "Text", "Border", "Radius", "Padding"] as const).map((prop) => {
                        const key = `${style}${prop}` as keyof ThemeButtonStyle;
                        const value = String(activeTheme.design.buttons[key] ?? "");
                        return (
                          <div key={key}>
                            <label className="block text-[10px] text-neutral-400 mb-0.5">{prop.replace(/([A-Z])/g, " $1").trim()}</label>
                            {prop === "Bg" || prop === "Text" || prop === "Border" ? (
                              <div className="flex gap-1 items-center">
                                <input type="color" value={value}
                                  onChange={(e) => updateTheme(`design.buttons.${key}`, e.target.value)}
                                  className="w-7 h-7 p-0 border border-neutral-200 rounded cursor-pointer" />
                                <input value={value}
                                  onChange={(e) => updateTheme(`design.buttons.${key}`, e.target.value)}
                                  className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                              </div>
                            ) : (
                              <input value={value}
                                onChange={(e) => updateTheme(`design.buttons.${key}`, e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                            )}
                          </div>
                        );
                      })}
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Font Weight</label>
                        <input type="number" value={activeTheme.design.buttons[`${style}FontWeight` as keyof ThemeButtonStyle] as number}
                          onChange={(e) => updateTheme(`design.buttons.${style}FontWeight`, Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Hover {style === "outline" ? "Bg" : "Bg"}</label>
                        <div className="flex gap-1 items-center">
                          <input type="color"
                            value={String(activeTheme.design.buttons[`${style}Hover${style === "outline" ? "" : ""}Bg` as keyof ThemeButtonStyle] ?? "")}
                            onChange={(e) => updateTheme(`design.buttons.${style}HoverBg`, e.target.value)}
                            className="w-7 h-7 p-0 border border-neutral-200 rounded cursor-pointer" />
                          <input
                            value={String(activeTheme.design.buttons[`${style}HoverBg` as keyof ThemeButtonStyle] ?? "")}
                            onChange={(e) => updateTheme(`design.buttons.${style}HoverBg`, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout */}
            {activeTab === "layout" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Layout Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Container Width</label>
                    <input value={activeTheme.layout.containerWidth}
                      onChange={(e) => updateTheme("layout.containerWidth", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Max Width</label>
                    <input value={activeTheme.layout.maxWidth}
                      onChange={(e) => updateTheme("layout.maxWidth", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Header Style</label>
                    <select value={activeTheme.layout.headerStyle}
                      onChange={(e) => updateTheme("layout.headerStyle", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="standard">Standard</option>
                      <option value="fixed">Fixed</option>
                      <option value="sticky">Sticky</option>
                      <option value="glass">Glass</option>
                      <option value="transparent">Transparent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Footer Style</label>
                    <select value={activeTheme.layout.footerStyle}
                      onChange={(e) => updateTheme("layout.footerStyle", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="standard">Standard</option>
                      <option value="minimal">Minimal</option>
                      <option value="expanded">Expanded</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Product Card Layout</label>
                    <select value={activeTheme.layout.productCardLayout}
                      onChange={(e) => updateTheme("layout.productCardLayout", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="standard">Standard</option>
                      <option value="minimal">Minimal</option>
                      <option value="editorial">Editorial</option>
                      <option value="expanded">Expanded</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Header Config */}
            {activeTab === "header" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Header Configuration</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Header Style</label>
                    <select value={activeTheme.header.style}
                      onChange={(e) => updateTheme("header.style", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="standard">Standard</option>
                      <option value="mega">Mega</option>
                      <option value="minimal">Minimal</option>
                      <option value="centered">Centered Logo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Menu Location</label>
                    <select value={activeTheme.header.menuLocation}
                      onChange={(e) => updateTheme("header.menuLocation", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {(["sticky", "transparent", "announcementBar", "searchBar", "cartIcon", "wishlistIcon", "accountIcon"] as const).map((key) => (
                    <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={activeTheme.header[key] as boolean}
                        onChange={(e) => updateTheme(`header.${key}`, e.target.checked)}
                        className="accent-brand-500" />
                      <span className="text-xs text-neutral-600 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Config */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Footer Configuration</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Footer Style</label>
                    <select value={activeTheme.footer.style}
                      onChange={(e) => updateTheme("footer.style", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                      <option value="standard">Standard</option>
                      <option value="minimal">Minimal</option>
                      <option value="expanded">Expanded</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Columns</label>
                    <input type="number" min={1} max={6} value={activeTheme.footer.columns}
                      onChange={(e) => updateTheme("footer.columns", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {(["showNewsletter", "showSocialLinks", "showContact", "showPolicyLinks", "paymentIcons"] as const).map((key) => (
                    <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={activeTheme.footer[key] as boolean}
                        onChange={(e) => updateTheme(`footer.${key}`, e.target.checked)}
                        className="accent-brand-500" />
                      <span className="text-xs text-neutral-600 capitalize">{key.replace(/([A-Z])/g, " $1").replace("show ", "").trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Custom CSS */}
            {activeTab === "css" && (
              <div>
                <h2 className="font-medium text-sm text-neutral-900 mb-4">Custom CSS</h2>
                <textarea
                  rows={20}
                  value={activeTheme.customCSS}
                  onChange={(e) => updateTheme("customCSS", e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="/* Write custom CSS here */"
                />
                <p className="text-xs text-neutral-400 mt-2">Add custom CSS to override theme defaults. Use with caution.</p>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="mt-4 bg-white border border-neutral-200 rounded p-4">
            <h3 className="text-xs font-medium text-neutral-500 mb-3">Live Preview</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Primary</span>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: activeTheme.design.colors.primary }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Accent</span>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: activeTheme.design.colors.accent }} />
              </div>
              <button
                style={{
                  backgroundColor: activeTheme.design.buttons.primaryBg,
                  color: activeTheme.design.buttons.primaryText,
                  borderRadius: activeTheme.design.buttons.primaryRadius,
                  padding: activeTheme.design.buttons.primaryPadding,
                  fontWeight: activeTheme.design.buttons.primaryFontWeight,
                }}
                className="text-sm"
              >
                Primary Button
              </button>
              <button
                style={{
                  backgroundColor: activeTheme.design.buttons.secondaryBg,
                  color: activeTheme.design.buttons.secondaryText,
                  border: `1px solid ${activeTheme.design.buttons.secondaryBorder}`,
                  borderRadius: activeTheme.design.buttons.secondaryRadius,
                  padding: activeTheme.design.buttons.secondaryPadding,
                  fontWeight: activeTheme.design.buttons.secondaryFontWeight,
                }}
                className="text-sm"
              >
                Secondary Button
              </button>
              <p style={{
                fontFamily: activeTheme.design.typography.headingFont,
                fontSize: activeTheme.design.typography.h2Size,
                color: activeTheme.design.colors.text,
              }}>
                Aa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
