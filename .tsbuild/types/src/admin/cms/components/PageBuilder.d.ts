import { type PageSection, type ContentPage } from "../../../cms/core/cms-types";
interface PageBuilderProps {
    page: ContentPage;
    sections: PageSection[];
    onSectionsChange: (sections: PageSection[]) => void;
    onSave: () => void;
    saving?: boolean;
}
export declare function PageBuilder({ page, sections, onSectionsChange, onSave, saving }: PageBuilderProps): import("react").JSX.Element;
export {};
