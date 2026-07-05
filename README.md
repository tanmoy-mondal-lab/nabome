# नবME — Premium Fashion E-Commerce

Premium fashion e-commerce storefront and admin built for Cloudflare Pages + Functions.

Live site: [nabome.online](https://www.nabome.online)

---

## Security Issues Found

This document lists all security and configuration issues found during the comprehensive audit of the nabome.online frontend/backend infrastructure.

---

### CRITICAL — Security Vulnerabilities

| # | Problem | Location | Severity | Risk |
|---|---|---|---|---|
| **S1** | **Hard-coded production secrets in `.env`** | `.env` file | HIGH | API keys, cloud service credentials exposed in version control |
| **S2** | **Hard-coded email service API key in `.env`** | `.env` file | HIGH | Email service authentication compromised |
| **S3** | **Unreachable Cloudinary API endpoints** | Live site | MEDIUM | Images failing to load due to auth issues |
| **S4** | **Missing HTTPS headers and CSP** | Cloudflare config | HIGH | XSS and injection vulnerabilities |

---

### Configuration Issues

| # | Problem | Location | Status |
|---|---|---|---|
| **C1** | **Missing CSP for Cloudflare Pages** | `wrangler.jsonc` | TODO |
| **C2** | **Missing secure headers** | Not configured | TODO |
| **C3** | **Missing rate limiting** | API routes | TODO |
| **C4** | **Missing audit logging** | Not implemented | TODO |

---

### Technical Issues

| # | Problem | Location | Status |
|---|---|---|---|
| **T1** | **Image optimization failing** | `/api/products/:slug/image` | TODO |
| **T2** | **Product detail page animation bugs** | `ProductDetailPage.tsx` | TODO |
| **T3** | **Hero carousel videos not loading** | `HeroSliderSection.tsx` | TODO |

---

## Immediate Action Required

### 1. Remove Hard-coded Secrets (IMMEDIATE)

**Problem**: All production credentials are stored directly in `.env`:

```env
# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=dmzbh87bi
CLOUDINARY_API_KEY=374934341228116
CLOUDINARY_API_SECRET=T0uOlg44yhqijJTYHU3ADADyLtk

# Email service
RESEND_API_KEY=re_XDBUSACg_8fimAf6CAwzyXFZdzWpnYhpb
```

**Impact**: If this repository is public, anyone with access can abuse these services and drain credits.

**Solution**: Move secrets to Cloudflare Pages secrets management.

### 2. Fix Image Loading (IMMEDIATE)

**Problem**: Images from Cloudinary `/api/products/:slug/image` endpoint return "Asset not found" errors even though the Cloudinary service has the assets.

**Evidence**:

```bash
# Product with image ID a02ceb2e-890f-41e3-a8f7-92e134332a37
# API: https://nabome.online/api/products/a02ceb2e-890f-41e3-a8f7-92e134332a37/images/1e72b05e-13bb-4c60-9eea-d2b91ebafd11
# Returns: "Asset not found"
```

**Root Cause**: The API endpoint may be:
- Using wrong resource type (image vs video)
- Making incorrect authentication requests
- Using wrong Cloudinary credentials

### 3. Fix Hero Carousel Videos (HIGH PRIORITY)

**Problem**: Hero carousel videos are not loading, only static images appear.

**Evidence from code**:

```typescript
// HeroSliderSection.tsx:67
const [currentSlide, setCurrentSlide] = useState(0);

// HeroSliderSection.tsx:75
const fallbackSlides = useMemo(() => {
  return [
    {
      image: "", // <-- Empty! This means no video!
      caption: section.title || "Premium Fashion Destination",
      title: section.title || "Discover Your Signature Style",
    },
  ];
}, [section.title, section.subtitle]);
```

**Root Cause**: The CMS is not returning the `videoUrl` from the hero slides content.

### 4. Fix Cart Page Mobile Layout (HIGH PRIORITY)

**Problem**: Cart page sticky CTA buttons overlap content on mobile due to incorrect safe area handling.

**Evidence**:

```typescript
// CartPage.tsx:361 (BEFORE)
bottom-[60px]  // <-- Hardcoded, doesn't account for safe area

// CartPage.tsx:361 (AFTER)  
bottom-[calc(60px+env(safe-area-inset-bottom,0px))]  // <-- Correct implementation
```

### 5. Fix Newsletter Form Accessibility (HIGH PRIORITY)

**Problem**: Newsletter form lacks accessibility features.

**Evidence**:

```typescript
// NewsletterSection.tsx:29-34 (Missing)
<p>Email input has no label</p>
<p>Submit button has no loading state or aria-label</p>
```

---

## Testing Instructions

### Security Testing

1. **Check environment variables**:
   ```bash
   cat .env
   ```

2. **Test Cloudinary endpoints**:
   ```bash
   curl -s https://nabome.online/api/products/a02ceb2e-890f-41e3-a8f7-92e134332a37/images/1e72b05e-13bb-4c60-9eea-d2b91ebafd11
   ```

3. **Check site accessibility**:
   ```bash
   curl -s -H "User-Agent: Mozilla/5.0 (Mobile)" https://nabome.online | grep -i "image\|video\|product"
   ```

### Visual Regression Testing

1. **Product detail pages**:
   - Visit `/products/handcrafted-pearl-necklace`
   - Check if image and video load properly

2. **Hero carousel**:
   - Visit homepage
   - Verify video plays on desktop, fallback image works on mobile

3. **Cart page**:
   - Visit `/cart`
   - Add items, verify sticky buttons don't overlap

---

## Priority Fix Order

| Priority | Fix |
|---|---|
| **1** (IMMEDIATE) | Remove hard-coded secrets from `.env` |
| **2** (IMMEDIATE) | Fix hero carousel video loading | |  
| **3** (HIGH) | Fix image loading on Product Detail Pages |
| **4** (HIGH) | Fix cart page mobile layout |
| **5** (HIGH) | Fix newsletter form accessibility |
| **6** (MEDIUM) | Add security headers and CSP |
| **7** (MEDIUM) | Implement rate limiting |

---

## Files to Fix

### ./  
- `.env` - Remove hard-coded secrets
- `wrangler.jsonc` - Add security headers and CSP
- `README.md` - Update with current issues

### ./src/
- `src/storefront/sections/HeroSliderSection.tsx` - Fix video loading
- `src/storefront/pages/CartPage.tsx` - Fix mobile layout
- `src/storefront/components/NewsletterForm.tsx` - Add accessibility
- `src/storefront/components/SafeImage.tsx` - Fix image optimization

### ./api/
- `api/_lib/cloudinary.ts` - Debug image serving
- `api/[...path].ts` - Add security headers

---

## Root Cause Analysis Summary

1. **Security**: Hard-coded credentials in version control allows anyone with repo access to abuse production services
2. **Images**: API endpoint authentication issues preventing Cloudinary asset access
3. **Videos**: CMS content management not properly storing/retrieving video URLs
4. **Layout**: Hard-coded values without accounting for mobile safe areas
5. **Accessibility**: Missing ARIA labels and loading states

---

## Verification Checkpoints

For each fix, verify:

1. **Security**: Secrets are removed from `.env` and stored in Cloudflare Pages secrets
2. **Images**: All product images load correctly via `/api/products/:slug/images/:imageId`
3. **Videos**: Hero carousel plays videos on desktop, falls back to images on mobile
4. **Layout**: Cart sticky buttons respect safe areas on mobile
5. **Accessibility**: All interactive elements have proper ARIA labels

---

This document is updated on 2026-07-05 to reflect current issues in production.