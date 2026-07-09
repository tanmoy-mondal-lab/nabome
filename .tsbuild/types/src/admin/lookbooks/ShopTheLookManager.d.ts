import { type ShopTheLook } from "../../cms/core/cms-types";
interface ShopTheLookManagerProps {
    lookId: string;
    onSave: (data: ShopTheLook) => void;
    onClose: () => void;
}
export default function ShopTheLookManager({ lookId, onSave, onClose }: ShopTheLookManagerProps): import("react").JSX.Element;
export {};
