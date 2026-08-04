# নবME (Nabome) — Security, Privacy & Compliance Architecture

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for security, privacy, and compliance across the entire Nabome platform
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md (v1.0), PAYMENT_ENGINE_ARCHITECTURE.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0)

---

## Table of Contents

1. [Security Foundation](#1-security-foundation)
2. [Application Security](#2-application-security)
3. [Web Security](#3-web-security)
4. [Data Security](#4-data-security)
5. [Access Control](#5-access-control)
6. [Privacy](#6-privacy)
7. [Infrastructure Security](#7-infrastructure-security)
8. [Logging & Monitoring](#8-logging--monitoring)
9. [Incident Response](#9-incident-response)
10. [Compliance](#10-compliance)
11. [Permissions](#11-permissions)
12. [Security Performance](#12-security-performance)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Security Foundation

### 1.1 Security Philosophy

**What:** The core belief system that governs every security decision on the Nabome platform.

**Why:**
- Security is not a feature bolted on after development — it is the foundation upon which every module is built.
- A security-first philosophy ensures that even if developers make mistakes, the platform remains protected by default.
- Enterprise customers, payment processors, and regulators require demonstrable security commitment.

**Where:** Every file, every function, every API endpoint, every database query, every UI component.

**Philosophy statements:**

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Security is default** | Every feature is secure unless explicitly made insecure (never happens) | Eliminates "forgot to add security" bugs |
| **Never trust the client** | All validation, authorization, and sanitization happens server-side | Client-side can be bypassed |
| **Defense in depth** | Multiple overlapping security layers; no single point of failure | If one layer fails, others protect |
| **Least privilege** | Every user, service, and component gets minimum required access | Limits blast radius of breaches |
| **Zero trust** | Every request is untrusted until verified, regardless of origin | Internal networks are not safe |
| **Secure by default** | Default configurations are secure; developers must explicitly choose insecurity | Safe even with inexperienced developers |
| **Privacy by design** | Data collection minimized, user consent required, deletion supported | Legal compliance + user trust |
| **Audit everything** | Every sensitive action logged with actor, timestamp, and context | Forensics + compliance |
| **Fail securely** | Errors never expose sensitive data; failure states deny access | Errors are attack vectors |
| **Assume breach** | Design systems as if attackers are already inside | Limits damage from compromises |

### 1.2 Zero Trust Architecture

**What:** A security model that requires strict identity verification for every person and device trying to access resources, regardless of location.

**Why:**
- Traditional perimeter security fails when users access from mobile devices, home networks, and cloud services.
- Cloudflare edge functions run globally — there is no "internal network."
- Zero trust eliminates the assumption that anything inside the network is safe.

**Where:** Every request to every API endpoint, every database query, every service-to-service call.

**Zero Trust principles for Nabome:**

| Principle | Implementation | Where Applied |
|-----------|---------------|---------------|
| **Verify explicitly** | Authenticate and authorize every request using identity, device, and context | Every API endpoint |
| **Use least privilege** | RBAC with granular permissions, time-bound elevated access | All resource access |
| **Assume breach** | Segment networks, encrypt end-to-end, monitor continuously | Infrastructure + application |
| **Never trust network** | All communication encrypted, service mesh authentication | Service-to-service |
| **Continuous validation** | Session re-validation, token rotation, anomaly detection | Session lifecycle |

**Zero Trust request flow:**

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────┐
│  1. IDENTITY VERIFICATION                     │
│     • Validate JWT token signature            │
│     • Check token expiration                  │
│     • Verify user exists and is active        │
│     • Check session hasn't been revoked       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  2. CONTEXT VALIDATION                        │
│     • Verify device fingerprint               │
│     • Check IP reputation                     │
│     • Validate request origin                 │
│     • Check geolocation anomalies             │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  3. AUTHORIZATION CHECK                       │
│     • Verify user has required role           │
│     • Check resource-specific permissions     │
│     • Validate ownership for user resources   │
│     • Check rate limits                       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  4. INPUT VALIDATION                          │
│     • Validate all request body fields        │
│     • Sanitize all string inputs              │
│     • Validate file types and sizes           │
│     • Check business rule constraints         │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│  5. AUDIT LOG                                 │
│     • Log request metadata                    │
│     • Log response status                     │
│     • Log any security-relevant events        │
│     • Never log sensitive data                │
└─────────────────────────────────────────────┘
```

**Best practices:**
- Every API handler must go through the full Zero Trust pipeline — no exceptions.
- Security middleware must be configured per-endpoint, not globally skipped.
- Token validation must check signature, expiration, issuer, and audience.
- Device fingerprinting must be validated but not used as sole authentication factor.

**Common implementation mistakes:**
- Trusting `X-Forwarded-For` headers without verification (spoofable).
- Skipping auth for "public" endpoints that return sensitive data.
- Using client-side role checks without server-side enforcement.
- Assuming CORS headers are sufficient protection (they are not).

### 1.3 Defense in Depth

**What:** Multiple overlapping security layers so that if one layer is bypassed, subsequent layers still protect the system.

**Why:**
- No single security measure is perfect.
- Attackers often chain multiple vulnerabilities.
- Defense in depth provides redundancy and time to detect attacks.

**Where:** Every layer of the Nabome stack — client, edge, API, database, infrastructure.

**Defense in depth layers:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 1: CLIENT                              │
│  • Input validation (Zod schemas)                               │
│  • XSS protection (React auto-escaping + CSP)                   │
│  • CSRF tokens (double-submit cookie)                           │
│  • Secure cookie handling (httpOnly, secure, sameSite)          │
│  • No secrets in client code                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 2: EDGE (Cloudflare)                   │
│  • DDoS protection (Cloudflare always-on)                       │
│  • WAF rules (Cloudflare WAF)                                   │
│  • Rate limiting (Cloudflare + application-level)               │
│  • Bot detection (Cloudflare Turnstile)                         │
│  • TLS termination                                              │
│  • Security headers (CSP, HSTS, X-Frame-Options)               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 3: API MIDDLEWARE                      │
│  • Security headers injection                                   │
│  • Rate limiting (application-level)                            │
│  • CSRF validation                                              │
│  • Authentication (JWT + session validation)                    │
│  • Authorization (RBAC + ownership checks)                      │
│  • Input validation (Zod)                                       │
│  • Request sanitization                                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 4: BUSINESS LOGIC                      │
│  • Business rule validation                                     │
│  • State machine enforcement                                    │
│  • Idempotency checks                                           │
│  • Atomic transactions                                          │
│  • Audit logging                                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 5: DATABASE                            │
│  • Parameterized queries (Prisma)                               │
│  • Row-level security (future)                                  │
│  • Encrypted columns (sensitive data)                           │
│  • Access control (database roles)                              │
│  • Audit triggers                                               │
│  • Backup encryption                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Best practices:**
- Never rely on a single security layer — always implement at least two.
- Security headers must be set at the edge layer AND validated at the API layer.
- Input validation happens on both client (UX) and server (security).
- Database parameterized queries are mandatory — even if application-level validation exists.

**Common implementation mistakes:**
- Relying solely on client-side validation (bypassable).
- Trusting edge-level rate limiting without application-level backup.
- Skipping database-level access controls because "the API already checks."
- Removing security layers during "performance optimization."

### 1.4 Least Privilege

**What:** Every user, service, and system component receives only the minimum permissions necessary to perform its function.

**Why:**
- Limits the damage if an account or service is compromised.
- Prevents accidental data access or modification.
- Meets compliance requirements for access control.

**Where:** User roles, API permissions, database access, service-to-service communication, infrastructure access.

**Least privilege implementation:**

| Context | Implementation | Example |
|---------|---------------|---------|
| **User roles** | Four distinct roles with granular permissions | Customer cannot access admin panel |
| **API endpoints** | Each endpoint requires specific role + resource ownership | `PUT /api/orders/:id` requires ADMIN or OWNER |
| **Database** | Application uses restricted database role | No DROP TABLE permission for app role |
| **Services** | Each service only accesses its own tables | Order service cannot read payment card data |
| **Infrastructure** | Developers access only needed environments | No production database access for frontend devs |

**Best practices:**
- Grant permissions explicitly, never implicitly through inheritance alone.
- Review permissions quarterly — remove unused access.
- Use time-bound elevated access for emergency operations.
- Log all permission grants and revocations.

**Common implementation mistakes:**
- Granting ADMIN role for convenience ("just to fix one thing").
- Using a single database user with full permissions for all services.
- Never revoking permissions when users change roles.
- Sharing service accounts across multiple applications.

### 1.5 Secure by Default

**What:** Every configuration, every default setting, every new feature starts in its most secure state.

**Why:**
- Developers under time pressure skip security steps.
- Default-insecure settings lead to vulnerabilities in production.
- Secure defaults protect even inexperienced developers.

**Where:** All configurations, feature flags, API endpoints, database schemas, cookie settings.

**Secure by default checklist:**

| Component | Secure Default | Why |
|-----------|---------------|-----|
| **New API endpoints** | Require authentication + CSRF | Never accidentally public |
| **New database tables** | No public access, audit logging enabled | Prevent data exposure |
| **New cookies** | httpOnly, secure, sameSite=strict | Prevent theft |
| **New features** | Disabled by default, feature-flag gated | Safe rollout |
| **New user accounts** | Unverified email, limited access | Prevent abuse |
| **New admin functions** | Require 2FA + approval workflow | Prevent privilege abuse |
| **Error responses** | Generic messages, no stack traces | Prevent information leakage |
| **CORS** | Deny all origins except explicitly allowed | Prevent unauthorized access |
| **File uploads** | Restrict to specific types, scan for malware | Prevent code execution |
| **Rate limits** | Apply to all endpoints by default | Prevent abuse |

**Best practices:**
- When in doubt, deny access and log the attempt.
- New features must pass security review before being enabled.
- Default configurations must be reviewed before deployment.
- Security defaults must never be overridden without explicit justification.

**Common implementation mistakes:**
- Creating endpoints without authentication middleware.
- Setting cookies without `secure` or `httpOnly` flags.
- Using permissive CORS (`*`) in production.
- Enabling features in production without testing in staging first.

### 1.6 Risk Management

**What:** A systematic approach to identifying, assessing, and mitigating security risks across the platform.

**Why:**
- Not all risks can be eliminated — resources must be allocated to the most critical ones.
- Risk management provides a framework for security investment decisions.
- Regulatory compliance requires documented risk assessments.

**Where:** Every architectural decision, every feature design, every infrastructure choice.

**Risk assessment framework:**

| Risk Level | Likelihood | Impact | Response | Example |
|------------|-----------|--------|----------|---------|
| **Critical** | High | High | Immediate mitigation | SQL injection, auth bypass |
| **High** | High | Medium or Medium | High | XSS, CSRF, rate limit bypass |
| **Medium** | Low | High or Medium | Medium | Verbose errors, missing headers |
| **Low** | Low | Low | Accept/Monitor | Information disclosure in logs |

**Risk categories for Nabome:**

| Category | Description | Key Risks |
|----------|-------------|-----------|
| **Authentication** | Identity verification | Credential stuffing, session hijacking, brute force |
| **Authorization** | Access control | Privilege escalation, IDOR, broken access control |
| **Data** | Data protection | Data breach, data leakage, unauthorized access |
| **Payment** | Financial transactions | Fraud, double charges, refund manipulation |
| **Infrastructure** | Platform security | DDoS, server compromise, DNS hijacking |
| **Third-party** | External services | API key leak, service compromise, supply chain |
| **Compliance** | Regulatory | GDPR/DPDP violation, audit failure, legal action |
| **Operational** | Day-to-day | Misconfiguration, human error, insider threat |

**Best practices:**
- Conduct risk assessment before every major feature launch.
- Maintain a risk register with owners and deadlines.
- Reassess risks quarterly and after security incidents.
- Use threat modeling (STRIDE) for new features.

**Common implementation mistakes:**
- Ignoring low-probability, high-impact risks.
- Treating risk assessment as a one-time activity.
- Not assigning risk owners.
- Focusing only on technical risks, ignoring operational risks.

### 1.7 Threat Modeling

**What:** A structured approach to identifying and addressing security threats in the Nabome platform.

**Why:**
- Proactive threat identification is cheaper than reactive incident response.
- Threat modeling ensures security is considered during design, not after deployment.
- Different modules have different threat profiles.

**Where:** Every new feature, every architectural change, every third-party integration.

**STRIDE threat model for Nabome:**

| Threat | Description | Nabome Example | Mitigation |
|--------|-------------|----------------|------------|
| **Spoofing** | Impersonating a user or system | Fake login, token forgery | JWT validation, CSRF tokens, rate limiting |
| **Tampering** | Modifying data in transit or at rest | Order manipulation, price change | Integrity checks, audit logging, encryption |
| **Repudiation** | Denying actions performed | "I didn't place that order" | Audit trail, digital signatures, logging |
| **Information Disclosure** | Exposing sensitive data | Data breach, verbose errors | Encryption, access control, error handling |
| **Denial of Service** | Making system unavailable | DDoS, resource exhaustion | Rate limiting, Cloudflare DDoS, circuit breakers |
| **Elevation of Privilege** | Gaining unauthorized access | Customer becoming admin | RBAC, least privilege, input validation |

**Threat modeling process:**

1. **Decompose the system:** Map all entry points, data flows, and trust boundaries.
2. **Identify threats:** Apply STRIDE to each component.
3. **Rate threats:** Use DREAD (Damage, Reproducibility, Exploitability, Affected users, Discoverability).
4. **Mitigate:** Design controls for each rated threat.
5. **Validate:** Verify mitigations through testing.

**Best practices:**
- Perform threat modeling during design phase, not after implementation.
- Document all threats and mitigations in the feature's architecture document.
- Revisit threat models when the feature's attack surface changes.
- Include threat modeling in security review checklists.

### 1.8 Security Governance

**What:** The organizational structure, policies, and processes that ensure security is consistently applied across the platform.

**Why:**
- Security without governance is ad-hoc and inconsistent.
- Governance ensures security standards survive team changes.
- Compliance requires documented security governance.

**Where:** Organization-wide, affecting all development, deployment, and operations activities.

**Security governance structure:**

| Role | Responsibility | Frequency |
|------|---------------|-----------|
| **Security Architect** | Design security architecture, review critical changes | Ongoing |
| **Development Team** | Implement security standards, follow secure coding practices | Every commit |
| **Code Review** | Verify security in every PR | Every PR |
| **Security Audit** | External security assessment | Annually |
| **Penetration Testing** | Identify vulnerabilities through adversarial testing | Semi-annually |
| **Incident Response** | Detect, respond to, and recover from security incidents | As needed |

**Security policies:**

| Policy | Description | Enforcement |
|--------|-------------|-------------|
| **Secure Coding Standard** | All code must follow this document | Code review + CI |
| **Secret Management** | No secrets in code, use Cloudflare Pages secrets | CI scanning + review |
| **Access Control** | RBAC with least privilege, reviewed quarterly | IAM + audit |
| **Incident Response** | Documented IR plan, tested annually | Runbook + drills |
| **Data Protection** | Encryption at rest and in transit, data minimization | Architecture review |
| **Third-Party Security** | Security assessment for all integrations | Vendor review |
| **Vulnerability Management** | Regular scanning, patching within SLA | Automated + manual |

**Best practices:**
- Security governance must be documented and accessible.
- All team members must be trained on security standards.
- Security metrics must be tracked and reported.
- Governance processes must be reviewed annually.

---

## 2. Application Security

### 2.1 Input Validation

**What:** Server-side validation of all user inputs using Zod schemas before processing any request.

**Why:**
- 95% of the previous Nabome codebase used raw `req.json()` without validation — this is the single most critical fix.
- Input validation prevents injection attacks, business logic errors, and data corruption.
- Client-side validation is for UX; server-side validation is for security.

**Where:** Every API endpoint, every form submission, every URL parameter, every header.

**Validation pipeline:**

```
Request → Schema Definition → Zod Parse → Sanitization → Business Logic
                │                                        │
                ▼                                        ▼
         Validation Error                        Processed Data
         (400 Bad Request)                      (validated + sanitized)
```

**Validation rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always validate server-side** | Zod schema on every endpoint | Client validation is bypassable |
| **Never trust client types** | Parse and coerce all inputs | JSON body can contain any type |
| **Validate required fields** | Explicit `.required()` or `.min(1)` | Prevent missing data |
| **Validate string length** | `.max(N)` on all string fields | Prevent buffer overflow |
| **Validate numeric ranges** | `.min(N).max(N)` on numbers | Prevent invalid values |
| **Validate enum values** | `.enum([...])` for fixed options | Prevent invalid states |
| **Validate email format** | `.email()` with Zod built-in | Prevent malformed data |
| **Validate UUID format** | `.uuid()` on all ID fields | Prevent injection via IDs |
| **Validate date format** | `.datetime()` or `.date()` | Prevent date manipulation |
| **Validate file uploads** | Type, size, and content validation | Prevent malicious files |

**Validation pattern for API handlers:**

```typescript
// ✓ CORRECT: Full validation pipeline
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  basePrice: z.number().positive().max(99999999),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).max(10).optional(),
});

export async function createProduct(request: Request) {
  const body = await request.json();
  const result = CreateProductSchema.safeParse(body);
  
  if (!result.success) {
    return json({ success: false, error: result.error.issues }, 400);
  }
  
  // result.data is fully validated and typed
  const product = await ProductService.create(result.data);
  return json({ success: true, data: product }, 201);
}
```

**Best practices:**
- Define Zod schemas co-located with the API handler.
- Use `safeParse` instead of `parse` to avoid throwing on validation errors.
- Return structured error responses with field-level details.
- Reuse schemas between frontend forms and backend validation.

**Common implementation mistakes:**
- Using `req.json()` without any validation (the previous Nabome anti-pattern).
- Validating on client only (bypassable with curl/Postman).
- Using generic error messages without field-level details.
- Not validating URL parameters or query strings.
- Trusting `Content-Type` header to guarantee body format.

### 2.2 Output Encoding

**What:** Encoding all data before rendering in HTML, JavaScript, or returning in API responses.

**Why:**
- Prevents XSS attacks where injected scripts execute in user browsers.
- React's JSX automatically escapes output, but manual `dangerouslySetInnerHTML` bypasses this.
- API responses must not leak HTML or JavaScript that could be interpreted by downstream consumers.

**Where:** All HTML rendering, all API responses that might be consumed by non-TypeScript clients.

**Output encoding rules:**

| Context | Encoding | Where Applied |
|---------|----------|---------------|
| **React JSX** | Automatic escaping (built-in) | All component rendering |
| **dangerouslySetInnerHTML** | DOMPurify sanitization | Only when absolutely necessary |
| **API JSON responses** | JSON serialization (safe by default) | All API responses |
| **URL parameters** | `encodeURIComponent()` | All dynamic URL construction |
| **HTML attributes** | Attribute escaping | Only in rare SSR scenarios |
| **CSS values** | CSS escaping | Dynamic CSS values (rare) |

**Best practices:**
- Never use `dangerouslySetInnerHTML` without DOMPurify.
- Never construct HTML strings from user input.
- Use React's built-in escaping — it handles most cases.
- Sanitize any rich text content before storage.

**Common implementation mistakes:**
- Using `dangerouslySetInnerHTML` with unsanitized content.
- Manually constructing HTML strings from user input.
- Not sanitizing rich text editor output.
- Trusting that API consumers will properly encode output.

### 2.3 Business Logic Security

**What:** Protecting business rules and workflows from manipulation, bypass, and abuse.

**Why:**
- Business logic vulnerabilities cannot be caught by standard security tools.
- Attackers exploit business rules to gain unfair advantages (price manipulation, inventory hoarding).
- Business logic flaws can cause financial loss.

**Where:** All business workflows — checkout, payments, order management, inventory, promotions.

**Business logic security rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side price validation** | Never trust client-sent prices | Prevent price manipulation |
| **State machine enforcement** | Only valid transitions allowed | Prevent illegal state changes |
| **Idempotency** | Duplicate requests produce same result | Prevent double actions |
| **Inventory checks** | Verify stock at checkout, not just cart | Prevent overselling |
| **Promotion validation** | Server-side coupon/discount validation | Prevent fraud |
| **Quantity limits** | Enforce min/max quantity per order | Prevent hoarding |
| **Ownership verification** | User can only modify own resources | Prevent unauthorized access |
| **Timing constraints** | Expiry on优惠券, flash sales, reservations | Prevent abuse |

**Common implementation mistakes:**
- Trusting the client to send the correct price (the previous Nabome vulnerability).
- Not checking inventory at checkout time.
- Allowing negative quantities or zero prices.
- Not enforcing order status state machine.
- Using client-side timestamps for business logic.

### 2.4 API Security

**What:** Comprehensive security controls for all API endpoints.

**Why:**
- APIs are the primary attack surface for the platform.
- The previous Nabome codebase had 95% of endpoints without validation.
- API security protects both the platform and its users.

**Where:** Every API endpoint in `api/_handlers/`.

**API security checklist:**

| Control | Implementation | Enforcement |
|---------|---------------|-------------|
| **Authentication** | JWT validation via middleware | Every non-public endpoint |
| **Authorization** | RBAC + ownership checks | Every authenticated endpoint |
| **CSRF protection** | Double-submit cookie pattern | Every state-changing endpoint |
| **Rate limiting** | Per-IP + per-user limits | Every public endpoint |
| **Input validation** | Zod schemas | Every endpoint accepting input |
| **Output sanitization** | Structured responses | Every endpoint |
| **Error handling** | Typed errors, no stack traces | Every endpoint |
| **Request logging** | Audit log with metadata | Every endpoint |
| **Timeout** | 30-second request timeout | Every endpoint |
| **Size limits** | Max request body size | Every endpoint accepting body |

**API security headers:**

Every API response must include:

```
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

**Best practices:**
- Use the middleware pipeline for all security controls — never skip middleware.
- Document security requirements for each endpoint.
- Test API security with automated security tests.
- Monitor API abuse patterns.

### 2.5 Session Security

**What:** Secure management of user sessions from creation to destruction.

**Why:**
- Session hijacking is a common attack vector.
- The previous Nabome codebase stored JWT tokens in localStorage (High severity issue).
- Sessions must be protected at every stage.

**Where:** Authentication system, cookie handling, session management.

**Session security rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Session tokens in httpOnly cookies only | Prevent XSS theft |
| **Secure flag** | Cookies only sent over HTTPS | Prevent MITM |
| **SameSite=strict** | Cookies not sent cross-origin | Prevent CSRF |
| **Short expiry** | Access tokens: 15min, Refresh tokens: 7 days | Limit exposure window |
| **Token rotation** | Refresh token rotated on use | Prevent replay attacks |
| **Session binding** | Bind to device fingerprint + IP range | Prevent session theft |
| **Revocation** | Immediate session invalidation on logout/security event | Limit damage |
| **Multi-device** | Allow multiple sessions, revoke individually | User convenience + security |

**Session lifecycle:**

```
Login → Token Generation → Cookie Setting → Request Validation → Token Refresh → Logout/Expiry
   │           │                  │                │                    │              │
   ▼           ▼                  ▼                ▼                    ▼              ▼
 Verify    Sign JWT         Set httpOnly     Validate JWT         Rotate refresh   Clear all
 credentials + expiry       + secure         + check session      token + extend   session data
                            + sameSite       + device check       expiry
```

**Best practices:**
- Never store tokens in localStorage or sessionStorage.
- Always use `Set-Cookie` with httpOnly, secure, and sameSite flags.
- Implement session invalidation on password change.
- Log all session creation and destruction events.

### 2.6 Authentication Hardening

**What:** Additional security measures beyond basic authentication to resist advanced attacks.

**Why:**
- Basic username/password authentication is increasingly insufficient.
- Credential stuffing, brute force, and phishing attacks are common.
- Enterprise customers require stronger authentication.

**Where:** Authentication system, login flows, credential management.

**Authentication hardening measures:**

| Measure | Implementation | Priority |
|---------|---------------|----------|
| **Password requirements** | Min 8 chars, mixed case, numbers, symbols | High (MVP) |
| **Account lockout** | 5 failed attempts → 15min lockout | High (MVP) |
| **Rate limiting** | 10 login attempts per IP per hour | High (MVP) |
| **Turnstile CAPTCHA** | Cloudflare Turnstile on login | High (MVP) |
| **Email verification** | Required for full account access | High (MVP) |
| **MFA support** | TOTP-based 2FA (future) | Medium |
| **Passkey support** | WebAuthn FIDO2 (future) | Medium |
| **Hardware key support** | YubiKey, Titan (future) | Low |
| **Risk-based auth** | Unusual location/device triggers extra verification | Medium |
| **Password breach check** | Have I Been Pwned API integration | Medium |

**Best practices:**
- Never send plaintext passwords over the wire (HTTPS mandatory).
- Use timing-safe comparison for all token comparisons.
- Log all authentication attempts (success and failure).
- Implement progressive delays for repeated failures.

### 2.7 Authorization Enforcement

**What:** Server-side verification that every authenticated user has permission for the requested action.

**Why:**
- Authentication tells you WHO the user is; authorization tells you WHAT they can do.
- Broken authorization is the #1 vulnerability in OWASP Top 10.
- Every endpoint must independently verify authorization.

**Where:** Every API endpoint, every service function, every database query.

**Authorization enforcement pattern:**

```typescript
// ✓ CORRECT: Authorization in handler
export async function updateOrder(request: Request, userId: string) {
  const orderId = extractParam(request, 'orderId');
  
  // 1. Fetch the order
  const order = await OrderService.findById(orderId);
  if (!order) return notFound();
  
  // 2. Check ownership or admin role
  if (order.userId !== userId && !isAdmin(userId)) {
    return forbidden('You can only modify your own orders');
  }
  
  // 3. Process update
  const updated = await OrderService.update(orderId, validatedData);
  return json({ success: true, data: updated });
}
```

**Authorization rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always check server-side** | Never rely on client-side role display | Client can be modified |
| **Check before every action** | Authorization per endpoint, not just per route | Granular protection |
| **Verify resource ownership** | User can only access own resources | Prevent IDOR |
| **Admin requires explicit grant** | Admin role must be explicitly assigned | Prevent privilege escalation |
| **Deny by default** | If no rule allows, deny | Secure by default |
| **Audit all denials** | Log failed authorization attempts | Security monitoring |

### 2.8 Secure Defaults

**What:** Every new endpoint, feature, and configuration starts with the most secure settings.

**Why:**
- Developers under time pressure often forget to add security.
- Secure defaults protect against accidental exposure.
- This is the core of "secure by default" philosophy.

**Where:** All new code, configurations, and features.

**Secure defaults for new endpoints:**

| Setting | Default | Override Required |
|---------|---------|-------------------|
| **Authentication** | Required | Must explicitly mark as public |
| **CSRF protection** | Enabled | Must explicitly disable (GET only) |
| **Rate limiting** | Enabled | Must explicitly configure limits |
| **Input validation** | Required | No override — always validate |
| **Error handling** | Generic errors | Must not expose stack traces |
| **Logging** | Request logged | Must not disable for "performance" |
| **CORS** | Deny all | Must explicitly allow origins |

---

## 3. Web Security

### 3.1 SQL Injection Prevention

**What:** Preventing attackers from executing arbitrary SQL queries through user input.

**Why:**
- SQL injection remains one of the most dangerous web vulnerabilities.
- Can lead to complete data breach, data modification, or system compromise.
- The previous Nabome codebase used parameterized queries (Prisma), which is correct.

**Where:** All database queries, all user inputs that reach the database.

**Prevention measures:**

| Measure | Implementation | Enforcement |
|---------|---------------|-------------|
| **ORM usage** | Prisma for all database operations | Code review |
| **Parameterized queries** | Never use raw SQL with string interpolation | CI linting |
| **Input validation** | Zod schemas before database queries | Every endpoint |
| **Least privilege** | Database user with minimal permissions | Infrastructure |
| **Error handling** | Never expose SQL errors to users | Error middleware |

**What NOT to do:**

```typescript
// ✗ WRONG: String interpolation in SQL
const query = `SELECT * FROM users WHERE id = '${userId}'`;
await db.query(query);

// ✗ WRONG: Raw SQL with user input
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// ✓ CORRECT: Prisma parameterized query
const user = await prisma.user.findUnique({ where: { id: userId } });
```

**Best practices:**
- Use Prisma for all database operations — never raw SQL.
- If raw SQL is absolutely necessary, use Prisma's `$queryRaw` with template literals (parameterized).
- Never concatenate user input into SQL strings.
- Validate all inputs before they reach database queries.

### 3.2 XSS Prevention

**What:** Preventing attackers from injecting malicious scripts that execute in other users' browsers.

**Why:**
- XSS allows session hijacking, defacement, and malware distribution.
- React provides automatic JSX escaping, but `dangerouslySetInnerHTML` bypasses it.
- Stored XSS is particularly dangerous because it executes for every user viewing the content.

**Where:** All HTML rendering, rich text content, user-generated content.

**Prevention measures:**

| Measure | Implementation | Where Applied |
|---------|---------------|---------------|
| **React JSX escaping** | Automatic in React components | All component rendering |
| **DOMPurify** | Sanitize before dangerouslySetInnerHTML | Rich text, markdown rendering |
| **CSP headers** | Content-Security-Policy header | All responses |
| **Input validation** | Reject suspicious content | All user inputs |
| **Output encoding** | Context-appropriate encoding | All dynamic content |

**CSP policy:**

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://res.cloudinary.com data:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.razorpay.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

**Best practices:**
- Never use `dangerouslySetInnerHTML` without DOMPurify.
- Never use `eval()` or `new Function()` with user input.
- Implement CSP headers to limit script sources.
- Sanitize rich text content before storage and before rendering.

### 3.3 CSRF Protection

**What:** Preventing attackers from tricking authenticated users into performing unintended actions.

**Why:**
- The previous Nabome codebase had CSRF verification imported but never called (Critical issue).
- CSRF can cause unintended purchases, profile changes, or account deletion.
- State-changing operations are vulnerable without CSRF protection.

**Where:** All state-changing API endpoints (POST, PUT, DELETE, PATCH).

**Double-submit cookie pattern:**

```
1. Server generates random CSRF token
2. Token stored in httpOnly cookie (not accessible to JS)
3. Token also returned in response body (accessible to JS)
4. Client sends token in X-CSRF-Token header on mutations
5. Server compares cookie token with header token using timing-safe comparison
```

**Implementation:**

```typescript
// ✓ CORRECT: CSRF double-submit cookie pattern
export function generateCsrfToken(): string {
  const token = crypto.randomUUID();
  setCookie('csrf_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

export function validateCsrfToken(request: Request): boolean {
  const cookieToken = getCookie(request, 'csrf_token');
  const headerToken = request.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}
```

**Best practices:**
- Apply CSRF protection to ALL state-changing endpoints — no exceptions.
- Use timing-safe comparison to prevent timing attacks.
- Regenerate CSRF token on login and periodically.
- CSRF token must be unique per session.

### 3.4 SSRF Prevention

**What:** Preventing attackers from making the server issue requests to internal resources.

**Why:**
- SSRF can expose internal services, cloud metadata endpoints, and databases.
- Image upload and URL fetching features are common SSRF vectors.

**Where:** URL fetching, image proxying, webhook processing, any feature that makes outbound requests.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **URL validation** | Allowlist permitted domains | Prevent internal access |
| **IP blocking** | Block requests to private IPs (10.x, 172.16-31.x, 192.168.x, 169.254.x) | Prevent metadata access |
| **DNS resolution check** | Resolve DNS before making request, verify resolved IP | Prevent DNS rebinding |
| **Request timeout** | Short timeout on outbound requests | Prevent resource exhaustion |
| **Protocol restriction** | Only allow HTTP/HTTPS | Prevent file://, gopher:// |

**Best practices:**
- Never fetch user-supplied URLs without validation.
- Use a dedicated proxy service for URL fetching.
- Block requests to cloud metadata endpoints (169.254.169.254).
- Log all outbound requests for audit.

### 3.5 Command Injection Prevention

**What:** Preventing attackers from executing arbitrary system commands through user input.

**Why:**
- Command injection can lead to complete system compromise.
- File processing, image manipulation, and document generation may use system commands.

**Where:** File processing, document generation, any feature that executes system commands.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **Avoid system commands** | Use language-native libraries | Eliminate attack vector |
| **Input sanitization** | Validate all inputs before command construction | Prevent injection |
| **Parameterized execution** | Use execFile with arguments array | Prevent shell interpretation |
| **Least privilege** | Run processes with minimal permissions | Limit damage |
| **Sandboxing** | Execute untrusted code in sandbox | Isolate from system |

**Best practices:**
- Never use `exec()` or `system()` with user input.
- Use Cloudinary for image processing (serverless, sandboxed).
- Use Cloudflare Workers for document generation (isolated runtime).
- Never pass user input to shell commands.

### 3.6 Path Traversal Prevention

**What:** Preventing attackers from accessing files outside the intended directory.

**Why:**
- Path traversal can expose sensitive files (config, keys, database).
- File upload and download features are common vectors.

**Where:** File upload, file download, file serving, any feature that accesses the filesystem.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **Path normalization** | Resolve `../` and `..\\` before validation | Prevent traversal |
| **Chroot/jail** | Serve files from designated directory only | Limit access |
| **Allowlist** | Only permit specific file types and paths | Prevent arbitrary access |
| **Never use user input in paths** | Use UUIDs or database IDs instead | Eliminate traversal |
| **Cloud storage** | Use R2/Cloudinary instead of filesystem | Isolate from system |

**Best practices:**
- Store files in Cloudflare R2, not local filesystem.
- Use Cloudinary for image transformations.
- Never construct file paths from user input.
- Validate resolved paths stay within allowed directories.

### 3.7 Clickjacking Prevention

**What:** Preventing attackers from tricking users into clicking hidden elements.

**Why:**
- Clickjacking can cause unintended actions (purchases, settings changes).
- Iframe embedding is a common vector.

**Where:** All pages, all API responses.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **X-Frame-Options** | `DENY` on all responses | Prevent iframe embedding |
| **CSP frame-ancestors** | `frame-ancestors 'none'` | Modern iframe prevention |
| **SameSite cookies** | `sameSite=strict` | Prevent cross-site requests |

### 3.8 Open Redirect Prevention

**What:** Preventing attackers from redirecting users to malicious sites.

**Why:**
- Open redirects can be used in phishing attacks.
- OAuth callbacks and logout redirects are common vectors.

**Where:** All redirect URLs, OAuth flows, logout flows.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **Allowlist** | Only redirect to whitelisted domains | Prevent arbitrary redirects |
| **Relative paths** | Prefer relative URLs for redirects | Stay on same domain |
| **Validation** | Validate redirect URL before redirecting | Prevent bypass |
| **User warning** | Show warning for external redirects | User awareness |

### 3.9 File Upload Security

**What:** Secure handling of file uploads including type validation, content scanning, and storage.

**Why:**
- File uploads are a primary vector for malware distribution and code execution.
- Previous Nabome had file upload through Cloudinary, which provides built-in security.

**Where:** All file upload endpoints (profile images, product images, documents).

**Security controls:**

| Control | Implementation | Rationale |
|---------|---------------|-----------|
| **Type validation** | Allowlist of permitted MIME types | Prevent executable uploads |
| **Size limits** | Max file size per type | Prevent resource exhaustion |
| **Content scanning** | Validate file content matches extension | Prevent disguised malware |
| **Rename files** | Use UUIDs, not user-provided names | Prevent path manipulation |
| **Cloud storage** | Store in R2/Cloudinary, not filesystem | Isolate from system |
| **Virus scanning** | Future: integrate ClamAV or similar | Detect malware |

**Allowed file types:**

| Type | MIME Types | Max Size | Notes |
|------|-----------|----------|-------|
| **Images** | image/jpeg, image/png, image/webp, image/gif | 5MB | Product/profile images |
| **Documents** | application/pdf | 10MB | Invoices, reports |
| **Avatars** | image/jpeg, image/png, image/webp | 2MB | Profile pictures |

**Best practices:**
- Never trust the `Content-Type` header — validate actual file content.
- Never serve uploaded files with executable permissions.
- Scan uploads for malware before making them accessible.
- Use Cloudinary transformations for image processing.

### 3.10 Rate Abuse Prevention

**What:** Preventing abuse through excessive requests that degrade service or enable attacks.

**Why:**
- Rate limiting was a known vulnerability in the previous Nabome codebase (High severity).
- Abuse can take many forms: brute force, scraping, DDoS, resource exhaustion.

**Where:** All public API endpoints, authentication endpoints, file upload endpoints.

**Rate limiting strategy:**

| Tier | Trigger | Limit | Action |
|------|---------|-------|--------|
| **Normal** | Standard usage | 100 req/min per user | Allow |
| **Elevated** | Repeated 429s | 50 req/min per user | Warn + slow |
| **Aggressive** | Known abuse pattern | 10 req/min per IP | Block + alert |
| **Critical** | DDoS/attack | 0 req/min (temporary block) | Block + escalate |

**Rate limiting implementation:**

```
Client → Cloudflare Rate Limiting → Application Rate Limiting → Handler
                         │                        │
                    Edge-level                 App-level
                    (automatic)            (KV-based counters)
```

**Best practices:**
- Apply rate limiting at both edge (Cloudflare) and application level.
- Use sliding window counters, not fixed windows.
- Rate limit authentication endpoints more aggressively.
- Log rate limit violations for abuse analysis.

### 3.11 Brute Force Prevention

**What:** Preventing attackers from guessing passwords or tokens through repeated attempts.

**Why:**
- Brute force is the most common attack against authentication systems.
- Weak passwords + no brute force protection = easy compromise.

**Where:** Login endpoints, password reset, API key validation.

**Brute force prevention measures:**

| Measure | Implementation | Threshold |
|---------|---------------|-----------|
| **Account lockout** | Temporarily lock account after failures | 5 failures → 15min lockout |
| **Progressive delays** | Increase delay between attempts | 1s, 2s, 4s, 8s, 16s |
| **IP blocking** | Block IP after repeated failures | 10 failures from single IP |
| **CAPTCHA** | Require Turnstile after failures | After 3 failures |
| **Notification** | Alert user of failed attempts | After each failure |
| **Rate limiting** | Limit login attempts per IP | 10/hour per IP |

### 3.12 Enumeration Prevention

**What:** Preventing attackers from discovering valid usernames, email addresses, or resource IDs.

**Why:**
- Enumeration enables targeted attacks (credential stuffing, social engineering).
- Different error messages for "user not found" vs "wrong password" reveal valid usernames.

**Where:** Login endpoints, registration endpoints, password reset, all error responses.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **Generic error messages** | "Invalid email or password" for all failures | Don't reveal which is wrong |
| **Consistent timing** | Same response time for valid/invalid users | Prevent timing attacks |
| **Uniform responses** | Same response format regardless of outcome | Prevent information leakage |
| **Resource access** | Return 404 for unauthorized resource access | Don't reveal resource existence |

### 3.13 Replay Attack Prevention

**What:** Preventing attackers from re-submitting captured valid requests.

**Why:**
- Replay attacks can cause duplicate transactions, unauthorized actions.
- Payment webhooks and authentication tokens are common targets.

**Where:** Payment processing, authentication, any idempotent-sensitive operation.

**Prevention measures:**

| Measure | Implementation | Rationale |
|---------|---------------|-----------|
| **Nonce tracking** | One-time use tokens/identifiers | Prevent reuse |
| **Timestamp validation** | Reject requests older than threshold | Prevent stale requests |
| **Idempotency keys** | Unique key per logical operation | Prevent duplicate processing |
| **Token rotation** | Rotate refresh tokens on use | Prevent token replay |
| **Webhook idempotency** | Process each webhook event once | Prevent duplicate actions |

---

## 4. Data Security

### 4.1 Encryption at Rest

**What:** Encrypting all stored sensitive data to protect against physical theft and unauthorized database access.

**Why:**
- If an attacker gains access to the database, encrypted data remains protected.
- Compliance regulations require encryption of sensitive data at rest.
- Defense in depth — encryption adds a layer even if access controls fail.

**Where:** All sensitive data stored in PostgreSQL, Cloudflare R2, and Cloudflare KV.

**Encryption at rest standards:**

| Data Type | Encryption Method | Where Stored |
|-----------|------------------|--------------|
| **Passwords** | bcrypt (cost 12) | PostgreSQL (auth.users) |
| **PII (email, phone, name)** | Application-level AES-256 | PostgreSQL |
| **Payment tokens** | Gateway tokenization (Razorpay) | Razorpay vault |
| **API keys** | Cloudflare Pages secrets | Cloudflare |
| **Session tokens** | Signed JWT + encrypted cookie | Client cookie |
| **File uploads** | Cloudflare R2 server-side encryption | R2 bucket |
| **Backup data** | Encrypted backups | Cloud storage |

**Best practices:**
- Never store passwords in plaintext — use bcrypt with cost factor 12.
- Use gateway tokenization for payment card data (never store card numbers).
- Encrypt database backups.
- Use environment-specific encryption keys.

**Common implementation mistakes:**
- Storing passwords with MD5 or SHA-256 (too fast, vulnerable to rainbow tables).
- Storing payment card numbers directly (PCI DSS violation).
- Using the same encryption key across environments.
- Not encrypting backups.

### 4.2 Encryption in Transit

**What:** Encrypting all data transmitted between client, edge, API, and database.

**Why:**
- Prevents eavesdropping and man-in-the-middle attacks.
- Protects sensitive data during transmission.
- Required by compliance regulations.

**Where:** All network communication — client-to-edge, edge-to-API, API-to-database.

**Encryption in transit standards:**

| Connection | Encryption | Standard |
|-----------|-----------|----------|
| **Client → Cloudflare** | TLS 1.3 | HTTPS only |
| **Cloudflare → Workers** | TLS 1.3 | Edge internal |
| **Workers → PostgreSQL** | TLS 1.2+ | Neon serverless TLS |
| **Workers → Razorpay** | TLS 1.2+ | HTTPS API |
| **Workers → Resend** | TLS 1.2+ | HTTPS API |
| **Workers → Cloudinary** | TLS 1.2+ | HTTPS API |
| **Workers → R2** | TLS 1.2+ | Cloudflare internal |

**HSTS policy:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Best practices:**
- Enforce HTTPS everywhere — no HTTP allowed.
- Use TLS 1.3 where supported, TLS 1.2 as minimum.
- Enable HSTS preload for the domain.
- Never disable certificate verification.

### 4.3 Password Storage

**What:** Secure storage of user passwords using industry-standard hashing algorithms.

**Why:**
- Passwords are the most sensitive credential — their compromise affects all users.
- Previous Nabome stored JWT in localStorage, indicating weak security posture.
- bcrypt is the industry standard for password hashing.

**Where:** Authentication system, user registration, password change.

**Password storage standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Algorithm** | bcrypt | Memory-hard, slow, industry-standard |
| **Cost factor** | 12 | Balances security and performance |
| **Salt** | Automatic (bcrypt generates) | Prevents rainbow tables |
| **Pepper** | Application-level secret | Additional protection |
| **Storage** | Only hash stored, never plaintext | Prevent exposure |
| **Comparison** | Timing-safe comparison | Prevent timing attacks |

**Password requirements:**

| Requirement | Standard | Rationale |
|-------------|----------|-----------|
| **Minimum length** | 8 characters | Basic complexity |
| **Maximum length** | 128 characters | Prevent resource exhaustion |
| **Complexity** | At least 3 of: uppercase, lowercase, number, symbol | Prevent weak passwords |
| **Breach check** | Have I Been Pwned integration | Prevent known-breached passwords |
| **History** | Cannot reuse last 5 passwords | Prevent cycling |
| **Expiration** | No forced expiration (NIST 800-63B) | Forced expiry leads to weak passwords |

### 4.4 Secret Management

**What:** Secure storage, rotation, and access control for all secrets (API keys, tokens, passwords).

**Why:**
- The previous Nabome codebase had production secrets committed to `.env` (Critical issue).
- Leaked secrets can lead to complete system compromise.
- Secret management must be systematic, not ad-hoc.

**Where:** All API keys, database credentials, signing keys, encryption keys.

**Secret management standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **No secrets in code** | Use Cloudflare Pages secrets | Prevent repository leaks |
| **No secrets in logs** | Redact sensitive data in logging | Prevent log exposure |
| **No secrets in URLs** | Never put tokens in query strings | Prevent referrer leakage |
| **Environment isolation** | Separate secrets per environment | Limit blast radius |
| **Access control** | Only necessary services access secrets | Least privilege |
| **Rotation** | Rotate secrets every 90 days | Limit exposure window |
| **Audit** | Log all secret access | Accountability |

**Secret categories for Nabome:**

| Secret | Location | Rotation | Access |
|--------|----------|----------|--------|
| **DATABASE_URL** | Cloudflare Pages | On breach | API handlers only |
| **SUPABASE_ANON_KEY** | Cloudflare Pages | Annually | Client + server |
| **SUPABASE_SERVICE_KEY** | Cloudflare Pages | Quarterly | Server only |
| **RAZORPAY_KEY_ID** | Cloudflare Pages | Annually | Payment handlers |
| **RAZORPAY_KEY_SECRET** | Cloudflare Pages | Quarterly | Payment handlers |
| **RAZORPAY_WEBHOOK_SECRET** | Cloudflare Pages | On breach | Webhook handler |
| **CLOUDINARY_URL** | Cloudflare Pages | Annually | Storage handlers |
| **RESEND_API_KEY** | Cloudflare Pages | Annually | Email handlers |
| **CSRF_SECRET** | Cloudflare Pages | On breach | Auth middleware |
| **JWT_SECRET** | Cloudflare Pages | Quarterly | Auth system |

**Best practices:**
- Use `.env.example` with placeholders, never real values.
- Rotate secrets immediately if exposure is suspected.
- Use different secrets for development, staging, and production.
- Never share secrets via email, Slack, or other communication channels.

**Common implementation mistakes:**
- Committing `.env` files to git (the previous Nabome Critical issue).
- Using the same secret across all environments.
- Logging secrets in error messages.
- Sharing secrets through insecure channels.
- Never rotating secrets.

### 4.5 API Key Security

**What:** Secure management of API keys for external service integrations.

**Why:**
- API keys grant access to external services — their compromise can cause financial loss.
- Keys must be scoped, rotated, and monitored.

**Where:** All external service integrations (Razorpay, Resend, Cloudinary, Supabase).

**API key security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Least scope** | Request minimum required permissions | Limit blast radius |
| **Server-side only** | Never expose to client | Prevent theft |
| **Environment isolation** | Different keys per environment | Prevent cross-env abuse |
| **Rotation** | Rotate every 90 days | Limit exposure |
| **Monitoring** | Track usage patterns | Detect abuse |
| **Revocation** | Immediate revocation on suspected compromise | Limit damage |

### 4.6 Sensitive Data Handling

**What:** Classification and protection of sensitive data based on its sensitivity level.

**Why:**
- Not all data requires the same protection level.
- Classification ensures appropriate security measures for each data type.
- Compliance regulations define specific handling requirements.

**Where:** All data stored, processed, or transmitted by the platform.

**Data classification:**

| Level | Description | Examples | Protection |
|-------|-------------|----------|------------|
| **Critical** | Data whose exposure causes severe harm | Passwords, payment tokens, encryption keys | Encryption, access control, audit |
| **Confidential** | Data whose exposure causes significant harm | PII (email, phone, address), order history | Encryption, access control |
| **Internal** | Data for internal use only | Business analytics, system configuration | Access control |
| **Public** | Data intended for public consumption | Product listings, reviews, ratings | Integrity checks |

**Sensitive data handling rules:**

| Data Type | Storage | Transmission | Access | Retention |
|-----------|---------|-------------|--------|-----------|
| **Email** | Encrypted column | TLS | User + Admin | Account lifetime |
| **Phone** | Encrypted column | TLS | User + Admin | Account lifetime |
| **Address** | Encrypted column | TLS | User + Admin | Account lifetime |
| **Full name** | Plain column | TLS | User + Admin | Account lifetime |
| **Password hash** | bcrypt hash | Never transmitted | System only | Account lifetime |
| **Payment tokens** | Gateway vault | TLS | Payment system | Transaction lifetime |
| **IP address** | Plain column | TLS | System + Admin | 1 year |
| **User agent** | Plain column | TLS | System + Admin | 1 year |
| **Session data** | Cookie | TLS | User only | Session lifetime |

### 4.7 Personal Information Protection

**What:** Special handling for personally identifiable information (PII) as required by privacy regulations.

**Why:**
- PII is the primary target of data breaches.
- Privacy regulations (DPDP Act, GDPR) impose strict requirements on PII handling.
- Users trust the platform with their personal information.

**Where:** All user profiles, addresses, orders, and communications.

**PII protection standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Minimization** | Collect only necessary PII | Reduce attack surface |
| **Consent** | Explicit consent for data collection | Legal compliance |
| **Purpose limitation** | Use PII only for stated purpose | Legal compliance |
| **Storage limitation** | Delete PII when no longer needed | Legal compliance |
| **Access control** | Restrict PII access to authorized personnel | Security |
| **Encryption** | Encrypt PII at rest and in transit | Security |
| **Audit** | Log all PII access | Compliance |
| **Breach notification** | Notify affected users within 72 hours | Legal requirement |

### 4.8 Financial Information Protection

**What:** Special handling for financial data including payment tokens, transaction records, and settlement data.

**Why:**
- Financial data is subject to strict regulatory requirements (RBI, PCI DSS).
- Financial fraud can cause direct monetary loss.
- Financial records must be immutable for audit purposes.

**Where:** Payment processing, order management, finance engine.

**Financial data protection standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **No card storage** | Use Razorpay tokenization | PCI DSS compliance |
| **Immutable records** | Append-only payment logs | Audit trail |
| **Encryption** | Encrypt financial records at rest | Security |
| **Access control** | Restrict financial data access | Least privilege |
| **Audit trail** | Log all financial operations | Compliance |
| **Reconciliation** | Daily reconciliation with gateway | Detect discrepancies |
| **Fraud detection** | Monitor for unusual patterns | Prevent loss |

---

## 5. Access Control

### 5.1 Identity Verification

**What:** Confirming the identity of users before granting access to resources.

**Why:**
- Identity verification is the foundation of all access control.
- Weak identity verification undermines all other security measures.

**Where:** All authentication flows — login, registration, password reset, session validation.

**Identity verification standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Multi-factor** | Password + email verification (MFA future) | Defense in depth |
| **Email verification** | Required for full access | Prevent fake accounts |
| **Phone verification** | Optional, required for Shop Owners | Additional identity proof |
| **Device binding** | Session tied to device fingerprint | Prevent session theft |
| **IP validation** | Flag unusual IP changes | Detect account compromise |

### 5.2 Role-Based Access Control (RBAC)

**What:** Access control based on assigned roles with predefined permissions.

**Why:**
- RBAC provides consistent, auditable access control.
- Matches the business structure (Customer, Shop Owner, Admin).
- Simplifies permission management.

**Where:** All API endpoints, all resource access, all administrative functions.

**Role hierarchy:**

```
Guest (0)
    │
    ▼
Customer (10)
    │
    ▼
Shop Owner (20)
    │
    ▼
Admin (30)
    │
    ▼
System (100)
```

**Permission matrix:**

| Resource | Guest | Customer | Shop Owner | Admin |
|----------|-------|----------|------------|-------|
| **Products (view)** | ✓ | ✓ | ✓ | ✓ |
| **Products (create)** | ✗ | ✗ | ✓ (own) | ✓ |
| **Products (edit)** | ✗ | ✗ | ✓ (own) | ✓ |
| **Products (delete)** | ✗ | ✗ | ✓ (own) | ✓ |
| **Orders (view)** | ✗ | ✓ (own) | ✓ (own) | ✓ |
| **Orders (create)** | ✓ (guest) | ✓ | ✓ | ✓ |
| **Orders (modify)** | ✗ | ✗ | ✓ (own) | ✓ |
| **Users (view)** | ✗ | ✗ | ✗ | ✓ |
| **Users (modify)** | ✗ | ✗ | ✗ | ✓ |
| **Settings (platform)** | ✗ | ✗ | ✗ | ✓ |
| **Audit logs** | ✗ | ✗ | ✗ | ✓ |
| **Analytics (platform)** | ✗ | ✗ | ✗ | ✓ |

**Best practices:**
- Assign permissions to roles, not users directly.
- Review role assignments quarterly.
- Log all role changes.
- Implement role-based UI visibility AND server-side enforcement.

### 5.3 Permission Checks

**What:** Server-side verification that the authenticated user has the required permission for the requested action.

**Why:**
- Client-side permission checks are cosmetic — they can be bypassed.
- Server-side checks are the actual security control.
- Every endpoint must independently verify permissions.

**Where:** Every API handler, every service function.

**Permission check pattern:**

```typescript
// ✓ CORRECT: Permission check in handler
export async function deleteProduct(request: Request, userId: string) {
  const productId = extractParam(request, 'productId');
  
  // 1. Fetch product
  const product = await ProductService.findById(productId);
  if (!product) return notFound();
  
  // 2. Check role permission
  const user = await UserService.findById(userId);
  if (!user) return unauthorized();
  
  // 3. Check resource ownership (for Shop Owners)
  if (user.role === 'SHOP_OWNER' && product.ownerId !== userId) {
    return forbidden('You can only delete your own products');
  }
  
  // 4. Admin check
  if (user.role !== 'ADMIN' && user.role !== 'SHOP_OWNER') {
    return forbidden('Insufficient permissions');
  }
  
  // 5. Process deletion
  await ProductService.delete(productId);
  return json({ success: true });
}
```

### 5.4 Resource Ownership

**What:** Ensuring users can only access resources they own (or have been explicitly granted access to).

**Why:**
- IDOR (Insecure Direct Object Reference) is a top vulnerability.
- Users should not access other users' orders, profiles, or data.
- Ownership checks must be server-side, not client-side.

**Where:** All user-specific resources — orders, addresses, profiles, wishlists.

**Ownership verification pattern:**

```typescript
// ✓ CORRECT: Ownership check
async function getResource(resourceId: string, userId: string) {
  const resource = await db.resource.findUnique({ where: { id: resourceId } });
  
  if (!resource) return notFound();
  
  // Check ownership OR admin
  if (resource.userId !== userId && !isAdmin(userId)) {
    return forbidden('Access denied');
  }
  
  return resource;
}
```

**Best practices:**
- Always verify ownership server-side.
- Use database queries that include userId in the WHERE clause.
- Never expose resource IDs without ownership verification.
- Log all ownership check failures.

### 5.5 Session Expiration

**What:** Automatic termination of sessions after a defined period of inactivity or absolute time.

**Why:**
- Long-lived sessions increase the risk of session hijacking.
- Abandoned sessions on shared devices are a security risk.
- Compliance requires session timeout.

**Where:** Authentication system, cookie management, session validation.

**Session expiration standards:**

| Session Type | Idle Timeout | Absolute Timeout | Renewal |
|-------------|-------------|-----------------|---------|
| **Access token** | 15 minutes | 15 minutes | Refresh token |
| **Refresh token** | 7 days | 30 days | Rotate on use |
| **Remember me** | 30 days | 90 days | Rotate on use |
| **Admin session** | 30 minutes | 8 hours | Re-authenticate |
| **Guest session** | 24 hours | 24 hours | None |

### 5.6 Device Trust

**What:** Tracking and validating devices used to access the platform.

**Why:**
- Device fingerprinting detects unauthorized device access.
- Trusted device management allows users to review their access.
- Device tracking aids forensic investigation.

**Where:** Session management, login history, account security.

**Device trust standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Fingerprinting** | Collect device, browser, OS info | Device identification |
| **New device alert** | Notify user on new device login | Security awareness |
| **Device management** | Users can view and revoke devices | User control |
| **Trusted devices** | Optionally trust devices for 30 days | User convenience |
| **Geo-logging** | Log location with each login | Forensic analysis |

### 5.7 Secure Logout

**What:** Complete termination of the user's session and all associated tokens.

**Why:**
- Incomplete logout leaves sessions active, enabling unauthorized access.
- Logout must invalidate all tokens, not just the current one.
- Shared device scenarios require complete session cleanup.

**Where:** Authentication system, cookie handling, session management.

**Secure logout process:**

```
User clicks Logout
      │
      ▼
1. Invalidate refresh token in database
      │
      ▼
2. Clear all session cookies
      │
      ▼
3. Revoke all access tokens for this session
      │
      ▼
4. Log logout event with metadata
      │
      ▼
5. Redirect to login page
```

**Best practices:**
- Logout must be a POST request (not GET) to prevent CSRF logout.
- Clear all cookies, not just the session cookie.
- Invalidate tokens server-side, not just client-side.
- Log all logout events for audit.

---

## 6. Privacy

### 6.1 Personal Data Standards

**What:** Standards for collection, processing, storage, and deletion of personal data.

**Why:**
- India's DPDP Act (Digital Personal Data Protection Act) imposes strict requirements.
- Users have rights over their personal data.
- Privacy violations can result in significant fines.

**Where:** All user data collection points, all data storage, all data processing.

**Personal data categories:**

| Category | Data Elements | Sensitivity | Protection |
|----------|--------------|-------------|------------|
| **Identity** | Name, email, phone | High | Encryption, access control |
| **Location** | IP address, shipping address | Medium | Access control |
| **Financial** | Payment tokens, transaction history | Critical | Encryption, audit |
| **Behavioral** | Browsing history, search history | Low | Anonymization |
| **Device** | User agent, device fingerprint | Low | Access control |

### 6.2 Data Minimization

**What:** Collecting only the minimum personal data necessary for the stated purpose.

**Why:**
- Less data collected = smaller attack surface = less liability.
- Data minimization is a core principle of privacy regulations.
- Users trust platforms that collect less data.

**Where:** All data collection forms, all API endpoints that accept user data.

**Data minimization rules:**

| Rule | Implementation | Rationale |
|------|---------------|-----------|
| **Purpose limitation** | Collect only what's needed for the feature | Reduce exposure |
| **Optional fields** | Mark non-essential fields as optional | User choice |
| **No hidden collection** | Don't collect data users don't know about | Transparency |
| **No third-party sharing** | Don't share data with third parties unnecessarily | Privacy |
| **Automatic deletion** | Delete data when no longer needed | Storage minimization |

### 6.3 Consent Management

**What:** Obtaining, recording, and respecting user consent for data processing.

**Why:**
- DPDP Act requires explicit consent for data processing.
- Users must know what data is collected and why.
- Consent must be freely given, specific, and revocable.

**Where:** Registration, profile updates, marketing preferences, data sharing.

**Consent standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Explicit consent** | Opt-in checkboxes, not pre-checked | Freely given |
| **Granular consent** | Separate consent for different purposes | Specific |
| **Informed consent** | Clear explanation of what data is collected | Transparency |
| **Revocable consent** | Easy mechanism to withdraw consent | User control |
| **Consent records** | Log when and what consent was given | Compliance |
| **No dark patterns** | Don't trick users into consenting | Ethical |

### 6.4 Privacy Settings

**What:** User-facing controls for managing privacy preferences.

**Why:**
- Users should control how their data is used.
- Privacy settings build trust and demonstrate compliance.
- Granular control reduces the need for blanket policies.

**Where:** User profile, account settings, marketing preferences.

**Privacy settings:**

| Setting | Default | Options | Where |
|---------|---------|---------|-------|
| **Profile visibility** | Private | Public/Private | Profile settings |
| **Email notifications** | Opt-in | On/Off per type | Notification settings |
| **Marketing emails** | Opt-in | On/Off | Marketing settings |
| **Data sharing** | Minimal | Minimal/Standard/Full | Privacy settings |
| **Activity tracking** | On | On/Off | Privacy settings |
| **Search visibility** | On | On/Off | Privacy settings |

### 6.5 Data Export

**What:** Allowing users to download all their personal data in a portable format.

**Why:**
- DPDP Act and GDPR grant users the right to data portability.
- Data export builds trust and demonstrates transparency.
- Required for account deletion (users may want their data first).

**Where:** User account settings, API endpoints.

**Data export standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Completeness** | Include all user data | Full portability |
| **Format** | JSON (machine-readable) + CSV (human-readable) | Usability |
| **Timeliness** | Generate within 24 hours of request | Responsiveness |
| **Notification** | Email user when export is ready | Communication |
| **Secure delivery** | Provide secure download link | Security |
| **Retention** | Delete export file after 7 days | Storage minimization |

**Data included in export:**

| Data Type | Format | Notes |
|-----------|--------|-------|
| Profile information | JSON | Name, email, phone |
| Addresses | JSON | All saved addresses |
| Order history | JSON + CSV | All orders with details |
| Wishlist | JSON | All saved products |
| Reviews | JSON | All written reviews |
| Activity log | JSON | Login history, actions |
| Preferences | JSON | All settings |

### 6.6 Data Deletion

**What:** Permanent removal of user data upon request or policy expiration.

**Why:**
- DPDP Act grants users the right to erasure ("right to be forgotten").
- Data deletion reduces liability and storage costs.
- Proper deletion prevents unauthorized recovery.

**Where:** Account management, compliance engine.

**Data deletion standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **User-initiated** | Account deletion in settings | User control |
| **Admin-initiated** | Account deletion by admin | Moderation |
| **Policy-based** | Auto-delete after retention period | Compliance |
| **Complete removal** | Delete from all storage systems | No data remnants |
| **Audit trail** | Log deletion request and completion | Compliance |
| **Grace period** | 30-day grace period before permanent deletion | Recovery |
| **Backup propagation** | Ensure deletion propagates to backups | Complete removal |

**Data deletion process:**

```
Deletion Request
      │
      ▼
1. Verify identity (re-authenticate)
      │
      ▼
2. Check for pending orders/transactions
      │
      ▼
3. Anonymize or delete personal data
      │
      ▼
4. Log deletion event
      │
      ▼
5. Schedule backup cleanup
      │
      ▼
6. Send confirmation email
```

**Data retention periods:**

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| **User accounts** | Until deletion request | User control |
| **Order records** | 7 years | Tax compliance (GST) |
| **Payment records** | 7 years | Financial compliance |
| **Audit logs** | 7 years | Compliance |
| **Login history** | 1 year | Security |
| **Marketing consent** | Until withdrawal | Legal |
| **Support tickets** | 3 years | Customer service |

### 6.7 Auditability

**What:** The ability to trace all data processing activities for compliance verification.

**Why:**
- Compliance regulators require proof of data handling practices.
- Auditability demonstrates accountability.
- Forensic investigation requires complete data processing records.

**Where:** All data processing activities, all data access, all data modifications.

**Auditability standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Access logging** | Log all PII access with actor and purpose | Accountability |
| **Processing logging** | Log all data processing activities | Compliance |
| **Consent logging** | Log when consent was given/withdrawn | Legal |
| **Export logging** | Log all data export requests | Compliance |
| **Deletion logging** | Log all data deletion requests | Compliance |
| **Immutable records** | Audit logs cannot be modified | Integrity |

### 6.8 User Rights

**What:** The rights granted to users over their personal data under privacy regulations.

**Why:**
- DPDP Act and GDPR grant specific rights to data subjects.
- Respecting user rights builds trust and avoids legal penalties.
- User rights must be exerciseable without excessive friction.

**Where:** User account settings, support channels, API endpoints.

**User rights:**

| Right | Description | Implementation |
|-------|-------------|----------------|
| **Right to know** | What data is collected and why | Privacy policy + data export |
| **Right to access** | Copy of all personal data | Data export feature |
| **Right to rectification** | Correct inaccurate data | Profile editing |
| **Right to erasure** | Delete personal data | Account deletion |
| **Right to portability** | Export data in portable format | Data export (JSON/CSV) |
| **Right to object** | Opt out of data processing | Privacy settings |
| **Right to withdraw consent** | Withdraw previously given consent | Privacy settings |
| **Right to non-discrimination** | No penalty for exercising rights | Business practice |

---

## 7. Infrastructure Security

### 7.1 Environment Isolation

**What:** Complete separation between development, staging, and production environments.

**Why:**
- Production data must never be exposed to development.
- Testing in production can cause outages.
- Security controls differ per environment.

**Where:** All environments — local, preview, staging, production.

**Environment isolation standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Separate databases** | Different database per environment | No cross-env data access |
| **Separate secrets** | Different secrets per environment | No secret leakage |
| **Separate domains** | Different URLs per environment | No accidental production access |
| **Network isolation** | Different Cloudflare projects | No cross-env traffic |
| **Access control** | Different access levels per environment | Least privilege |

**Environment matrix:**

| Environment | Branch | URL | Database | Secrets | Access |
|------------|--------|-----|----------|---------|--------|
| **Local** | feature/* | localhost:5173 | Local PostgreSQL | .env (local) | Developers |
| **Preview** | PR branches | *.nabome.pages.dev | Staging DB (read-only) | Staging | Reviewers |
| **Staging** | develop | staging.nabome.online | Staging DB | Staging | Team |
| **Production** | main | nabome.online | Production DB | Production | Team + Users |

### 7.2 Production Security

**What:** Security controls specific to the production environment.

**Why:**
- Production is the live environment serving real users.
- Production breaches affect real customers and revenue.
- Production security must be the strongest.

**Where:** Production environment — Cloudflare Pages, Neon, external services.

**Production security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **No debugging** | Disable debug modes, verbose logging | Prevent information leakage |
| **HTTPS only** | Force HTTPS everywhere | Encryption |
| **Security headers** | Full header set on all responses | Defense in depth |
| **Rate limiting** | Aggressive limits on public endpoints | Prevent abuse |
| **Monitoring** | Full monitoring and alerting | Detection |
| **Backup** | Encrypted backups with tested recovery | Business continuity |
| **Access control** | Restrict admin access to approved IPs | Reduce attack surface |
| **No test data** | Never use test data in production | Data integrity |

### 7.3 Development Security

**What:** Security practices for the development environment.

**Why:**
- Development environments are often less secured but can contain sensitive data.
- Development mistakes can propagate to production.
- Developer machines are common attack targets.

**Where:** Local development, feature branches, CI/CD pipeline.

**Development security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **No production data** | Use anonymized test data | Prevent data exposure |
| **Local secrets** | .env files never committed | Prevent repository leaks |
| **Code review** | All changes reviewed before merge | Catch security issues |
| **CI scanning** | Automated security scanning in CI | Early detection |
| **Dependency scanning** | Automated dependency vulnerability checks | Prevent supply chain attacks |
| **Git hooks** | Pre-commit hooks for secret detection | Prevent accidental commits |

### 7.4 Staging Security

**What:** Security practices for the staging environment.

**Why:**
- Staging is the final validation before production.
- Staging must closely mirror production security.
- Staging is used for security testing.

**Where:** Staging environment — Cloudflare Pages, Neon, external services.

**Staging security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Production mirror** | Same security controls as production | Realistic testing |
| **Test data only** | No real customer data | Data protection |
| **Monitoring** | Same monitoring as production | Detection testing |
| **Penetration testing** | Test security controls here | Validate protections |
| **Incident response testing** | Test IR procedures | Readiness |

### 7.5 Configuration Security

**What:** Secure management of all configuration files and settings.

**Why:**
- Misconfiguration is the #1 cause of security breaches.
- Configuration files often contain sensitive information.
- Inconsistent configurations across environments cause vulnerabilities.

**Where:** All configuration files, environment variables, feature flags.

**Configuration security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Version control** | Track configuration changes | Audit trail |
| **Secrets in platform** | Use Cloudflare Pages secrets | Prevent leaks |
| **Environment-specific** | Different config per environment | Isolation |
| **Validation** | Validate all config at startup | Fail fast |
| **Documentation** | Document all configuration options | Maintainability |
| **No defaults in prod** | Override all defaults for production | Security |

### 7.6 Secret Rotation

**What:** Regular rotation of all secrets and credentials.

**Why:**
- Stale secrets are a security risk — they may be compromised without detection.
- Rotation limits the exposure window of compromised secrets.
- Compliance often requires regular rotation.

**Where:** All API keys, database credentials, signing keys.

**Secret rotation schedule:**

| Secret | Rotation Frequency | Method |
|--------|-------------------|--------|
| **JWT signing key** | 90 days | Cloudflare Pages secret update |
| **Database password** | 90 days | Neon password rotation |
| **API keys** | 90 days | Service-specific rotation |
| **Webhook secrets** | On suspected compromise | Immediate rotation |
| **Encryption keys** | Annually | Key rotation process |

### 7.7 Backup Protection

**What:** Securing all backup data against unauthorized access and ensuring recoverability.

**Why:**
- Backups contain copies of all data, including sensitive information.
- Backup compromise can be as damaging as primary compromise.
- Backups must be recoverable for business continuity.

**Where:** Database backups, file storage backups, configuration backups.

**Backup protection standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Encryption** | Encrypt all backups | Data protection |
| **Access control** | Restrict backup access | Least privilege |
| **Integrity verification** | Regular backup integrity checks | Ensure recoverability |
| **Testing** | Regular backup restoration tests | Validate recoverability |
| **Retention** | Follow retention policy | Compliance |
| **Offsite storage** | Store backups in separate location | Disaster recovery |
| **Immutability** | Immutable backups (WORM) | Prevent tampering |

---

## 8. Logging & Monitoring

### 8.1 Security Events

**What:** Logging all security-relevant events for detection, investigation, and compliance.

**Why:**
- Security events provide the evidence trail for incident investigation.
- Compliance regulations require security event logging.
- Monitoring security events enables early detection of attacks.

**Where:** All authentication events, all authorization failures, all suspicious activities.

**Security event categories:**

| Category | Events | Severity | Response |
|----------|--------|----------|----------|
| **Authentication** | Login success/failure, logout, password change | Info-Warning | Log + rate limit |
| **Authorization** | Permission denied, role change, privilege escalation | Warning-Critical | Log + alert |
| **Data access** | PII access, bulk data export, admin data access | Info-Warning | Log + audit |
| **System** | Error spikes, performance degradation, configuration changes | Warning-Critical | Log + alert |
| **Attack** | Rate limit exceeded, CSRF failure, Turnstile failure | Warning-Critical | Log + block + alert |

### 8.2 Login Attempts

**What:** Logging all login attempts with contextual information.

**Why:**
- Login attempts reveal credential stuffing, brute force, and account takeover attempts.
- Users should be able to review their own login history.
- Compliance requires authentication event logging.

**Where:** Authentication system, login history table.

**Login attempt data:**

| Field | Description | Purpose |
|-------|-------------|---------|
| **userId** | User identifier | Correlation |
| **email** | Email used | Identification |
| **ipAddress** | Client IP address | Geolocation, blocking |
| **userAgent** | Browser/device info | Device identification |
| **success** | Whether login succeeded | Pattern detection |
| **failureReason** | Why login failed | Attack analysis |
| **sessionId** | Session created (if success) | Session tracking |
| **timestamp** | When login occurred | Timeline |
| **country** | IP geolocation | Anomaly detection |

### 8.3 Permission Failures

**What:** Logging all authorization failures for security monitoring.

**Why:**
- Permission failures indicate attempted unauthorized access.
- Patterns of permission failures may indicate systematic attacks.
- Permission failure logging is required for compliance.

**Where:** Authorization middleware, resource access checks.

**Permission failure data:**

| Field | Description | Purpose |
|-------|-------------|---------|
| **userId** | User attempting access | Identification |
| **resource** | Resource being accessed | Attack analysis |
| **action** | Action attempted | Attack analysis |
| **requiredPermission** | Permission needed | Gap analysis |
| **userPermission** | Permission held | Misconfiguration detection |
| **ipAddress** | Client IP | Blocking |
| **timestamp** | When failure occurred | Timeline |

### 8.4 Suspicious Activity

**What:** Detecting and logging patterns that indicate potential security threats.

**Why:**
- Individual events may be benign; patterns reveal attacks.
- Early detection prevents successful breaches.
- Suspicious activity monitoring is a compliance requirement.

**Where:** All monitoring systems, anomaly detection.

**Suspicious activity patterns:**

| Pattern | Detection | Response |
|---------|-----------|----------|
| **Multiple failed logins** | >5 failures from same IP in 10 minutes | Block IP + alert |
| **Unusual location** | Login from new country/city | Require verification |
| **Bulk data access** | >100 resource reads in 1 minute | Rate limit + alert |
| **Privilege escalation attempt** | Multiple permission denied events | Alert + investigate |
| **Webhook replay** | Duplicate webhook signatures | Reject + alert |
| **Abnormal hours** | Activity at unusual times for user | Flag for review |

### 8.5 Audit Integration

**What:** Integrating security event logging with the platform's audit system.

**Why:**
- Security events are a subset of audit events.
- Audit integration provides a complete picture of all activities.
- Compliance requires unified audit trails.

**Where:** Audit engine, security event logging, all modules.

**Audit integration standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Unified format** | All events use the same audit schema | Consistency |
| **Correlation** | Events include request ID for correlation | Investigation |
| **Immutability** | Audit records cannot be modified | Integrity |
| **Retention** | Follow retention policy per event type | Compliance |
| **Searchability** | Events indexed for fast query | Investigation |

### 8.6 Alerting

**What:** Real-time notification of security events that require human attention.

**Why:**
- Not all security events require immediate action, but some do.
- Alerting enables rapid response to active attacks.
- Alert fatigue must be avoided — only actionable events trigger alerts.

**Where:** Monitoring systems, notification channels.

**Alert severity levels:**

| Severity | Examples | Response Time | Notification |
|----------|---------|---------------|--------------|
| **Critical** | Data breach, auth bypass, ransomware | Immediate | SMS + Email + Slack |
| **High** | Account takeover, privilege escalation | 1 hour | Email + Slack |
| **Medium** | Brute force, unusual access pattern | 4 hours | Slack |
| **Low** | Rate limit exceeded, failed CSRF | 24 hours | Dashboard |

### 8.7 Incident Logs

**What:** Comprehensive logging during security incidents for investigation and response.

**Why:**
- Incident logs are critical for understanding what happened.
- Logs must be preserved before, during, and after incidents.
- Legal proceedings may require incident logs.

**Where:** All systems during incident response.

**Incident log standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Preserve logs** | Ensure logs are not overwritten | Evidence preservation |
| **Timestamp precision** | Millisecond timestamps | Accurate timeline |
| **Context capture** | Full request/response context | Investigation |
| **Chain of custody** | Document who accessed what logs | Legal |
| **Immutable storage** | Move incident logs to immutable storage | Tamper-proof |

---

## 9. Incident Response

### 9.1 Incident Detection

**What:** Automated and manual processes for identifying security incidents.

**Why:**
- Early detection limits the damage of security incidents.
- Automated detection provides 24/7 coverage.
- Manual detection catches what automation misses.

**Where:** All monitoring systems, user reports, security scanning.

**Detection sources:**

| Source | Detection Method | Examples |
|--------|-----------------|----------|
| **Automated monitoring** | Anomaly detection, threshold alerts | Unusual traffic, error spikes |
| **WAF alerts** | Cloudflare WAF rule triggers | Attack patterns, malicious requests |
| **User reports** | Support tickets, abuse reports | Account compromise, phishing |
| **Security scanning** | Automated vulnerability scans | New CVEs, misconfigurations |
| **Audit analysis** | Log analysis and correlation | Unauthorized access patterns |
| **External disclosure** | Security researcher reports | Vulnerability disclosures |

### 9.2 Investigation

**What:** Systematic analysis of security incidents to understand scope, impact, and root cause.

**Why:**
- Understanding the incident is essential for effective response.
- Investigation must be thorough but timely.
- Investigation findings improve future security.

**Where:** Incident response team, security tools, audit logs.

**Investigation process:**

```
1. Initial Assessment
   ├── What happened?
   ├── When did it happen?
   ├── What systems are affected?
   └── What data may be compromised?

2. Evidence Collection
   ├── Preserve audit logs
   ├── Capture system state
   ├── Collect network logs
   └── Interview affected parties

3. Root Cause Analysis
   ├── How did the attacker gain access?
   ├── What vulnerability was exploited?
   ├── What controls failed?
   └── What controls worked?

4. Impact Assessment
   ├── What data was accessed?
   ├── What data was modified?
   ├── What data was exfiltrated?
   └── What is the business impact?
```

### 9.3 Containment

**What:** Immediate actions to stop the incident from causing further damage.

**Why:**
- Containment limits the blast radius of an incident.
- Speed of containment directly impacts total damage.
- Containment must be carefully planned to avoid destroying evidence.

**Where:** All affected systems, network infrastructure, access controls.

**Containment strategies:**

| Strategy | When to Use | Implementation |
|----------|------------|----------------|
| **Account suspension** | Compromised user account | Disable account, revoke sessions |
| **IP blocking** | Active attack from specific IP | Cloudflare IP blocking |
| **Service isolation** | Compromised service | Network isolation |
| **Feature disable** | Vulnerable feature | Feature flag disable |
| **Credential rotation** | Compromised credentials | Emergency rotation |
| **Emergency access restriction** | Widespread compromise | Reduce access to essential only |

### 9.4 Recovery

**What:** Restoring normal operations after an incident is contained.

**Why:**
- Recovery must be methodical to prevent re-compromise.
- Recovery must verify system integrity before resuming operations.
- Users must be notified of recovery actions.

**Where:** All affected systems, user accounts, data.

**Recovery process:**

```
1. Verify Containment
   ├── Confirm attack is stopped
   ├── Verify no active persistence
   └── Confirm scope is understood

2. Restore Systems
   ├── Restore from clean backups if needed
   ├── Patch exploited vulnerabilities
   ├── Rotate all compromised credentials
   └── Verify system integrity

3. Validate Recovery
   ├── Test all critical functions
   ├── Verify data integrity
   ├── Confirm security controls are active
   └── Monitor for re-compromise

4. Resume Operations
   ├── Re-enable affected features
   ├── Notify affected users
   ├── Provide recovery instructions
   └── Monitor closely for 48 hours
```

### 9.5 Post-Incident Review

**What:** Systematic review of the incident to improve security and prevent recurrence.

**Why:**
- Every incident is a learning opportunity.
- Post-incident reviews identify gaps in security controls.
- Review findings must be implemented, not just documented.

**Where:** Incident response team, security architecture, development team.

**Post-incident review process:**

```
1. Timeline Reconstruction
   ├── Complete sequence of events
   ├── Detection time vs. occurrence time
   ├── Response time at each stage
   └── Key decisions and actions

2. Root Cause Analysis
   ├── Technical root cause
   ├── Process root cause
   ├── Human root cause
   └── Systemic root cause

3. Control Assessment
   ├── What controls worked?
   ├── What controls failed?
   ├── What controls were missing?
   └── What controls need improvement?

4. Action Items
   ├── Immediate fixes (within 1 week)
   ├── Short-term improvements (within 1 month)
   ├── Long-term enhancements (within 1 quarter)
   └── Assigned owners and deadlines

5. Lessons Learned
   ├── What went well?
   ├── What could be improved?
   ├── What surprised us?
   └── What should we change?
```

### 9.6 Evidence Preservation

**What:** Secure preservation of all evidence related to a security incident.

**Why:**
- Evidence may be needed for legal proceedings.
- Evidence preservation ensures investigation integrity.
- Tampered evidence is inadmissible.

**Where:** All incident-related data, logs, and artifacts.

**Evidence preservation standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Chain of custody** | Document who accessed evidence | Legal admissibility |
| **Immutable storage** | Write-once storage for evidence | Tamper-proof |
| **Timestamping** | Cryptographic timestamps | Integrity |
| **Access control** | Restrict evidence access | Confidentiality |
| **Documentation** | Document all preservation actions | Audit trail |
| **Retention** | Retain evidence per legal requirements | Legal compliance |

---

## 10. Compliance

### 10.1 Privacy Regulations

**What:** Compliance with India's Digital Personal Data Protection Act (DPDP) and international privacy regulations.

**Why:**
- DPDP Act imposes significant obligations on data fiduciaries.
- Non-compliance can result in fines up to ₹250 crore.
- Privacy compliance builds user trust.

**Where:** All data processing activities, all user-facing features.

**DPDP compliance checklist:**

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| **Consent** | Explicit opt-in consent for data collection | Required |
| **Purpose limitation** | Data used only for stated purpose | Required |
| **Data minimization** | Collect only necessary data | Required |
| **Notice** | Clear privacy policy explaining data practices | Required |
| **Access rights** | Users can access their data | Required |
| **Correction rights** | Users can correct inaccurate data | Required |
| **Erasure rights** | Users can request data deletion | Required |
| **Grievance officer** | Designated officer for complaints | Required |
| **Breach notification** | Notify authority within 72 hours | Required |
| **Cross-border transfer** | Ensure adequate protection for transfers | Required |

### 10.2 Financial Compliance

**What:** Compliance with Indian financial regulations for payment processing.

**Why:**
- RBI guidelines govern payment processing in India.
- GST Act requires specific record-keeping.
- Non-compliance can result in penalties and license revocation.

**Where:** Payment processing, financial records, tax calculations.

**Financial compliance standards:**

| Regulation | Requirement | Implementation |
|-----------|-------------|----------------|
| **RBI guidelines** | KYC for high-value transactions | KYC verification for shop owners |
| **RBI guidelines** | Secure payment processing | PCI DSS compliance via Razorpay |
| **RBI guidelines** | Transaction limits | Enforce transaction limits |
| **GST Act** | Invoice generation | Generate GST-compliant invoices |
| **GST Act** | 7-year record retention | Retain financial records for 7 years |
| **Income Tax Act** | TDS compliance | TDS deduction and reporting |
| **Companies Act** | Financial record keeping | Maintain complete financial records |

### 10.3 Audit Requirements

**What:** Meeting audit requirements through comprehensive logging and documentation.

**Why:**
- Internal and external audits verify security and compliance.
- Audit readiness reduces audit cost and disruption.
- Audit findings must be addressed promptly.

**Where:** All systems, all processes, all documentation.

**Audit readiness checklist:**

| Area | Requirement | Implementation |
|------|-------------|----------------|
| **Access control** | Document who has access to what | RBAC documentation |
| **Data handling** | Document how data is processed | Data flow documentation |
| **Security controls** | Document all security measures | Security architecture |
| **Incident response** | Document IR procedures | IR playbook |
| **Change management** | Document all changes | Git history + PRs |
| **Business continuity** | Document BC/DR procedures | BC/DR plan |
| **Vendor management** | Document third-party risks | Vendor assessment |

### 10.4 Data Retention

**What:** Policies and procedures for retaining and deleting data according to legal requirements.

**Why:**
- Different data types have different retention requirements.
- Retaining data longer than necessary increases liability.
- Deleting data too early violates compliance.

**Where:** All data storage systems, all data processing activities.

**Data retention policy:**

| Data Type | Retention Period | Legal Basis | Deletion Method |
|-----------|-----------------|-------------|-----------------|
| **User accounts** | Until deletion request | User right | Soft delete → hard delete |
| **Order records** | 7 years | GST Act | Automated archival |
| **Payment records** | 7 years | RBI guidelines | Automated archival |
| **Audit logs** | 7 years | Compliance | Automated archival |
| **Login history** | 1 year | Security | Automated deletion |
| **Marketing consent** | Until withdrawal | DPDP Act | Automated deletion |
| **Support tickets** | 3 years | Customer service | Automated deletion |
| **Analytics data** | 3 years | Business | Anonymization |

### 10.5 Business Record Protection

**What:** Ensuring business records remain intact, accessible, and compliant throughout their lifecycle.

**Why:**
- Business records are legal evidence of transactions.
- Records must be tamper-proof for audit and legal purposes.
- Records must be retrievable when needed.

**Where:** All business records — orders, payments, invoices, communications.

**Business record protection standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Immutability** | Append-only records for financial data | Tamper-proof |
| **Integrity checks** | Checksums on critical records | Detect tampering |
| **Secure storage** | Encrypted storage with access control | Protection |
| **Backup** | Regular encrypted backups | Business continuity |
| **Retrieval** | Indexed for fast retrieval | Operational need |
| **Archival** | Move old records to cold storage | Cost optimization |

### 10.6 Legal Hold Readiness

**What:** The ability to preserve all data relevant to a legal matter.

**Why:**
- Legal proceedings may require preservation of specific data.
- Destruction of evidence is illegal.
- Legal hold must be implemented before it's needed.

**Where:** All data storage systems, all deletion processes.

**Legal hold standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Hold mechanism** | Ability to freeze data deletion | Evidence preservation |
| **Scope definition** | Define what data to preserve | Targeted preservation |
| **Notification** | Notify relevant parties of hold | Compliance |
| **Duration** | Maintain hold until released | Legal requirement |
| **Verification** | Verify hold is effective | Assurance |
| **Documentation** | Document all hold actions | Audit trail |

---

## 11. Permissions

### 11.1 Customer Permissions

**What:** Access control for registered customers.

**Why:**
- Customers need access to their own data and purchasing features.
- Customers must not access other customers' data or platform administration.

**Where:** Storefront, account management, order history.

**Customer permissions:**

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **Own profile** | ✓ | — | ✓ | ✓ (account) |
| **Own addresses** | ✓ | ✓ | ✓ | ✓ |
| **Own orders** | ✓ | ✓ | — | — |
| **Own wishlist** | ✓ | ✓ | — | ✓ |
| **Own reviews** | ✓ | ✓ | ✓ | ✓ |
| **Products** | ✓ | — | — | — |
| **Cart** | ✓ | ✓ | ✓ | ✓ |
| **Other users' data** | ✗ | ✗ | ✗ | ✗ |
| **Admin panel** | ✗ | ✗ | ✗ | ✗ |
| **Platform settings** | ✗ | ✗ | ✗ | ✗ |

### 11.2 Shop Owner Permissions

**What:** Access control for shop owners (future marketplace sellers).

**Why:**
- Shop owners need business management capabilities.
- Shop owners must only access their own listings and data.
- Shop owners must not access platform administration.

**Where:** Seller dashboard, product management, sales analytics.

**Shop owner permissions:**

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **All Customer permissions** | ✓ | ✓ | ✓ | ✓ |
| **Own products** | ✓ | ✓ | ✓ | ✓ |
| **Own inventory** | ✓ | — | ✓ | — |
| **Own sales data** | ✓ | — | — | — |
| **Own analytics** | ✓ | — | — | — |
| **Other sellers' data** | ✗ | ✗ | ✗ | ✗ |
| **Platform settings** | ✗ | ✗ | ✗ | ✗ |
| **Admin panel** | ✗ | ✗ | ✗ | ✗ |

### 11.3 Admin Permissions

**What:** Access control for platform administrators.

**Why:**
- Admins need full platform access for operations.
- Admin access must be logged and audited.
- Admin actions must require additional verification.

**Where:** Admin panel, user management, platform configuration.

**Admin permissions:**

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **All platform data** | ✓ | ✓ | ✓ | ✓ |
| **User management** | ✓ | — | ✓ | ✓ |
| **Product management** | ✓ | ✓ | ✓ | ✓ |
| **Order management** | ✓ | — | ✓ | ✓ |
| **Financial data** | ✓ | — | ✓ | — |
| **Audit logs** | ✓ | — | — | — |
| **Platform settings** | ✓ | ✓ | ✓ | — |
| **Analytics** | ✓ | — | — | — |

### 11.4 System Service Permissions

**What:** Access control for automated system processes and services.

**Why:**
- System services need specific permissions to function.
- System service permissions must be scoped to exact requirements.
- System service access must be logged and auditable.

**Where:** Background jobs, webhooks, scheduled tasks, integrations.

**System service permissions:**

| Service | Permissions | Access Pattern |
|---------|-------------|---------------|
| **Email service** | Read user email, send email | On trigger |
| **Payment webhook** | Update payment status | On webhook |
| **Order processor** | Read orders, update order status | On schedule |
| **Notification service** | Read user preferences, send notifications | On trigger |
| **Audit logger** | Write audit records | On event |
| **Analytics service** | Read aggregated data | On schedule |
| **Backup service** | Read all data | On schedule |

---

## 12. Security Performance

### 12.1 Secure Performance

**What:** Maintaining strong security without degrading user experience or system performance.

**Why:**
- Security measures that slow down the system will be bypassed or removed.
- Performance degradation can itself be a security issue (DoS).
- Security and performance must coexist.

**Where:** All security controls, all API endpoints, all user interactions.

**Secure performance standards:**

| Control | Performance Target | Implementation |
|---------|-------------------|----------------|
| **Authentication** | < 100ms for token validation | JWT with short expiry, cached public keys |
| **Authorization** | < 10ms per request | Role/permission caching |
| **Input validation** | < 5ms per request | Optimized Zod schemas |
| **Rate limiting** | < 1ms per request | KV-based counters |
| **Encryption** | < 10ms overhead | Hardware-accelerated TLS |
| **CSRF validation** | < 1ms per request | Timing-safe comparison |
| **Audit logging** | Non-blocking (async) | Background queue |
| **Logging** | < 5ms overhead | Structured logging |

### 12.2 Encryption Performance

**What:** Optimizing encryption operations for minimal performance impact.

**Why:**
- Encryption is computationally expensive.
- Encryption must not become a bottleneck.
- Hardware acceleration should be leveraged where available.

**Where:** TLS termination, data encryption, password hashing.

**Encryption performance standards:**

| Operation | Target | Optimization |
|-----------|--------|-------------|
| **TLS handshake** | < 50ms | Session resumption, 0-RTT |
| **JWT signing** | < 1ms | HMAC-SHA256 (fast) |
| **JWT validation** | < 1ms | Signature verification |
| **Password hashing** | < 100ms | bcrypt cost 12 |
| **Data encryption** | < 10ms per record | AES-256-GCM |

### 12.3 Authentication Performance

**What:** Optimizing authentication operations for fast, responsive login experiences.

**Why:**
- Slow login experiences drive users away.
- Authentication is the most frequent security operation.
- Authentication performance directly impacts user satisfaction.

**Where:** Login, registration, token validation, session management.

**Authentication performance standards:**

| Operation | Target | Implementation |
|-----------|--------|---------------|
| **Login** | < 500ms total | Parallel validation, async logging |
| **Registration** | < 1s total | Async email verification |
| **Token validation** | < 10ms | JWT validation (no DB call) |
| **Session check** | < 5ms | Cookie validation only |
| **Password reset** | < 2s total | Async email, immediate response |

### 12.4 Logging Performance

**What:** Optimizing security logging for minimal performance impact.

**Why:**
- Synchronous logging creates bottlenecks.
- Logging must not block user requests.
- Logging must be reliable despite being asynchronous.

**Where:** All security event logging, audit logging.

**Logging performance standards:**

| Operation | Target | Implementation |
|-----------|--------|---------------|
| **Event emission** | < 1ms | Fire-and-forget |
| **Queue processing** | < 100ms latency | Background worker |
| **Database write** | < 50ms | Batch inserts |
| **Log query** | < 200ms | Indexed queries |
| **Archive** | Non-blocking | Scheduled job |

### 12.5 Monitoring Performance

**What:** Optimizing security monitoring for real-time detection without performance degradation.

**Why:**
- Real-time monitoring requires processing large volumes of data.
- Monitoring must not impact user-facing performance.
- Monitoring must be cost-effective.

**Where:** All monitoring systems, alerting, anomaly detection.

**Monitoring performance standards:**

| Operation | Target | Implementation |
|-----------|--------|---------------|
| **Event ingestion** | < 10ms | Streaming pipeline |
| **Anomaly detection** | < 1s | Real-time aggregation |
| **Alert generation** | < 30s | Threshold monitoring |
| **Dashboard update** | < 5s | Pre-aggregated metrics |
| **Report generation** | < 30s | Cached queries |

---

## 13. Accessibility

### 13.1 Beginner-Friendly Security

**What:** Making security features understandable and easy to use for non-technical users.

**Why:**
- Security that is confusing will be bypassed.
- Users who don't understand security features won't use them.
- Accessibility is a legal requirement and ethical obligation.

**Where:** All user-facing security features — login, password reset, privacy settings.

**Beginner-friendly security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Clear language** | Avoid jargon, use plain English | Understandability |
| **Progressive disclosure** | Show basic options first, advanced later | Reduced overwhelm |
| **Help text** | Explain why security features exist | Education |
| **Visual feedback** | Clear success/error messages | Feedback |
| **Undo capability** | Allow reversing security changes | Recovery |
| **Defaults** | Secure by default, opt-out for less security | Safety net |

### 13.2 Mobile-Friendly Security

**What:** Ensuring security features work well on mobile devices.

**Why:**
- 70%+ of Nabome traffic is from mobile.
- Security features that don't work on mobile will be bypassed.
- Mobile-specific security considerations must be addressed.

**Where:** All security features on mobile devices.

**Mobile security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Touch-friendly** | Large tap targets for security actions | Usability |
| **Biometric support** | Fingerprint/face recognition for login | Convenience + security |
| **Secure keyboard** | Prevent autocomplete for sensitive fields | Security |
| **Screen lock** | Require device screen lock | Device security |
| **Session management** | Handle background/foreground transitions | Security |
| **Clipboard protection** | Clear clipboard after sensitive copy | Security |

### 13.3 Accessible Security

**What:** Ensuring security features are accessible to users with disabilities.

**Why:**
- Security features must be usable by everyone.
- Accessibility is a legal requirement (ADA, WCAG).
- Accessible security benefits all users.

**Where:** All security interfaces, all security notifications.

**Accessible security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Screen reader support** | ARIA labels for all security elements | Blind users |
| **Keyboard navigation** | All security features accessible via keyboard | Motor disabilities |
| **Color contrast** | WCAG AA contrast for security indicators | Visual impairments |
| **Error messages** | Clear, descriptive error messages | Cognitive disabilities |
| **Timeout warnings** | Warn before session expiry | Cognitive disabilities |
| **Alternative text** | Descriptive alt text for security images | Blind users |

### 13.4 Clear Security Communication

**What:** Communicating security information clearly to users.

**Why:**
- Users need to understand security risks and protections.
- Clear communication builds trust.
- Confusing communication leads to user errors.

**Where:** Privacy policy, security notifications, error messages.

**Clear communication standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Privacy policy** | Plain language, short sentences | Understandability |
| **Security notifications** | Explain what happened and what to do | Actionability |
| **Error messages** | Explain the problem and solution | Helpfulness |
| **Security indicators** | Visual lock icons, HTTPS indicators | Awareness |
| **Consent requests** | Explain what is being consented to | Transparency |

### 13.5 Recoverable Security

**What:** Ensuring users can recover from security issues without losing access.

**Why:**
- Lockouts and data loss erode trust.
- Recovery mechanisms must be secure but accessible.
- Users must not be permanently locked out due to security measures.

**Where:** Account recovery, password reset, session management.

**Recoverable security standards:**

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Password reset** | Email-based reset with secure link | Account recovery |
| **Account recovery** | Support-assisted recovery with identity verification | Lost access recovery |
| **Session recovery** | Re-login after session expiry | User convenience |
| **Data recovery** | Soft delete with recovery window | Accidental deletion recovery |
| **MFA recovery** | Backup codes for MFA | Lost device recovery |

---

## 14. Future Readiness

### 14.1 MFA (Multi-Factor Authentication)

**What:** Architecture for supporting TOTP-based two-factor authentication.

**Why:**
- MFA significantly reduces account compromise risk.
- Enterprise customers require MFA.
- MFA is a compliance requirement for financial data.

**Where:** Authentication system, user security settings.

**MFA architecture readiness:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **TOTP generation** | Standard TOTP (RFC 6238) | Phase 2 |
| **QR code provisioning** | otpauth:// URI format | Phase 2 |
| **Backup codes** | 10 one-time use codes | Phase 2 |
| **Recovery flow** | Backup code or support-assisted | Phase 2 |
| **Device management** | Users can manage MFA devices | Phase 2 |

### 14.2 Passkeys

**What:** Architecture for supporting WebAuthn FIDO2 passkeys.

**Why:**
- Passkeys are the future of passwordless authentication.
- Passkeys provide stronger security than passwords.
- Industry adoption is accelerating.

**Where:** Authentication system, device management.

**Passkey architecture readiness:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Registration** | WebAuthn credential creation | Phase 3 |
| **Authentication** | WebAuthn credential assertion | Phase 3 |
| **Cross-device** | Hybrid transport (QR + BLE) | Phase 3 |
| **Platform authenticators** | Touch ID, Face ID, Windows Hello | Phase 3 |
| **Backup/sync** | Platform key sync (iCloud, Google) | Phase 3 |

### 14.3 Hardware Keys

**What:** Architecture for supporting FIDO2 security keys (YubiKey, Titan).

**Why:**
- Hardware keys provide the strongest phishing-resistant authentication.
- Required for high-security environments.
- Some compliance frameworks require hardware keys.

**Where:** Authentication system, enterprise features.

**Hardware key architecture readiness:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Registration** | WebAuthn with hardware key | Phase 4 |
| **Multiple keys** | Support multiple hardware keys per user | Phase 4 |
| **Enterprise provisioning** | Bulk key provisioning | Phase 5 |
| **Key management** | Admin-managed key policies | Phase 5 |

### 14.4 Risk-Based Authentication

**What:** Architecture for adaptive authentication based on risk signals.

**Why:**
- Risk-based auth balances security with user experience.
- Low-risk actions require less verification.
- High-risk actions require additional verification.

**Where:** Authentication system, authorization middleware.

**Risk-based auth architecture:**

| Risk Level | Signals | Response |
|-----------|---------|----------|
| **Low** | Known device, usual location, normal hours | Standard auth |
| **Medium** | New device OR unusual location OR unusual hours | Step-up verification |
| **High** | New device AND unusual location AND unusual hours | MFA required |
| **Critical** | Multiple risk signals, known attack pattern | Block + alert |

**Risk signals:**

| Signal | Weight | Source |
|--------|--------|--------|
| **Device fingerprint** | High | Browser/device API |
| **IP geolocation** | Medium | GeoIP database |
| **Login time** | Low | Timestamp |
| **Account age** | Low | Account data |
| **Recent activity** | Medium | Activity log |
| **Failed attempts** | High | Auth history |

### 14.5 AI Threat Detection

**What:** Architecture for AI-powered threat detection and response.

**Why:**
- AI can detect patterns humans miss.
- AI can respond to threats faster than humans.
- AI can adapt to evolving attack patterns.

**Where:** Monitoring systems, anomaly detection, incident response.

**AI threat detection architecture:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Anomaly detection** | ML-based behavioral analysis | Phase 4 |
| **Pattern recognition** | Attack pattern detection | Phase 4 |
| **Automated response** | AI-triggered containment actions | Phase 5 |
| **Threat intelligence** | External threat feed integration | Phase 5 |
| **Predictive analysis** | Predictive risk scoring | Phase 5 |

### 14.6 SIEM Integration

**What:** Architecture for integration with Security Information and Event Management systems.

**Why:**
- SIEM provides centralized security monitoring.
- SIEM enables correlation across multiple data sources.
- Enterprise customers require SIEM integration.

**Where:** Logging systems, monitoring infrastructure.

**SIEM integration architecture:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Log format** | CEF/LEEF format for SIEM ingestion | Phase 3 |
| **Event streaming** | Real-time event streaming to SIEM | Phase 3 |
| **Dashboards** | Pre-built SIEM dashboards | Phase 4 |
| **Correlation rules** | SIEM correlation rules for Nabome events | Phase 4 |
| **Alert integration** | SIEM alerts to incident response | Phase 5 |

### 14.7 Security Automation

**What:** Architecture for automating security operations.

**Why:**
- Automation reduces response time.
- Automation reduces human error.
- Automation enables consistent security operations.

**Where:** Incident response, vulnerability management, compliance.

**Security automation architecture:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Automated scanning** | Scheduled vulnerability scanning | Phase 3 |
| **Auto-remediation** | Auto-fix for known vulnerability patterns | Phase 4 |
| **Compliance automation** | Automated compliance checks | Phase 4 |
| **Incident automation** | Automated initial response actions | Phase 5 |
| **Reporting automation** | Automated compliance reports | Phase 4 |

### 14.8 Compliance Automation

**What:** Architecture for automating compliance monitoring and reporting.

**Why:**
- Manual compliance is expensive and error-prone.
- Automation provides continuous compliance visibility.
- Automation enables proactive compliance management.

**Where:** Compliance engine, audit system.

**Compliance automation architecture:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Continuous monitoring** | Real-time compliance status | Phase 3 |
| **Policy enforcement** | Automated policy checks | Phase 4 |
| **Evidence collection** | Automated evidence gathering | Phase 4 |
| **Report generation** | Automated compliance reports | Phase 4 |
| **Remediation tracking** | Automated remediation workflows | Phase 5 |

### 14.9 Vulnerability Management

**What:** Architecture for systematic vulnerability discovery and remediation.

**Why:**
- Vulnerabilities are inevitable — management is key.
- Timely remediation reduces risk.
- Vulnerability management is a compliance requirement.

**Where:** All systems, all dependencies, all configurations.

**Vulnerability management architecture:**

| Component | Design | Implementation Timeline |
|-----------|--------|------------------------|
| **Dependency scanning** | Automated dependency vulnerability checks | Phase 2 |
| **SAST** | Static application security testing | Phase 3 |
| **DAST** | Dynamic application security testing | Phase 4 |
| **Container scanning** | Container image vulnerability scanning | Phase 4 |
| **Penetration testing** | Regular penetration testing | Phase 3 |
| **Bug bounty** | Responsible disclosure program | Phase 5 |

---

## 15. Mandatory Rules for AI Agents

### 15.1 Security Architecture Rules

Every AI agent working on the Nabome codebase MUST follow these rules:

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **Never implement a feature without security considerations** | Security is not optional |
| 2 | **Never skip input validation on any endpoint** | The #1 vulnerability in the previous codebase |
| 3 | **Never store secrets in code or .env committed to git** | Critical vulnerability from previous codebase |
| 4 | **Never use client-side only validation** | Client validation is bypassable |
| 5 | **Never skip CSRF protection on state-changing endpoints** | Critical vulnerability from previous codebase |
| 6 | **Never skip rate limiting on public endpoints** | High vulnerability from previous codebase |
| 7 | **Never store tokens in localStorage** | High vulnerability from previous codebase |
| 8 | **Never skip authentication on protected endpoints** | Zero trust principle |
| 9 | **Never skip authorization checks** | Every endpoint must verify permissions |
| 10 | **Never trust user input** | All input must be validated server-side |
| 11 | **Never expose stack traces or internal errors to users** | Information disclosure |
| 12 | **Never log sensitive data** | Passwords, tokens, keys must never appear in logs |
| 13 | **Never use raw SQL with string interpolation** | SQL injection prevention |
| 14 | **Never use `dangerouslySetInnerHTML` without DOMPurify** | XSS prevention |
| 15 | **Never hardcode security decisions** | Security must be configurable |

### 15.2 Pre-Implementation Security Checklist

Before implementing any feature, AI agents MUST verify:

```markdown
## Security Checklist

- [ ] Input validation schema defined (Zod)
- [ ] Authentication requirement defined (public/protected)
- [ ] Authorization rules defined (role + ownership)
- [ ] CSRF protection enabled (if state-changing)
- [ ] Rate limiting configured
- [ ] Error handling defined (no internal errors exposed)
- [ ] Audit logging defined (what events to log)
- [ ] Data sensitivity classified
- [ ] Encryption requirements identified
- [ ] Retention policy defined
```

### 15.3 Post-Implementation Security Checklist

After implementing any feature, AI agents MUST verify:

```markdown
## Security Verification

- [ ] All inputs validated with Zod schemas
- [ ] All endpoints have authentication
- [ ] All endpoints have authorization
- [ ] CSRF protection working on mutations
- [ ] Rate limiting active on public endpoints
- [ ] No secrets in code
- [ ] No sensitive data in logs
- [ ] Error messages don't expose internals
- [ ] Security headers present on responses
- [ ] Audit events logged for sensitive actions
```

### 15.4 Code Review Security Focus

When reviewing code, AI agents MUST check for:

| Check | What to Look For |
|-------|-----------------|
| **Input validation** | Are all inputs validated with Zod? |
| **Authentication** | Is the endpoint properly authenticated? |
| **Authorization** | Are permissions checked? Is ownership verified? |
| **Secrets** | Are there any hardcoded secrets? |
| **SQL injection** | Is any raw SQL used with user input? |
| **XSS** | Is dangerouslySetInnerHTML used without sanitization? |
| **CSRF** | Is CSRF protection enabled on mutations? |
| **Error handling** | Are errors handled without exposing internals? |
| **Logging** | Is sensitive data being logged? |
| **Rate limiting** | Is rate limiting applied? |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | August 03, 2026 | Initial comprehensive security architecture |

---

## References

| Document | Relationship |
|----------|-------------|
| ARCHITECTURE.md (v3.0) | Master engineering blueprint — this document extends security coverage |
| IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0) | IAM architecture — this document adds security hardening |
| API_SERVICE_ARCHITECTURE.md (v1.0) | API standards — this document adds API security standards |
| AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md (v1.0) | Audit engine — this document adds compliance requirements |
| PAYMENT_ENGINE_ARCHITECTURE.md (v1.0) | Payment security — this document adds financial compliance |
| DATABASE_ARCHITECTURE.md (v1.0) | Database design — this document adds data security |
| TECH_STACK.md (v1.0) | Technology choices — this document adds security technology requirements |
