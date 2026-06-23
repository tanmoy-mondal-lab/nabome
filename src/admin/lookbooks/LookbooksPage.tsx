import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Edit3, Trash2, Plus, BookOpen } from "lucide-react";

interface LookbookItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder: number;
}

interface Lookbook {
  id: string;
  title: string;
  slug: string;
  description?: string;
  story?: string;
  season?: string;
  year?: number;
  featuredImage?: string;
  layout?: string;
  status: string;
  tags?: string[];
  items?: LookbookItem[];
  createdAt: string;
  updatedAt: string;
}

export default function LookbooksPage() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLookbooks();
      setLookbooks((res.lookbooks as Lookbook[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteLookbook(id);
      fetch();
    } catch { /* ignore */ }
  };

  const columns = [
    {
      key: "title", label: "Lookbook", sortable: true,
      render: (l: Lookbook) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
            {l.featuredImage ? (
              <img src={l.featuredImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={16} className="text-neutral-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{l.title}</p>
            <p className="text-xs text-neutral-400">{l.season} {l.year}</p>
          </div>
        </div>
      ),
    },
    { key: "slug", label: "Slug", render: (l: Lookbook) => <span className="text-sm text-neutral-500">/{l.slug}</span> },
    {
      key: "status", label: "Status",
      render: (l: Lookbook) => <StatusBadge status={l.status} />,
    },
    {
      key: "items", label: "Items",
      render: (l: Lookbook) => <span className="text-sm text-neutral-500">{l.items?.length ?? 0}</span>,
    },
    {
      key: "updatedAt", label: "Updated", sortable: true,
      render: (l: Lookbook) => (
        <span className="text-sm text-neutral-500">
          {new Date(l.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Lookbooks</h1>
          <p className="text-sm text-neutral-500 mt-1">Create fashion stories, seasonal collections, and editorial pages</p>
        </div>
        <button
          onClick={() => navigate("/admin/lookbooks/new")}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800"
        >
          <Plus size={16} /> Create Lookbook
        </button>
      </div>

      <DataTable
        columns={columns}
        data={lookbooks}
        isLoading={loading}
        onRowClick={(l) => navigate(`/admin/lookbooks/${l.id}/edit`)}
        searchPlaceholder="Search lookbooks…"
        actions={(l) => (
          <div className="flex justify-end gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/lookbooks/${l.id}/edit`); }}
              className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }}
              className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
        emptyMessage="No lookbooks yet. Create your first fashion story."
      />
    </div>
  );
}
