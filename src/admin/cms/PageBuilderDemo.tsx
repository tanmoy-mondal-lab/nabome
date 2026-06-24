import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageBuilder } from "./components/PageBuilder";
import { type ContentPage, type PageSection } from "../../cms/core/cms-types";

export function PageBuilderDemo() {
  const { id } = useParams();
  const [sections, setSections] = useState<PageSection[]>([]);

  const page: ContentPage = {
    id: id ?? "demo",
    title: "Page Builder Demo",
    slug: "demo",
    type: "page",
    status: "draft",
    sections,
    seo: {
      metaTitle: "Demo Page",
      metaDescription: "",
      metaImage: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
      robots: "index,follow",
      structuredData: "",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  const handleSave = () => {
    // Demo mode — no backend persistence
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Page Builder</h1>
        <p className="text-sm text-neutral-500 mt-1">Drag and drop to build your page. Add, reorder, and configure sections.</p>
      </div>
      <PageBuilder page={page} sections={sections} onSectionsChange={setSections} onSave={handleSave} />
    </div>
  );
}
