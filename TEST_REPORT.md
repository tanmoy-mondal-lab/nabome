# Test Report - Sprint 2 Authentication & Security
**Phase 13: P0 Critical Issues Fix Plan**
**Date**: 2026-07-07
**Sprint**: Week 3 - Authentication & Authorization

---

## Test Summary

This document outlines the test cases and validation procedures for Sprint 2 security implementations. All implementations should be thoroughly tested before production deployment.

### Test Coverage
- **Unit Tests**: Required for new utility functions
- **Integration Tests**: Required for middleware integration
- **Security Tests**: Required for vulnerability validation
- **E2E Tests**: Required for user flow validation

---

## NAB-P0-002: File Upload Input Sanitization

### Unit Tests

#### Test: Magic Bytes Validation
**File**: `api/_handlers/__tests__/upload.test.ts`

```typescript
describe('validateMagicBytes', () => {
  it('should validate JPEG magic bytes', async () => {
    const jpegFile = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' });
    // Mock ArrayBuffer to return JPEG magic bytes
    const result = await validateMagicBytes(jpegFile, [0xFF, 0xD8, 0xFF]);
    expect(result).toBe(true);
  });

  it('should reject invalid magic bytes', async () => {
    const jpegFile = new File(['fake content'], 'test.jpg', { type: 'image/jpeg' });
    // Mock ArrayBuffer to return wrong bytes
    const result = await validateMagicBytes(jpegFile, [0xFF, 0xD8, 0xFF]);
    expect(result).toBe(false);
  });
});
```

#### Test: Filename Sanitization
**File**: `api/_handlers/__tests__/upload.test.ts`

```typescript
describe('sanitizeFilename', () => {
  it('should remove path traversal attempts', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etc_passwd');
  });

  it('should remove double extensions', () => {
    expect(sanitizeFilename('photo.jpeg.jpg')).toBe('photo.jpeg');
  });

  it('should limit filename length', () => {
    const longName = 'a'.repeat(150) + '.jpg';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('file@#$%^&*().jpg')).toBe('file______.jpg');
  });
});
```

### Integration Tests

#### Test: File Upload with Valid File
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@valid_image.jpg" \
  -F "folder=test"

# Expected: 200 OK with asset details
```

#### Test: File Upload with Invalid Magic Bytes
```bash
# Create a file with .jpg extension but PNG content
echo "PNG magic bytes" > fake.jpg

curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@fake.jpg" \
  -F "folder=test"

# Expected: 400 Bad Request - "File content does not match declared type"
```

#### Test: File Upload with Path Traversal
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@image.jpg;filename=../../../etc/passwd" \
  -F "folder=test"

# Expected: 400 Bad Request or sanitized filename
```

#### Test: File Upload Exceeding Size Limit
```bash
# Create a 6MB file
dd if=/dev/zero of=large.jpg bs=1M count=6

curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@large.jpg" \
  -F "folder=test"

# Expected: 400 Bad Request - "File too large. Maximum size is 5MB"
```

### Security Tests

#### Test: File Type Spoofing
```python
# Python script to test file type spoofing
import requests

# Create a malicious executable with JPEG extension
with open('malicious.exe', 'wb') as f:
    f.write(b'MZ')  # PE header

# Rename to .jpg
import os
os.rename('malicious.exe', 'malicious.jpg')

# Attempt upload
response = requests.post(
    'http://localhost:3000/api/upload',
    files={'file': open('malicious.jpg', 'rb')},
    data={'folder': 'test'},
    headers={'Authorization': 'Bearer <admin_token>'}
)

# Expected: 400 Bad Request - magic bytes validation fails
assert response.status_code == 400
```

---

## NAB-P0-004: CSRF Protection

### Unit Tests

#### Test: CSRF Token Generation
**File**: `api/_lib/__tests__/csrf.test.ts`

```typescript
describe('generateToken', () => {
  it('should generate 32-character token', () => {
    const token = generateToken();
    expect(token.length).toBe(32);
  });

  it('should generate different tokens on each call', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });
});
```

#### Test: CSRF Validation
**File**: `api/_lib/__tests__/csrf.test.ts`

```typescript
describe('validateCsrf', () => {
  it('should skip validation for GET requests', () => {
    const req = new Request('http://localhost:3000/api/test', { method: 'GET' });
    expect(validateCsrf(req)).toBe(true);
  });

  it('should validate CSRF token for POST requests', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Cookie': 'csrf_token=test123',
        'X-CSRF-Token': 'test123'
      }
    });
    expect(validateCsrf(req)).toBe(true);
  });

  it('should reject mismatched CSRF tokens', () => {
    const req = new Request('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Cookie': 'csrf_token=test123',
        'X-CSRF-Token': 'wrong456'
      }
    });
    expect(validateCsrf(req)).toBe(false);
  });
});
```

