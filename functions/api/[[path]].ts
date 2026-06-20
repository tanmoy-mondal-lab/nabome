import { GET, POST, PUT, DELETE, PATCH, OPTIONS } from "../../api/[...path]";

export const onRequestGet = ({ request }: { request: Request }) => GET(request);
export const onRequestPost = ({ request }: { request: Request }) => POST(request);
export const onRequestPut = ({ request }: { request: Request }) => PUT(request);
export const onRequestDelete = ({ request }: { request: Request }) => DELETE(request);
export const onRequestPatch = ({ request }: { request: Request }) => PATCH(request);
export const onRequestOptions = ({ request }: { request: Request }) => OPTIONS(request);
