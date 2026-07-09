import { type PageSection } from "../../../cms/core/cms-types";
interface SectionEditorProps {
    section: PageSection;
    onSave: (section: PageSection) => void;
    onCancel: () => void;
}
export declare function SectionEditor({ section, onSave, onCancel }: SectionEditorProps): import("react").JSX.Element;
export {};
