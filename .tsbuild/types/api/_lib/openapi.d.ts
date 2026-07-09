export interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
        contact?: {
            name: string;
            email: string;
        };
    };
    servers: Array<{
        url: string;
        description: string;
    }>;
    paths: Record<string, any>;
    components: {
        schemas: Record<string, any>;
        securitySchemes: Record<string, any>;
    };
    security: Array<Record<string, string[]>>;
    tags: Array<{
        name: string;
        description: string;
    }>;
}
export declare function generateOpenAPISpec(): OpenAPISpec;
export declare function exportOpenAPISpec(spec: OpenAPISpec): string;
