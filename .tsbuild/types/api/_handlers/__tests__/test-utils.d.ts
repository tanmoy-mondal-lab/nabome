export declare function createMockPrisma(): {
    product: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        count: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        update: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    productVariant: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        update: import("vitest").Mock<import("@vitest/spy").Procedure>;
        deleteMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    productImage: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        deleteMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
        updateMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    address: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        update: import("vitest").Mock<import("@vitest/spy").Procedure>;
        updateMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    wishlistItem: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    review: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    coupon: {
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    couponRedemption: {
        count: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    relatedProduct: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    order: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findFirst: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        count: import("vitest").Mock<import("@vitest/spy").Procedure>;
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        update: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    orderItem: {
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    orderStatusHistory: {
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    cart: {
        findUnique: import("vitest").Mock<import("@vitest/spy").Procedure>;
        delete: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    userActionLog: {
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    notification: {
        create: import("vitest").Mock<import("@vitest/spy").Procedure>;
        findMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
        count: import("vitest").Mock<import("@vitest/spy").Procedure>;
        update: import("vitest").Mock<import("@vitest/spy").Procedure>;
        updateMany: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
    $transaction: import("vitest").Mock<(operations: Promise<unknown>[]) => Promise<unknown[]>>;
};
export declare function makeRequest(method: string, url: string, body?: unknown): Request;
export declare function makeContext(userId?: string, env?: any): {
    userId: string | undefined;
    userRole: string | undefined;
    env: any;
};
export declare function parseResponse(res: Response): Promise<any>;