### Integration Tests

#### Test: CSRF Token on GET Request
```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer <token>" \
  -i

# Expected: Set-Cookie header with csrf_token
# Expected: X-CSRF-Token header with token value
```

#### Test: CSRF Validation on POST Request
```bash
# Without CSRF token
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"variantId": "123", "quantity": 1}'

# Expected: 403 Forbidden - "Invalid or missing CSRF token"

# With CSRF token
CSRF_TOKEN="extracted_from_get_request"
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Cookie: csrf_token=$CSRF_TOKEN" \
  -d '{"variantId": "123", "quantity": 1}'

# Expected: 200 OK
```

### Security Tests

#### Test: CSRF Attack Simulation
```html
<!-- Malicious site attempting CSRF -->
<html>
<body>
  <form action="https://nabome.com/api/cart/add" method="POST">
    <input type="hidden" name="variantId" value="123">
    <input type="hidden" name="quantity" value="999">
    <input type="submit" value="Click me!">
  </form>
</body>
</html>

# Expected: Request blocked by CSRF validation
```

---

## NAB-P0-009: Email Verification Enforcement

### Unit Tests

#### Test: Email Verification Check
**File**: `api/_lib/__tests__/auth-middleware.test.ts`

```typescript
describe('authenticate with email verification', () => {
  it('should allow verified users', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer <verified_user_token>' }
    });
    const result = await authenticate(req, { 
      required: true, 
      requireEmailVerified: true 
    }, env);
    
    expect(result).not.toBeInstanceOf(Response);
  });

  it('should block unverified users', async () => {
    const req = new Request('http://localhost:3000/api/test', {
      headers: { 'Authorization': 'Bearer <unverified_user_token>' }
    });
    const result = await authenticate(req, { 
      required: true, 
      requireEmailVerified: true 
    }, env);
    
    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });
});
```

### Integration Tests

#### Test: Cart Access Without Email Verification
```bash
# Register new user (unverified)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!", "firstName": "Test"}'

# Login (should work even if unverified)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}'

# Try to access cart (should be blocked)
TOKEN="<from_login_response>"
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"

# Expected: 401 Unauthorized - "Please verify your email address"
```

#### Test: Cart Access With Email Verification
```bash
# Verify email
curl -X POST http://localhost:3000/api/auth/verifyEmail \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "<verification_code>"}'

# Try to access cart (should work)
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with cart data
```

#### Test: Checkout Without Email Verification
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer <unverified_token>" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "cod", "items": [...]}'

