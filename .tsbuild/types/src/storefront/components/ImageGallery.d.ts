interface ImageItem {
    url: string;
    altText?: string;
    type?: "image" | "video";
}
interface ImageGalleryProps {
    images: ImageItem[];
    className?: string;
}
export declare function ImageGallery({ images, className }: ImageGalleryProps): import("react").JSX.Element;
export {};
