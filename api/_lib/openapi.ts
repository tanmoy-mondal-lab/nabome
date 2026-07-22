// ─────────────────────────────────────────────────────────────
// OpenAPI Documentation Generator
// ─────────────────────────────────────────────────────────────
// Generates OpenAPI 3.0 specification for all API endpoints
// ─────────────────────────────────────────────────────────────

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
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
  security: Array<Record<string, string[]>>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export function generateOpenAPISpec(): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: "3.0.3",
    info: {
      title: "NABOME API",
      version: "1.0.0",
      description: "NABOME E-commerce Platform API",
      contact: {
        name: "NABOME Support",
        email: "support@nabome.online",
      },
    },
    servers: [
      {
        url: "https://nabome.online/api/v1",
        description: "Production server",
      },
      {
        url: "http://localhost:8788/api/v1",
        description: "Development server",
      },
    ],
    paths: {},
    components: {
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {},
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                status: { type: "integer" },
              },
            },
            details: {},
            requestId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string" },
                status: { type: "integer", example: 400 },
              },
            },
            details: {
              type: "object",
              properties: {
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
            requestId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token authentication",
        },
        csrfToken: {
          type: "apiKey",
          in: "header",
          name: "X-CSRF-Token",
          description: "CSRF token for state-changing operations",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Authentication", description: "User authentication and session management" },
      { name: "Products", description: "Product catalog and search" },
      { name: "Categories", description: "Product categories" },
      { name: "Collections", description: "Product collections" },
      { name: "Cart", description: "Shopping cart management" },
      { name: "Checkout", description: "Order checkout and payment" },
      { name: "Orders", description: "Order management" },
      { name: "Addresses", description: "Customer addresses" },
      { name: "Wishlist", description: "User wishlist" },
      { name: "Reviews", description: "Product reviews" },
      { name: "CMS", description: "Content management system" },
      { name: "Admin", description: "Admin operations" },
      { name: "Health", description: "Health check endpoints" },
    ],
  };

  // Add common error responses
  const errorResponses = {
    "400": {
      description: "Bad Request - Validation error or invalid input",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
        },
      },
    },
    "401": {
      description: "Unauthorized - Authentication required",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
    "403": {
      description: "Forbidden - Insufficient permissions",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
    "404": {
      description: "Not Found - Resource not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
    "409": {
      description: "Conflict - Resource already exists",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
    "429": {
      description: "Too Many Requests - Rate limit exceeded",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
    "500": {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    },
  };

  // Health check endpoint
  spec.paths["/health"] = {
    get: {
      tags: ["Health"],
      summary: "Health check endpoint",
      description: "Returns the health status of the API",
      responses: {
        "200": {
          description: "API is healthy",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
              example: {
                success: true,
                data: { status: "healthy", timestamp: "2024-01-01T00:00:00Z" },
                timestamp: "2024-01-01T00:00:00Z",
              },
            },
          },
        },
      },
    },
  };

  // Authentication endpoints
  spec.paths["/auth/register"] = {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Creates a new user account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "firstName"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                firstName: { type: "string", minLength: 1 },
                lastName: { type: "string" },
                phone: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  spec.paths["/auth/login"] = {
    post: {
      tags: ["Authentication"],
      summary: "User login",
      description: "Authenticate a user and return JWT tokens",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  spec.paths["/auth/logout"] = {
    post: {
      tags: ["Authentication"],
      summary: "User logout",
      description: "Logout the current user",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  // Products endpoints
  spec.paths["/products"] = {
    get: {
      tags: ["Products"],
      summary: "List products",
      description: "Get a paginated list of products",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          description: "Items per page",
          schema: { type: "integer", default: 20 },
        },
        {
          name: "category",
          in: "query",
          description: "Filter by category slug",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  spec.paths["/products/{slug}"] = {
    get: {
      tags: ["Products"],
      summary: "Get product by slug",
      description: "Get detailed information about a specific product",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          description: "Product slug",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  // Cart endpoints
  spec.paths["/cart"] = {
    get: {
      tags: ["Cart"],
      summary: "Get user cart",
      description: "Retrieve the current user's shopping cart",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Cart retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  spec.paths["/cart/sync"] = {
    post: {
      tags: ["Cart"],
      summary: "Sync cart",
      description: "Sync local cart with server",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      variantId: { type: "string" },
                      quantity: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Cart synced successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        ...errorResponses,
      },
    },
  };

  return spec;
}

export function exportOpenAPISpec(spec: OpenAPISpec): string {
  return JSON.stringify(spec, null, 2);
}