# Expected: 401 Unauthorized - "Please verify your email address"
```

### E2E Tests

#### Test: Complete Registration Flow
```typescript
// Playwright E2E test
test('complete registration with email verification', async ({ page }) => {
  // Navigate to registration
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.fill('[name="firstName"]', 'Test');
  await page.click('button[type="submit"]');
  
  // Should show verification message
  await expect(page.locator('text=verify your email')).toBeVisible();
  
  // Try to access cart (should redirect to verification)
  await page.goto('/cart');
  await expect(page.locator('text=verify your email')).toBeVisible();
  
  // Verify email (mock email service)
  // ... verification logic
  
  // Access cart (should work)
  await page.goto('/cart');
  await expect(page.locator('.cart-items')).toBeVisible();
});
```

---

## NAB-P0-011: Session Timeout Mechanism

### Unit Tests

#### Test: Idle Timeout Calculation
**File**: `api/_lib/__tests__/auth-middleware.test.ts`

```typescript
describe('resolveActiveSession with idle timeout', () => {
  it('should revoke session after 2 hours of inactivity', async () => {
    const oldSession = await prisma.authSession.create({
      data: {
        profileId: 'user-id',
        accessToken: 'token-hash',
        refreshToken: 'refresh-hash',
        lastActiveAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });
    
    const result = await resolveActiveSession('token', 'user-id', env);
    expect(result).toBeNull();
    
    // Verify session was revoked
    const updatedSession = await prisma.authSession.findUnique({
      where: { id: oldSession.id }
    });
    expect(updatedSession?.isActive).toBe(false);
  });

  it('should update lastActiveAt on active session', async () => {
    const session = await prisma.authSession.create({
      data: {
        profileId: 'user-id',
        accessToken: 'token-hash',
        refreshToken: 'refresh-hash',
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });
    
    const result = await resolveActiveSession('token', 'user-id', env);
    expect(result).not.toBeNull();
    
    // Verify lastActiveAt was updated
    const updatedSession = await prisma.authSession.findUnique({
      where: { id: session.id }
    });
    expect(updatedSession?.lastActiveAt.getTime()).toBeGreaterThan(
      session.lastActiveAt.getTime()
    );
  });
});
```

### Integration Tests

#### Test: Session Timeout After Inactivity
```bash
# Login and get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}' \
  | jq -r '.data.session.accessToken')

# Make authenticated request (should work)
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK

# Wait 2 hours (or manually update lastActiveAt in database)
# Simulate by updating database:
# UPDATE auth_sessions SET last_active_at = NOW() - INTERVAL '3 hours' WHERE access_token = '<hash>';

# Try authenticated request again
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer $TOKEN"

# Expected: 401 Unauthorized - "Session expired — please log in again"
```

#### Test: Session Refresh Before Timeout
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}' \
  | jq -r '.data.session.accessToken')

# Make request every 30 minutes (should keep session alive)
for i in {1..5}; do
  curl -X GET http://localhost:3000/api/me \
    -H "Authorization: Bearer $TOKEN"
  sleep 30m
done

# Expected: All requests succeed (session stays active)
```

### E2E Tests

#### Test: Session Timeout UX
```typescript
test('session timeout redirects to login', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  // Navigate to protected page
  await page.goto('/account');
  await expect(page.locator('.account-dashboard')).toBeVisible();
  
  // Simulate 2-hour inactivity (manually update session in DB)
  // Or wait 2 hours
  
  // Try to navigate to another protected page
  await page.goto('/cart');
  
  // Should redirect to login with timeout message
  await expect(page).toHaveURL('/login');
  await expect(page.locator('text=Session expired')).toBeVisible();
});
```

---

## NAB-P0-012: IP-Based Blocking for Failed Login Attempts

### Unit Tests

#### Test: IP Blocking Logic
**File**: `api/_handlers/__tests__/auth.test.ts`

```typescript
describe('handleLogin with IP blocking', () => {
  it('should block IP after 5 failed attempts', async () => {
    const ip = '192.168.1.100';
    
    // Create 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await prisma.loginAttempt.create({
        data: {
          ipAddress: ip,
          email: 'test@example.com',
          success: false,
          failReason: 'invalid_credentials',
          createdAt: new Date(),
        }
      });
    }
    
    // Attempt login from blocked IP
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'X-Forwarded-For': ip,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
    });
    
    const response = await handleLogin(req, mockContext);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.message).toContain('Too many failed login attempts');
  });

  it('should allow whitelisted IPs', async () => {
    process.env.IP_WHITELIST = '192.168.1.100';
    
    // Create 5 failed attempts
    const ip = '192.168.1.100';
    for (let i = 0; i < 5; i++) {
      await prisma.loginAttempt.create({
        data: {
          ipAddress: ip,
          email: 'test@example.com',
          success: false,
          failReason: 'invalid_credentials',
          createdAt: new Date(),
        }
      });
    }
    
    // Attempt login from whitelisted IP
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'X-Forwarded-For': ip,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'correct',
      }),
    });
    
    const response = await handleLogin(req, mockContext);
    // Should not be blocked by IP (may fail for other reasons)
    expect(response.status).not.toBe(401);
    expect(response.status).not.toContain('Too many failed login attempts');
  });
});
```

### Integration Tests

#### Test: IP Blocking After Failed Attempts
```bash
# Attempt 5 failed logins from same IP
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done

# 6th attempt should be blocked
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"email": "test@example.com", "password": "correct"}'

# Expected: 401 Unauthorized - "Too many failed login attempts. Please try again in 15 minutes."
```

#### Test: IP Block Expiration
```bash
# Create 5 failed attempts
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done

# Wait 15 minutes (or manually update createdAt in database)
# Simulate by updating database:
# UPDATE login_attempts SET created_at = NOW() - INTERVAL '16 minutes' WHERE ip_address = '192.168.1.100';

# Try login again (should work)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"email": "test@example.com", "password": "correct"}'

# Expected: 200 OK (if credentials are correct)
```

#### Test: IP Whitelist
```bash
# Set IP whitelist
export IP_WHITELIST="192.168.1.100"

# Create 5 failed attempts from whitelisted IP
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done

# Try login from whitelisted IP (should not be blocked)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"email": "test@example.com", "password": "correct"}'

# Expected: 200 OK (if credentials are correct) - IP blocking bypassed
```

### Security Tests

#### Test: Brute Force Attack Simulation
```python
# Python script to simulate brute force attack
import requests
import time

ip = "192.168.1.100"
headers = {
    "Content-Type": "application/json",
    "X-Forwarded-For": ip
}

# Attempt 10 logins with different passwords
for i in range(10):
    response = requests.post(
        'http://localhost:3000/api/auth/login',
        json={
            'email': 'test@example.com',
            'password': f'password{i}'
        },
        headers=headers
    )
    print(f"Attempt {i+1}: {response.status_code}")
    if response.status_code == 401 and 'Too many failed' in response.text:
        print("IP blocked after 5 attempts - SUCCESS")
        break
    time.sleep(0.1)

# Expected: IP blocked after 5 attempts
```

---

## Test Execution Plan

### Prerequisites
1. Database with test data
2. Supabase test project
3. Cloudinary test account
4. Environment variables configured

### Test Environment Setup
```bash
# Install dependencies
npm install

# Set up test database
npm run prisma:generate
npm run db:seed

# Run tests
npm run test
npm run test:e2e
```

### Test Execution Order
1. **Unit Tests** (fast, isolated)
   - `npm run test` - Run all unit tests
   - Target: 100% coverage for new functions

2. **Integration Tests** (medium speed)
   - Test API endpoints with mock data
   - Target: 90% coverage for modified endpoints

3. **Security Tests** (slow, requires setup)
   - Run manual security test scripts
   - Target: All security scenarios validated

4. **E2E Tests** (slow, full system)
   - `npm run test:e2e` - Run Playwright tests
   - Target: Critical user flows validated

### Test Data Cleanup
```bash
# Clean up test data after tests
npm run db:cleanup
```

---

## Test Results Template

### NAB-P0-002: File Upload Sanitization
| Test Case | Status | Notes |
|-----------|--------|-------|
| Magic bytes validation - JPEG | ⬜ | |
| Magic bytes validation - PNG | ⬜ | |
| Magic bytes validation - PDF | ⬜ | |
| Filename sanitization - path traversal | ⬜ | |
| Filename sanitization - double extensions | ⬜ | |
| File size limit enforcement | ⬜ | |
| File type spoofing prevention | ⬜ | |

### NAB-P0-004: CSRF Protection
| Test Case | Status | Notes |
|-----------|--------|-------|
| CSRF token generation | ⬜ | |
| CSRF validation - GET skip | ⬜ | |
| CSRF validation - POST with token | ⬜ | |
| CSRF validation - POST without token | ⬜ | |
| CSRF validation - token mismatch | ⬜ | |
| CSRF attack simulation | ⬜ | |

### NAB-P0-009: Email Verification
| Test Case | Status | Notes |
|-----------|--------|-------|
| Unverified user - cart access blocked | ⬜ | |
| Verified user - cart access allowed | ⬜ | |
| Unverified user - checkout blocked | ⬜ | |
| Verified user - checkout allowed | ⬜ | |
| Complete registration flow | ⬜ | |

### NAB-P0-011: Session Timeout
| Test Case | Status | Notes |
|-----------|--------|-------|
| Session revocation after 2h inactivity | ⬜ | |
| lastActiveAt update on activity | ⬜ | |
| Session refresh before timeout | ⬜ | |
| Session timeout UX - redirect to login | ⬜ | |

### NAB-P0-012: IP Blocking
| Test Case | Status | Notes |
|-----------|--------|-------|
| IP block after 5 failed attempts | ⬜ | |
| IP block expiration after 15min | ⬜ | |
| IP whitelist bypass | ⬜ | |
| Brute force attack simulation | ⬜ | |

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Sprint 2 Security Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run typecheck

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run prisma:generate
      - run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security tests
        run: |
          # Run custom security test scripts
          npm run test:security
```

---

## Sign-Off Criteria

### Before Production Deployment
- [ ] All unit tests passing (100% coverage)
- [ ] All integration tests passing (90% coverage)
- [ ] All security tests validated
- [ ] All E2E tests passing for critical flows
- [ ] Manual penetration testing completed
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Rollback plan documented

### Post-Deployment Monitoring
- [ ] Monitor failed login attempts
- [ ] Monitor IP blocks
- [ ] Monitor file upload rejections
- [ ] Monitor CSRF validation failures
- [ ] Monitor session timeouts
- [ ] Monitor email verification rates

---

## Conclusion

All test cases outlined in this report should be executed and validated before deploying Sprint 2 to production. The test suite covers unit, integration, security, and E2E testing to ensure comprehensive validation of all security enhancements.

**Test Status**: ⬜ PENDING
**Deployment Ready**: ⬜ NO (awaiting test completion)
