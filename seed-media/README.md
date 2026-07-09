# Seed Media Directory

This directory contains local media files used for seeding the development database.

## Structure

Each subdirectory corresponds to an entity type in the NABOME application:

- `products/` - Product images
- `brands/` - Brand logos
- `categories/` - Category images
- `collections/` - Collection hero images
- `homepage/` - Homepage section images
- `settings/` - Site settings images (logo, favicon, etc.)
- `sellers/` - Seller profile images
- `blogs/` - Blog post images
- `cms/` - CMS content images
- `lookbooks/` - Lookbook images
- `users/` - User avatar images

## Usage

These files are uploaded to Cloudinary during the seed process using the centralized MediaService.

## Note

For development purposes, placeholder images can be used. In production, actual media assets should be placed here.
