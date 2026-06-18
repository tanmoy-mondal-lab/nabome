import { useState, useCallback, useRef } from "react";
import { GripVertical, Plus, Eye, EyeOff, Copy, Trash2, Settings } from "lucide-react";
import { sectionRegistry, createSection, duplicateSection } from "../../../cms/core/section-registry";
import { type PageSection, type SectionType, type ContentPage } from "../../../cms/core/cms-types";
import { Modal } from "../../common/Modal";
import { SectionEditor } from "./SectionEditor";

interface PageBuilderProps {
  page: ContentPage;
  sections: PageSection[];
  onSectionsChange: (sections: PageSection[]) => void;
  onSave: () => void;
}

function SectionCard({
  section,
  index,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  section: PageSection;
  index: number;
  onEdit: (s: PageSection) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (s: PageSection) => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const def = sectionRegistry.get(section.type);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragEnd={onDragEnd}
      className={`bg-white border rounded-lg transition-all ${
        isDragging ? "border-brand-500 ring-1 ring-brand-500 opacity-50" : "border-neutral-200"
      } ${!section.visibility?.isVisible ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-neutral-50 rounded-t-lg">
        <div className="cursor-grab text-neutral-400 hover:text-neutral-600 touch-none">
          <GripVertical size={16} />
        </div>
        <span className="text-lg">{def?.icon ?? "📄"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">{def?.name ?? section.type}</p>
          <p className="text-xs text-neutral-400">Section {index + 1}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
            className="p-1.5 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-600"
            title={section.visibility?.isVisible ? "Hide" : "Show"}
          >
            {section.visibility?.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(section); }}
            className="p-1.5 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-600"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(section); }}
            className="p-1.5 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-600"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
            className="p-1.5 hover:bg-red-100 rounded text-neutral-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-neutral-500 truncate">
          {(section.config?.heading as string) || (section.config?.title as string) || "No heading set"}
        </p>
      </div>
    </div>
  );
}

type SectionDef = {
  type: SectionType;
  name: string;
  description: string;
  icon: string;
  category: string;
};

export function PageBuilder({ page, sections, onSectionsChange, onSave }: PageBuilderProps) {
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    onSectionsChange(reordered.map((s, i) => ({ ...s, sortOrder: i })));
    setDragIdx(idx);
  };

  const handleDragEnd = () => setDragIdx(null);

  const handleAddSection = useCallback(
    (type: SectionType) => {
      const newSection = createSection(type, page.id, sections.length);
      onSectionsChange([...sections, newSection]);
      setShowAddMenu(false);
    },
    [sections, page.id, onSectionsChange]
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      onSectionsChange(
        sections.map((s) =>
          s.id === id
            ? { ...s, visibility: { ...s.visibility!, isVisible: !s.visibility?.isVisible } }
            : s
        )
      );
    },
    [sections, onSectionsChange]
  );

  const handleDuplicate = useCallback(
    (section: PageSection) => {
      const dup = duplicateSection(section);
      const idx = sections.findIndex((s) => s.id === section.id);
      const newSections = [...sections];
      newSections.splice(idx + 1, 0, dup);
      onSectionsChange(newSections.map((s, i) => ({ ...s, sortOrder: i })));
    },
    [sections, onSectionsChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onSectionsChange(sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i })));
    },
    [sections, onSectionsChange]
  );

  const handleSectionUpdate = useCallback(
    (updated: PageSection) => {
      onSectionsChange(sections.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSection(null);
    },
    [sections, onSectionsChange]
  );

  const allSections = sectionRegistry.getAll();
  const categories = allSections.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, SectionDef[]>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">{sections.length} section{sections.length !== 1 ? "s" : ""}</span>
        <button onClick={onSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
          Save Page
        </button>
      </div>

      <div className="relative" ref={addMenuRef}>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-brand-500 hover:text-brand-600 transition-colors"
        >
          <Plus size={16} /> Add Section
        </button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            {Object.entries(categories).map(([category, categorySections]) => (
              <div key={category} className="p-2">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{category}</p>
                {categorySections.map((def) => (
                  <button
                    key={def.type}
                    onClick={() => handleAddSection(def.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded transition-colors"
                  >
                    <span className="text-lg">{def.icon}</span>
                    <div className="text-left">
                      <p className="font-medium">{def.name}</p>
                      <p className="text-xs text-neutral-400">{def.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-sm">No sections yet. Click "Add Section" to start building your page.</p>
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              onEdit={setEditingSection}
              onToggleVisibility={handleToggleVisibility}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onDragStart={() => handleDragStart(index)}
              onDragOver={() => handleDragOver(index)}
              onDragEnd={handleDragEnd}
              isDragging={dragIdx === index}
            />
          ))
        )}
      </div>

      <Modal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        title={`Edit ${sectionRegistry.get(editingSection?.type as SectionType)?.name ?? "Section"}`}
        size="xl"
      >
        {editingSection && (
          <SectionEditor section={editingSection} onSave={handleSectionUpdate} onCancel={() => setEditingSection(null)} />
        )}
      </Modal>
    </div>
  );
}
