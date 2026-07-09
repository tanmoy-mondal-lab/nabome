interface Question {
    id: string;
    question: string;
    answer?: string;
    author: string;
    createdAt: string;
    upvotes: number;
}
interface ProductQAProps {
    questions: Question[];
    onAskQuestion: (question: string) => void;
    onUpvote: (questionId: string) => void;
    className?: string;
}
export declare function ProductQA({ questions, onAskQuestion, onUpvote, className }: ProductQAProps): import("react").JSX.Element;
export {};
