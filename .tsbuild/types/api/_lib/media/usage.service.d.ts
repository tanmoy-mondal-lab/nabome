import type { PrismaClient } from "@prisma/client";
export interface UsageReference {
    type: string;
    id: string;
    name: string;
}
/**
 * Returns the list of entities currently referencing the given Cloudinary public_id.
 * Returns an empty array when the asset is not in use.
 */
export declare function getAssetReferences(prisma: PrismaClient, publicId: string | null | undefined): Promise<UsageReference[]>;
export declare function isAssetInUse(prisma: PrismaClient, publicId: string | null | undefined): Promise<boolean>;
