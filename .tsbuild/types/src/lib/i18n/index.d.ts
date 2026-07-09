import i18n from "i18next";
export declare const SUPPORTED_LANGUAGES: readonly [{
    readonly code: "en";
    readonly name: "English";
    readonly nativeName: "English";
}, {
    readonly code: "bn";
    readonly name: "Bengali";
    readonly nativeName: "বাংলা";
}, {
    readonly code: "hi";
    readonly name: "Hindi";
    readonly nativeName: "हिन्दी";
}];
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export default i18n;
