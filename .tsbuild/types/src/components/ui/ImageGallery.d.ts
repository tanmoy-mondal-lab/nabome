interface Image {
    id: string;
    url: string;
    alt: string;
}
interface ImageGalleryProps {
    images: Image[];
    className?: string;
}
export declare function ImageGallery({ images, className }: ImageGalleryProps): import("react").JSX.Element;
export {};
