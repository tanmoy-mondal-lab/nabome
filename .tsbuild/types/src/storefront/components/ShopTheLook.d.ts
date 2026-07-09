interface Hotspot {
    x: number;
    y: number;
    product: Record<string, unknown>;
}
interface ShopTheLookProps {
    image: string;
    hotspots: Hotspot[];
    title?: string;
}
export declare function ShopTheLook({ image, hotspots, title }: ShopTheLookProps): import("react").JSX.Element;
export {};
