# নবME (Nabome) — Master Architecture Blueprint & Final Design Document

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for the consolidated Nabome Commerce OS architecture. It performs the official master review, gap analysis, conflict detection, dependency review, and validation of all 44 approved architecture documents, and registers the canonical resolution for every detected issue.
> **Supersedes:** None as a source document. This document *consolidates* all 44 architecture documents listed in Section 2.1. Where any approved document conflicts with another, the canonical resolution registered in this document (Sections 4–8, Appendix B) wins. Where a document is silent, its approved content remains in force.
> **Applies to:** All implementation agents, reviewers, and AI agents working on নবME (Nabome).

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026
**Author:** Nabome Architecture Team

---

## Table of Contents

1. [Document Purpose & Authority](#1-document-purpose--authority)
2. [Master Review Summary](#2-master-review-summary)
3. [Gap Analysis](#3-gap-analysis)
4. [Conflict Detection — Issue Registry](#4-conflict-detection--issue-registry)
5. [Consolidated Architecture](#5-consolidated-architecture)
6. [Enterprise Blueprint](#6-enterprise-blueprint)
7. [Dependency Model](#7-dependency-model)
8. [Governance Summary](#8-governance-summary)
9. [Implementation Readiness Report](#9-implementation-readiness-report)
10. [Mandatory Rules for AI Agents](#10-mandatory-rules-for-ai-agents)

**Appendices**

- [Appendix A — Issue Registry Index](#appendix-a--issue-registry-index)
- [Appendix B — Canonical Enum & Standard Registry](#appendix-b--canonical-enum--standard-registry)
- [Appendix C — Glossary](#appendix-c--glossary)

---

# 1. Document Purpose & Authority

## 1.1 Purpose

নবME (Nabome) is a **premium Commerce Operating System** — a modular, enterprise-grade platform built on Cloudflare's edge infrastructure with React on the frontend and PostgreSQL on the backend (ARCHITECTURE.md v3.0 §1.1). The platform is defined by **44 approved architecture documents** (all Version 1.0–3.0, dated August 03, 2026), each declaring itself the "single source of truth" for its domain.

This document is the **official master architecture review, gap analysis, conflict resolution, and final blueprint** for that body of work. It:

1. Reviews every one of the 44 documents for correctness, completeness, consistency, and cross-document conflict.
2. Registers **every detected issue** with Description, Severity, Impact, Recommended Resolution, and Affected Modules (Section 4).
3. Defines the **Consolidated Architecture** (Section 5), **Enterprise Blueprint** (Section 6), and **Dependency Model** (Section 7) that implementation agents must follow.
4. Records the **Governance Summary** (Section 8) and **Implementation Readiness Report** (Section 9).
5. Ends with the consolidated **Mandatory Rules for AI Agents** (Section 10).

This document does **not** redesign approved systems, add features, or design UI screens. It preserves the approved architecture, mobile-first philosophy, premium UX, enterprise scalability, and modularity; eliminates duplication; and resolves conflicts **without creating new conflicts**.

## 1.2 Authority & Precedence

The GOVERNANCE_CONSTITUTION.md §1.5 defines the canonical precedence chain, which this document registers as binding:

```
GOVERNANCE_CONSTITUTION.md        →  How decisions are made
ARCHITECTURE.md (v3.0)            →  System architecture
ENGINEERING_HANDBOOK.md (v1.0)    →  Engineering standards
{TOPIC}_ARCHITECTURE.md (v1.x)    →  Domain standards
ADR-NNNN                          →  Approved decision records
Task prompt                       →  Never contradicts the above
```

Conflict rules (GOVERNANCE_CONSTITUTION.md §1.5): **specificity wins**; **recency within lineage**; **ADR overrides**; **escalation** to the next tier.

**This document's authority:** Where two or more approved documents contradict each other, this blueprint's registered resolution (Section 4, Appendix B) is **binding on all agents** until the owning document is amended via the governance change process (Section 8). This is an adjudication authority, not a redesign authority: the blueprint never invents new architecture — it selects the canonical option among the approved documents' own definitions, citing the winner and the amendment required for the losers.

## 1.3 Scope & Method

- **Scope:** All 44 Markdown documents in `/Users/tanmoymondal/nabome/` (listed in Section 2.1), ~4.3 MB, ~90,000 lines.
- **Method:** Each document was read end-to-end by cross-document auditors; every issue quoted below was verified verbatim against the source file with section references. Findings were cross-verified across document groups (foundation, data/infra, identity/security, commerce core, money/logistics, content/CX, customer lifecycle, UX system, platform services, automation/API, dashboards).
- **Output:** Issue Registry (Section 4) with 110 registered issues (109 unique — UX-12 is a duplicate of ML-01), Consolidated Architecture (Section 5), Enterprise Blueprint (Section 6), Dependency Model (Section 7), Governance Summary (Section 8), Implementation Readiness Report (Section 9), and the Canonical Enum & Standard Registry (Appendix B).

## 1.4 Severity Levels

| Severity | Definition | Action required |
|---|---|---|
| **Critical** | Blocks implementation or introduces security, compliance, financial-integrity, or data-loss risk. | Must be resolved before any implementation of the affected module. |
| **High** | Contradicts approved architecture in a way that will produce incorrect behavior, data divergence, or cross-module failure if implemented as written. | Must be resolved in the first implementation slice of the affected module. |
| **Medium** | Wording/value drift, ownership ambiguity, or contract gap that creates implementation ambiguity but has a safe default. | Resolve during implementation; register an ADR if the choice diverges. |
| **Low** | Doc-hygiene: typos, broken references, duplication, stale examples. | Fix opportunistically; no behavior impact. |

---

# 2. Master Review Summary

## 2.1 Document Inventory

All 44 documents, grouped by domain. All are Version 1.0 (except ARCHITECTURE.md v3.0), dated August 03, 2026, Status: Active — All AI agents must follow this document.

| # | Document | Domain |
|---|---|---|
| 1 | ARCHITECTURE.md (v3.0) | Foundation — System Architecture |
| 2 | TECH_STACK.md | Foundation — Technology Stack |
| 3 | FOLDER_ARCHITECTURE.md | Foundation — Code Structure |
| 4 | ENGINEERING_HANDBOOK.md | Foundation — Engineering Standards |
| 5 | GOVERNANCE_CONSTITUTION.md | Foundation — Governance |
| 6 | DATABASE_ARCHITECTURE.md | Data & Infrastructure |
| 7 | STORAGE_ENGINE_ARCHITECTURE.md | Data & Infrastructure |
| 8 | PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md | Data & Infrastructure |
| 9 | QA_TESTING_RELEASE_ARCHITECTURE.md | Data & Infrastructure |
| 10 | DATA_LIFECYCLE_ENGINE_ARCHITECTURE.md | Data & Infrastructure — Platform Services |
| 11 | IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md | Identity & Security |
| 12 | IDENTITY_NAMING_ARCHITECTURE.md | Identity & Security |
| 13 | SECURITY_ARCHITECTURE.md | Identity & Security |
| 14 | AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md | Identity & Security — Platform Services |
| 15 | PRODUCT_ENGINE_ARCHITECTURE.md | Commerce Core |
| 16 | CATALOG_ARCHITECTURE.md | Commerce Core |
| 17 | VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md | Commerce Core |
| 18 | SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md | Commerce Core |
| 19 | ORDER_MANAGEMENT_ARCHITECTURE.md | Commerce Core |
| 20 | PAYMENT_ENGINE_ARCHITECTURE.md | Money & Logistics |
| 21 | FINANCE_ENGINE_ARCHITECTURE.md | Money & Logistics |
| 22 | SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md | Money & Logistics |
| 23 | NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md | Platform Services |
| 24 | DOCUMENT_ENGINE_ARCHITECTURE.md | Platform Services |
| 25 | EXPORT_REPORTING_BI_ENGINE_ARCHITECTURE.md | Platform Services |
| 26 | AUTOMATION_WORKFLOW_ENGINE_ARCHITECTURE.md | Platform Services |
| 27 | SYSTEM_CONFIGURATION_ARCHITECTURE.md | Platform Services |
| 28 | API_SERVICE_ARCHITECTURE.md | Platform Services |
| 29 | API_INTEGRATION_ARCHITECTURE.md | Platform Services |
| 30 | CMS_ENGINE_ARCHITECTURE.md | Content & CX |
| 31 | HOMEPAGE_BUILDER_ARCHITECTURE.md | Content & CX |
| 32 | SEARCH_ENGINE_ARCHITECTURE.md | Content & CX |
| 33 | CUSTOMER_EXPERIENCE_ARCHITECTURE.md | Content & CX |
| 34 | CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md | Customer Lifecycle |
| 35 | CUSTOMER_FEEDBACK_REVIEWS_RATINGS_QUESTIONS_ARCHITECTURE.md | Customer Lifecycle |
| 36 | CUSTOMER_RESOLUTION_ENGINE_ARCHITECTURE.md | Customer Lifecycle |
| 37 | UX_ARCHITECTURE.md | UX System |
| 38 | DESIGN_SYSTEM_ARCHITECTURE.md | UX System |
| 39 | COMPONENT_LIBRARY_ARCHITECTURE.md | UX System |
| 40 | NAVIGATION_ARCHITECTURE.md | UX System |
| 41 | RESPONSIVE_LAYOUT_ARCHITECTURE.md | UX System |
| 42 | SHOP_OWNER_DASHBOARD_ARCHITECTURE.md | Dashboards |
| 43 | ADMIN_DASHBOARD_ARCHITECTURE.md | Dashboards |
| 44 | README_EARLY.md | Historical — superseded by active docs (per GOVERNANCE_CONSTITUTION.md Appendix A) |

## 2.2 Review Health Metrics

| Domain | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Foundation & Governance | 0 | 1 | 3 | 2 | 6 |
| Data & Infrastructure | 0 | 3 | 4 | 2 | 9 |
| Identity & Security | 2 | 6 | 3 | 0 | 11 |
| Commerce Core | 4 | 12 | 15 | 2 | 33 |
| Money & Logistics | 1 | 6 | 6 | 2 | 15 |
| Platform Services | 0 | 8 | 8 | 5 | 21 |
| UX, Content & Dashboards | 1* | 4 | 5 | 5 | 15 |
| **Total (registrations)** | **8** | **40** | **44** | **18** | **110 → 109 unique** |

> \* UX-12 is a duplicate registration of ML-01 (same root conflict, traced in both domains); counted once in the unique total. Counts are final per Appendix A.

## 2.3 Areas Confirmed Consistent (No Action Required)

The following standards are **consistent across all documents** and are adopted as-is:

1. **Money precision:** `DECIMAL(10,2)` for all currency fields, never float (DATABASE §19.4/§30.3, TECH_STACK §3.1/§9.1, PAYMENT §1.7). Gateway interface converts to smallest unit (paise) at the adapter boundary.
2. **Timestamps:** `TIMESTAMPTZ`, always stored UTC, converted to local on display (DATABASE §18.3/§19.3/§30.3).
3. **Primary keys:** UUID v4 everywhere (`@default(uuid())`); no prefixed database IDs. `NAB-` and document prefixes (`INV`, `ORD`, …) are human-facing identifiers only (ORDER §2.9, DOCUMENT §5.6).
4. **Tech foundation:** React 19 + TypeScript strict + Vite 6 + Tailwind 4 + TanStack Query 5 + Zustand 5 + React Router v7, SPA on Cloudflare Pages; Pages Functions edge API; Prisma 6 + Neon Postgres + Hyperdrive; R2 + KV + Cloudflare Queues; Vitest 4 + Playwright; pnpm.
5. **Session model:** 15-min access token, 7-day refresh, 4h CSRF, max 5 sessions, rotation (ARCHITECTURE §10.5, TECH_STACK §4.1, ENGINEERING §12.2, PERFORMANCE §3.8) — consistent across 4 docs.
6. **Breakpoints:** Mobile 0–639 / Tablet 640–1023 / Desktop 1024–1279 / Wide 1280+ (DESIGN_SYSTEM §11.4 ≡ RESPONSIVE §7.4 ≡ NAVIGATION §7.4).
7. **Design tokens:** DESIGN_SYSTEM_ARCHITECTURE.md is the canonical token source (Cormorant Garamond + Manrope, brand scale `#faf6f1 → #1f1710`, gold `#c9a84c`); COMPONENT_LIBRARY and UX reference it without divergence.
8. **Bottom navigation:** 5 tabs (Home/Shop/Search/Cart/Account); Shop icon = **`Grid3x3`** (NAVIGATION §3.5 + UX; no dissenters). *This resolves the earlier Grid-vs-Grid3x3 watchlist item.*
9. **Environment matrix:** feature→localhost:5173, PR→`*.nabome.pages.dev`, develop→staging, main→prod (ARCHITECTURE §33.4 ≡ FOLDER §7.3 ≡ QA §8.6).
10. **Reservation timeout:** 15 minutes (10 citations across 4 docs — consistent value; timing of reservation is the conflict, see CC-02).
11. **Low-stock threshold default:** 10; **media limits** ≤10MB, 400×400–4000×4000px; **pagination** 24/page; **search** max 50 results, 300ms debounce.
12. **Auth rate limits (login 20/min, register 10/min, pw-reset 5/hr)** — consistent across ARCHITECTURE/TECH_STACK/ENGINEERING.
13. **PII hygiene:** never store tokens in localStorage (4 docs); never commit secrets (4 docs); WCAG 2.2 AA (4 docs).
14. **Search ownership:** SEARCH_ENGINE_ARCHITECTURE.md explicitly supersedes UX_ARCHITECTURE.md §7 and CATALOG_ARCHITECTURE.md §6–7 — resolved cleanly.

## 2.4 Top Findings (Executive Summary)

1. **The variant data model is irreconcilable as written** (CC-01): Product Engine/Catalog define `ProductVariant` with hardcoded `size`/`color` columns; Variant & Inventory defines a dynamic Global Attribute System. **Critical** — no product implementation can proceed until unified.
2. **Inventory reservation timing and synchronicity contradict** (CC-02, CC-03): three reservation timings (checkout entry / pre-payment / payment success) and two models (optimistic UI vs atomic DB transaction) across 4 docs. **Critical** — overselling/stock-divergence risk.
3. **No canonical order-status enum exists across the commerce docs** (CC-27, UX-11): Payment uses `pending/confirmed`, Shipping uses `accepted/packing/ready_to_ship/...`, OM defines a 16-state machine; the customer-visible subset is never mapped. **Critical**.
4. **Market jurisdiction is split** (ML-01): the majority of docs are India-scoped (INR, GST, RBI, TRAI, India Post, UPI, en-IN) while CMS and locale references use `bn-BD`; no doc defines the canonical market/locale model. **Critical**.
5. **Role and auth model contradict** (IS-01, IS-02): `enum UserRole {customer, shop_owner, admin}` vs a numeric 5-level hierarchy with `System` and `super_admin`; self-managed Prisma `User.password` vs Supabase Auth. **Critical**.
6. **Retention is specified 3–4 ways per artifact** (PS-01/03/09/10, IS-05): invoices "7 years / 10 years / never deleted"; notifications "90 days / 1–7 years / permanent"; audit "7y flat / class-based / permanent". **High**.
7. **Invoice/receipt generation is triplicated** (PS-04/05): Document Engine (owner), Finance Engine, and Payment Engine each claim it; the Document Engine registry is missing Payment Receipt entirely.
8. **The CI/CD pipeline spec and the actual `ci.yml` diverge** (DI-05): governance mandates quality gates, release approval, canary, and rollback — the YAML has none, and preview/production deploy to the same Pages project name.
9. **Five uncoordinated "Mandatory Rules for AI Agents" sets** (FG-02): ARCHITECTURE §36 (38 rules), GOVERNANCE §2.3 (14), ENGINEERING §17.1 (10), PERFORMANCE §16, QA §15 — a governance duplication the Constitution itself prohibits; consolidated in Section 10.
10. **Document supersession claims conflict** (FG-01): ARCHITECTURE claims it "supersedes all other documentation", ENGINEERING claims "single source of truth for all engineering standards", GOVERNANCE claims to be "the topmost layer". The precedence chain resolves the conflict; registered here.

---

# 3. Gap Analysis

Gaps are classified: **Contract gap** (a needed interface/contract is missing or owned by the wrong doc), **Coverage gap** (a domain is un- or under-specified), **Process gap** (governance/operational process missing). Full resolution references the Issue Registry in Section 4.

## 3.1 Contract Gaps (interface/ownership missing)

| ID | Gap | Evidence (verbatim doc citations) | Resolution ref |
|---|---|---|---|
| GP-01 | **Order-creation contract lives in Checkout, not its owner.** ORDER_MANAGEMENT references `api/_handlers/checkout/` but defines no endpoints or request/response schema; the contract exists only in SHOPPING_CART_WISHLIST_CHECKOUT §4.18–4.19. | OM §2.3; SC §4.18/§4.19 | CC-30 |
| GP-02 | **Return/refund event contract missing.** Shipping auto-triggers refunds on `return_to_sender`/return-delivery; Payment's refund validation has no shipment-state checks; no interface or event name defined between the two engines. | SHIPPING §8.6; PAYMENT §7.7 | ML-09 |
| GP-03 | **Homepage Builder ↔ CMS contract is one-sided.** CMS asserts "The Homepage Builder imports CMS blocks"; the Builder documents only its own section registry and no import mechanism. | CMS §1.3; HOMEPAGE_BUILDER §2.5 | UX-13 |
| GP-04 | **No cross-doc error-code registry.** Each engine ships its own error tables (VI App C, SC §8.11, CA §14.7, PE §8.x) with overlapping concepts, different codes and HTTP statuses (e.g., `INSUFFICIENT_STOCK` 400 vs 422). | VI App C.3; SC §8.11 | CC-12 |
| GP-05 | **No notification ↔ audit event contract.** Notification delivery attempts have no named audit event types; only lifecycle events are defined in the Audit engine. | NOTIFICATION §12.8; DATA_LIFECYCLE §9.2 | PS-20 |
| GP-06 | **No customer-visible order status mapping.** The operational 16-state machine is never mapped to what customers see (cancel/return/review eligibility). | SHOP_OWNER §5.7.1; CX §5.8 | UX-11 |
| GP-07 | **Payment sub-status enum missing.** OM tracks only `pending`/`confirmed`/`failed`; prose states "refund initiated" with no state; refund ETA not represented. | OM §1.8, §3.5, §8.8 | CC-28 |
| GP-08 | **Dashboard shared-component contract missing.** Shop Owner and Admin dashboards intentionally duplicate widgets (revenue trend, donut, notifications) with no shared contract preventing divergence. | SHOP_OWNER §2; ADMIN §2 | UX-14 |

## 3.2 Coverage Gaps (domain under-specified)

| ID | Gap | Evidence | Resolution ref |
|---|---|---|---|
| GP-09 | **No inventory-restoration rule for rejected orders.** OM rejection ends at "initiate refund"; no stock-release path. | OM §4.5; VI §6.7 | CC-31 |
| GP-10 | **No inventory-restoration rule for returns/refunds.** `ORDER_RETURN` movement type is defined but never wired to an operation. | VI §5.11.1; OM §8.5–8.8 | CC-32 |
| GP-11 | **No pre-order/backorder status.** VI offers a Pre-order filter; no state exists in product status, inventory status, or order flows. | VI §9.7; VI §5.10; OM §1.8 | CC-33 |
| GP-12 | **COD end-to-end settlement undefined.** Cash flow chain customer → courier → platform → shop owner has no finance-side definition; courier settlement "reconciled daily" has no owner. | PAYMENT §2.6; FINANCE §4.12 | ML-08 |
| GP-13 | **No unified PII classification tiers.** PII handled via ad-hoc masking/anonymization flags; no tier model shared across engines. | EXPORT §12.4.1; DATA_LIFECYCLE §2.5 | PS-19 |
| GP-14 | **No digest engine.** "Daily/Weekly digest" exists only as a preference string; no batching workflow, template, or scheduler. | NOTIFICATION §8.7 | PS-17 |
| GP-15 | **Scheduled reports have no single owner.** BI (§14.6) and Document Engine (§14.9) both claim scheduled-report generation with different frequency sets. | EXPORT §14.6; DOCUMENT §14.9 | PS-22 |
| GP-16 | **Queue technology never pinned in its designated single-source doc.** PERFORMANCE §5 names no concrete provider ("edge-scheduler/cron binding or worker scheduler"); concrete "Cloudflare Queues" exists only in other docs. | PERFORMANCE §5.4 | DI-01 |
| GP-17 | **T0 path never defined.** The "100% T0 coverage" rule repeats across 3 docs; the T0/T1/T2 module list exists only in GOVERNANCE §12.3. | QA §2.2/§15; GOVERNANCE §12.3 | FG-04 |
| GP-18 | **No canonical SLA register.** 24h response / 48h review / 48h accept / 7-day resolution are consistent but scattered across 4 docs. | ACCOUNT §6.9; RESOLUTION §4.4; SHOP_OWNER §5.5 | UX-15 |
| GP-19 | **Admin "Brands" and "Media" modules are undefined.** Referenced in NAVIGATION §3.18, absent from ADMIN's 27-module catalog. | NAVIGATION §3.18; ADMIN §3.4 | UX-08 |

## 3.3 Process & Hygiene Gaps

| ID | Gap | Evidence | Resolution ref |
|---|---|---|---|
| GP-20 | **Broken cross-references:** QA §8.6 cites "ENGINEERING_HANDBOOK §33.4" (no such section); QA §15.1 cites "§ARCHITECTURE §3" (unresolvable). | QA §8.6, §15.1 | FG-06 |
| GP-21 | **`CSRF_SECRET` env var is orphaned:** required in env catalogs, never used by the documented CSRF implementation (`crypto.randomUUID()`). | ARCHITECTURE §18.4/§30.6; ENGINEERING Appendix B | DI-03 |
| GP-22 | **Backup RPO/RTO numbers absent from DATABASE doc** (defined only in GOVERNANCE §13.3 and PERFORMANCE §9.6). | DATABASE §25 | DI-07 |
| GP-23 | **`robots.txt.ts` duplicated in the architecture tree** (both `functions/` root and `functions/api/`). | ARCHITECTURE §2.4; FOLDER §1.1 | DI-08 |
| GP-24 | **README_EARLY.md** is registered as Historical/superseded in GOVERNANCE Appendix A but remains on disk; keep as reference only, never cite as authority. | GOVERNANCE App. A | FG-06 |

---

# 4. Conflict Detection — Issue Registry

The Issue Registry is the authoritative list of every detected contradiction, duplication, and gap across the 44 documents. Issues are grouped by domain; each entry registers Severity, Affected Modules, Description, Impact, and Recommended Resolution. Appendix A is the index.

**Resolution convention:** every resolution selects the canonical option among the approved documents' own definitions (citing the winning document and section), and names the documents that must be amended via the governance change process (Section 8). Where a safe default is required (marked "Blueprint default"), the default is registered as a binding standard until superseded by an ADR.

## 4.1 Foundation & Governance

#### FG-01 — Competing document supremacy claims
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | All |
| **Description** | ARCHITECTURE.md declares "This document supersedes all other documentation" and is "the single source of truth for all engineering decisions"; GOVERNANCE_CONSTITUTION.md declares itself "the topmost layer" and "supreme governance authority"; ENGINEERING_HANDBOOK.md declares itself "the single source of truth for all engineering standards". Three documents claim top authority (ARCHITECTURE §1 line 6/§36 closing; GOVERNANCE §1.1/§1.5; ENGINEERING line 6/closing). |
| **Impact** | Agents cannot determine which authority wins; conflicting implementations will be justified by conflicting documents. |
| **Resolution** | Register GOVERNANCE_CONSTITUTION.md §1.5 precedence chain as binding (quoted in §1.2 above). Amend ARCHITECTURE.md and ENGINEERING_HANDBOOK.md headers to cite the chain instead of absolute claims. This blueprint's adjudications (Section 4, Appendix B) are binding until owning docs are amended. |

#### FG-02 — Five uncoordinated "Mandatory Rules for AI Agents" sets
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | All |
| **Description** | Five overlapping rule sets exist with no cross-referencing: ARCHITECTURE §36 (38 rules, 6 categories), GOVERNANCE §2.3 (14 binding rules), ENGINEERING §17.1 (10 rules), PERFORMANCE §16 (P/S/O/F sets), QA §15 (16 rules). |
| **Impact** | Contradictory instructions (e.g., different line-length/file-size limits in ARCHITECTURE §36.4–36.5 vs FOLDER §12.1 vs GOVERNANCE §2.9); agents cannot know the full binding set. |
| **Resolution** | Section 10 of this blueprint consolidates the superset into one binding rule list (38 numbered rules). GOVERNANCE §2.3 remains non-waivable; all other docs must reference Section 10 of this blueprint instead of duplicating rule lists. |

#### FG-03 — Test coverage targets conflict
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | QA, Engineering standards, all modules |
| **Description** | ARCHITECTURE §32.4: "Unit \| Vitest \| 80%+ / Integration \| Vitest \| 70%+". ENGINEERING_HANDBOOK §14.1: "Unit \| Vitest \| 90%+ for utilities, 80%+ for handlers"; "Integration \| Critical paths". QA §2.2 explicitly defers to ENGINEERING §14.1 and adds "T0 paths 100%". |
| **Impact** | An agent targeting ARCHITECTURE's 70% integration figure under-tests critical paths; coverage gates (G7) are ambiguous. |
| **Resolution** | **Canonical:** ENGINEERING §14.1 + QA §2.2 (utilities ≥90%, handlers ≥80%, T0 paths 100%, integration = critical paths). Amend ARCHITECTURE §32.4 to defer to ENGINEERING §14.1. |

#### FG-04 — "T0 path" never defined
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | QA, all modules |
| **Description** | "100% T0 coverage" is mandated in ARCHITECTURE §32.5, ENGINEERING §14.2, and QA §2.2/§15, but no doc defines which paths are T0. The closest definition is GOVERNANCE §12.3's T0/T1/T2 module classification (T0: auth, payments, checkout, orders). |
| **Impact** | Coverage gate G7 cannot be objectively evaluated. |
| **Resolution** | **Blueprint default (binding):** T0 paths = all flows touching auth, payments, checkout, orders, refunds, and settlements (per GOVERNANCE §12.3 module classification), including their cross-module event consumers (notification of T0 events, finance records, document generation). Amend QA §2.2 to reference GOVERNANCE §12.3. |

#### FG-05 — Broken and malformed cross-references
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | QA, Documentation |
| **Description** | QA §8.6 cites "ENGINEERING_HANDBOOK §33.4" (no such section — the env matrix is ARCHITECTURE §33.4); QA §15.1 cites "§ARCHITECTURE §3" (unresolvable). |
| **Impact** | Agents waste time resolving citations; automated link checks fail. |
| **Resolution** | Correct QA §8.6 to ARCHITECTURE §33.4 and QA §15.1 to a real section. |

#### FG-06 — README_EARLY.md still on disk as active-looking artifact
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | Documentation |
| **Description** | GOVERNANCE_CONSTITUTION.md Appendix A registers README_EARLY.md as "Historical (superseded by active docs)", but the file remains in the repo root without an explicit historical header. |
| **Impact** | Agents may cite superseded early design (e.g., different stack choices). |
| **Resolution** | Add a "Historical — do not cite" banner to README_EARLY.md; keep as reference. |

## 4.2 Data & Infrastructure

#### DI-01 — Queue technology never pinned in the designated single-source document
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Infrastructure, Automation, Notifications, Documents, BI |
| **Description** | PERFORMANCE §5 is the designated source of truth for queues/batch/retry but names no concrete provider ("edge-scheduler/cron binding or worker scheduler", §5.4). Concrete "Cloudflare Queues" appears in ≥6 other docs (API_INTEGRATION §13.4, API_SERVICE §33.4, AUDIT, EXPORT_BI, DOCUMENT, SEARCH, ORDER, SHIPPING). AUTOMATION_WORKFLOW_ENGINE §7.5 defines PostgreSQL `job_queue/job_claimed/job_completed/job_failed/job_dead_letter` tables. |
| **Impact** | An implementing agent cannot tell which queue service to provision; two competing queue models. |
| **Resolution** | **Two-tier model (binding):** (1) **Cloudflare Queues** = canonical for fire-and-forget messaging and event consumers (per API_INTEGRATION §13.4, API_SERVICE §33.4); (2) **PostgreSQL job tables** per AUTOMATION_WORKFLOW_ENGINE §7.5 = canonical for durable, scheduled, transactional jobs (retries visible, DLQ, consistent with `event_outbox`). Amend PERFORMANCE §5 to register this split as the canonical queue architecture. |

#### DI-02 — CSRF cookie flags contradict each other
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Auth, Security, API Service |
| **Description** | ARCHITECTURE §10.6 sets `csrf_token` cookie with `httpOnly: false` (client must read it) and `sameSite: 'lax'`; ARCHITECTURE §30.6 sets the same cookie `httpOnly: true, sameSite: 'strict'` while still requiring the client to send the `x-csrf-token` header; TECH_STACK §10.2 says "Store in httpOnly cookie / Client reads cookie and sends as header". An httpOnly cookie cannot be read by client JS — §30.6 and TECH_STACK §10.2 are mutually unsatisfiable. |
| **Impact** | CSRF protection will fail at runtime (missing header) or require disabling httpOnly, weakening the design. |
| **Resolution** | **Canonical:** double-submit cookie per ARCHITECTURE §10.6/TECH_STACK §10.2 — cookie readable by client JS (`httpOnly: false`, `sameSite: 'lax'`, `secure: true` in prod), client sends `x-csrf-token` header, server compares timing-safe. Amend ARCHITECTURE §30.6 to match §10.6. |

#### DI-03 — `CSRF_SECRET` env var is orphaned
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Security, Infrastructure |
| **Description** | `CSRF_SECRET` (32+ chars) is required in ARCHITECTURE §18.4 and ENGINEERING Appendix B, but the documented CSRF implementation (ARCHITECTURE §30.6) generates `crypto.randomUUID()` and never uses the secret. |
| **Impact** | Config drift; the secret may be provisioned uselessly or the implementation diverges. |
| **Resolution** | **Blueprint default:** use `CSRF_SECRET` as the HMAC key for signing the CSRF token (single-value, rotation-ready), keeping the §10.6 double-submit flow. Amend ARCHITECTURE §30.6 to consume `CSRF_SECRET`. |

#### DI-04 — Upload rate limits conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Storage Engine, API Service |
| **Description** | TECH_STACK §10.3 and ENGINEERING §12.3: file upload "10 requests/minute". STORAGE_ENGINE §16.5: `/api/upload/presign` 10/min, `/api/upload/image` 5, `/api/upload/video` 2, `/api/upload/document` 5. |
| **Impact** | The generic 10/min cannot hold for the endpoint-specific 5/2/5 limits. |
| **Resolution** | **Canonical:** STORAGE_ENGINE §16.5 endpoint-specific table (most specific). Amend TECH_STACK §10.3/ENGINEERING §12.3 to reference the storage table. |

#### DI-05 — R2 storage key prefix inconsistency
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Storage Engine, Documents, Data Lifecycle |
| **Description** | STORAGE_ENGINE §3.4 shows root prefix `nabome-r2/`; §3.6 key construction is `nabome/${domain}/${entityId}/${assetType}/${filename}` (no `-r2`); GOVERNANCE §3.8 (citing IDENTITY_NAMING) mandates `nabome/{domain}/{uuid}/...`, lowercase kebab-case, max 3 levels; Appendix A.1 example bucket `nabome-storage`. Three shapes for one store. |
| **Impact** | Keys written under one convention cannot be found by code following another; archive/cascade logic breaks. |
| **Resolution** | **Canonical:** `nabome/{domain}/{entityId}/{assetType}/{filename}` per GOVERNANCE §3.8/IDENTITY_NAMING (lowercase kebab-case, max 3 levels, entityId = UUID). Bucket name: `nabome-storage` (STORAGE Appendix A.1), documents buckets `nabome-documents` / `nabome-documents-archive` (DOCUMENT §7.4) remain. Amend STORAGE_ENGINE §3.4/§3.6 to remove `nabome-r2/`. |

#### DI-06 — CI/CD pipeline spec diverges from the actual ci.yml
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | QA/Release, Infrastructure |
| **Description** | QA §8.1 mandates: quality gates G3/G4/G5/G7, manual release-approval gate (confidence score), production canary, rollback readiness, artifact retention. ARCHITECTURE §33.6 `ci.yml` contains only lint/test/deploy-preview/deploy-staging/deploy-production — no gates, no approval, no canary, no rollback; and both `deploy-preview` and `deploy-production` use `--project-name=nabome` (previews target the production Pages project). |
| **Impact** | Mandated governance gates are unenforced; preview deploys could overwrite production. |
| **Resolution** | Rewrite `ci.yml` per QA §8.1: add quality-gate stage (G3/G4/G5/G7), release-approval gate using the Release Confidence score, canary + smoke step, rollback job; set preview project name to `nabome-preview` (distinct from `nabome`). Amend ARCHITECTURE §33.6 to match QA §8.1. |

#### DI-07 — R2 bucket naming unspecified for production
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Storage Engine, Data Lifecycle |
| **Description** | Only example bucket names exist (`nabome-storage`); no doc specifies the authoritative production bucket set or environment suffixing (dev/staging/prod). |
| **Impact** | Environment-crossing writes risk data corruption in shared buckets. |
| **Resolution** | **Blueprint default:** buckets are environment-suffixed (`nabome-storage-prod`, `nabome-storage-staging`, `nabome-storage-dev`; same for `nabome-documents*`), enforced by env-var `R2_BUCKET_*`. Register via ADR. |

#### DI-08 — Backup RPO/RTO numbers absent from DATABASE doc
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | Database, Infrastructure |
| **Description** | RPO < 1h / RTO < 4h defined in GOVERNANCE §13.3 and PERFORMANCE §9.6/§17.3; DATABASE §25 (Backup & Recovery) contains no numbers. |
| **Impact** | An implementer reading only DATABASE cannot size backup strategy. |
| **Resolution** | Add RPO < 1h / RTO < 4h + 30-day backup retention to DATABASE §25, cross-referencing GOVERNANCE §13.3. |

#### DI-09 — `robots.txt.ts` duplicated in the architecture tree
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | Infrastructure, Folder structure |
| **Description** | ARCHITECTURE §2.4 lists `functions/robots.txt.ts` both at `functions/` root and under `functions/api/`; FOLDER_ARCHITECTURE §1.1 lists it only under `functions/api/`. |
| **Impact** | Conflicting placement for a new worker. |
| **Resolution** | **Canonical:** `functions/api/robots.txt.ts` per FOLDER_ARCHITECTURE §1.1. Amend ARCHITECTURE §2.4 tree. |

## 4.3 Identity & Security

#### IS-01 — Role model conflict (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | IAM, Security, Admin Dashboard, System Configuration, Audit |
| **Description** | IAM defines `enum UserRole {customer, shop_owner, admin}` (§42.4); SECURITY defines a numeric additive hierarchy "Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100" (§5.2) with UPPERCASE code strings `'SHOP_OWNER'`/`'ADMIN'` (§5.3); SYSTEM_CONFIGURATION uses `super_admin` (§10.5); AUDIT references a Compliance role (§9.6). Four role vocabularies. |
| **Impact** | Permission checks written against one model silently fail under another; super_admin/admin privilege boundaries undefined; compliance roles missing. |
| **Resolution** | **Canonical:** SECURITY §5.2 five-level additive hierarchy (Guest 0 / Customer 10 / Shop Owner 20 / Admin 30 / System 100). Extend IAM §42.4 enum to `{customer, shop_owner, admin, system}`; define `super_admin` as a capability flag on Admin (not a new level) in IAM §36.4; add Compliance as a scoped role in IAM RBAC; fix SECURITY §5.3 code strings to lowercase enum; align SYSTEM_CONFIGURATION §10.5; register roles in AUDIT §9.6. |

#### IS-02 — Auth backend conflict (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | IAM, Security, API Integration, Database |
| **Description** | IAM §42.4 defines a self-managed Prisma `User` with `password` column; API_INTEGRATION §3.1 and SECURITY §4.4 (bcrypt cost 12 → PostgreSQL `auth.users`) standardize on **Supabase Auth** with `SUPABASE_URL/SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY`; TECH_STACK §4.1: "Complete authentication system using Supabase Auth with custom session management". |
| **Impact** | Password hashes could be stored app-side in violation of the approved Supabase design; session/token policy implemented twice. |
| **Resolution** | **Canonical:** Supabase Auth (API_INTEGRATION §3.1 + SECURITY §4.4). Rework IAM §42.4: app-side `User` profile table keyed by `auth.users.id`, **no `password` field app-side**; IAM §18.4 token policy implemented via Supabase session/JWT configuration. |

#### IS-03 — Login/rate-limit defense layers conflict
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | IAM, Security, API Service |
| **Description** | Login 20/min per account (IAM §43.4, API_INTEGRATION §7.1) vs "10/hr per IP + IP-block at 10 failures" (SECURITY §3.11); Public 60/min & Admin 300/min (API_INTEGRATION §7.1) vs 100/500 (API_SERVICE §28.4). |
| **Impact** | Either brute-force protection is weakened or legitimate users are blocked; rate-limit tables disagree. |
| **Resolution** | **Canonical:** API_INTEGRATION §7.1 tier table (Public 60 / Authenticated 120 / Admin 300 / API Key 100 / Premium 500 per minute) + per-endpoint table; adopt SECURITY §3.11 IP-level lockout as a **complementary second layer** (per-account 20/min AND per-IP 10/hr), not an alternative. Align API_SERVICE §28.4 numbers to API_INTEGRATION §7.1. |

#### IS-04 — Session TTLs conflict
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | IAM, Security |
| **Description** | IAM §18.4: refresh 7d, remember-me 30d, absolute 24h, idle 30m. SECURITY §5.5: remember-me 90d absolute, admin idle 30m / absolute 8h. |
| **Impact** | A 90-day absolute session contradicts the approved 24h absolute; admin sessions lack elevation rules. |
| **Resolution** | **Canonical:** IAM §18.4 for standard sessions (matches API_INTEGRATION §3.1); adopt SECURITY §5.5's admin-tier (idle 30m / absolute 8h) as explicit elevated-session rules inside IAM §18.4; drop the 90-day absolute remember-me. Amend SECURITY §5.5 accordingly. |

#### IS-05 — Audit retention: flat 7 years vs class-based
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Audit, IAM, Security, Data Lifecycle |
| **Description** | IAM §28.5 and SECURITY §10.4 apply a flat 7-year audit retention; AUDIT_COMPLIANCE_ENGINE §8.3 defines class-based retention (authentication 3y, user actions 2y, security events 5y, financial transactions 7y, system events 1y) with per-class archive thresholds; AUDIT §8.1 declares permanent primary-DB retention for financial/tax/security categories. DATA_LIFECYCLE §2.15 applies flat 1y-active/6y-archive/7y-total. |
| **Impact** | Three different retention models; audit records could be deleted or archived at the wrong time relative to compliance. |
| **Resolution** | **Canonical:** AUDIT §8.3 class-based table (most specific); AUDIT §8.4 "7 years minimum" applies where regulation requires (see IS-06/IS-07). IAM §28.5, SECURITY §10.4, and DATA_LIFECYCLE §2.15 must defer to AUDIT §8.3. |

#### IS-06 — GST retention: 6 years vs 7 years
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Audit, Finance, Data Lifecycle |
| **Description** | AUDIT §8.4: GST records "6 years from filing". SECURITY §10.4/§10.2: "7 years". |
| **Impact** | Records could be purged before the safe superset deadline; Indian tax compliance risk. |
| **Resolution** | **Canonical:** 7 years (SECURITY §10.4 — safe superset of the 6-year-from-filing rule). Amend AUDIT §8.4 GST row to 7y. |

#### IS-07 — RBI retention: 5 years vs 7 years
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Audit, Payment, Data Lifecycle |
| **Description** | AUDIT §8.4: RBI records "5 years". SECURITY §10.4: "7 years". |
| **Impact** | Payment records could be purged below the approved 7-year financial retention. |
| **Resolution** | **Canonical:** 7 years (SECURITY §10.4 — safe superset of RBI 5–8y record classes). Amend AUDIT §8.4 RBI row to 7y. |

#### IS-08 — Webhook signature scheme conflict
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | API Integration, API Service, Payment, Notifications |
| **Description** | API_INTEGRATION §4.4/§4.7: header `X-Nabome-Signature`, signed input `${timestamp}.${payload}`, 5-minute freshness, 24h replay tracking. API_SERVICE §34.4: header `x-webhook-signature`, payload-only signing. |
| **Impact** | Webhook receivers/senders built to different schemes will reject legitimate callbacks; replay protection missing on one side. |
| **Resolution** | **Canonical:** API_INTEGRATION §4.4/§4.7 (timestamped signing, strictly more secure). Amend API_SERVICE §34.4 to the exact header `X-Nabome-Signature` and `${timestamp}.${payload}` input. |

#### IS-09 — Security event naming: three conventions
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Audit, Identity Naming, Automation, IAM |
| **Description** | `LOGIN_SUCCESS` (IAM §28.4) vs `USER_LOGIN` (IDENTITY_NAMING §29.3) vs `user.login` (AUTOMATION Appendix A, a ~68-event constant registry; matches API_INTEGRATION §4.2 `eventType` naming). |
| **Impact** | Event consumers (audit, automation, BI) keyed on different event names will miss events. |
| **Resolution** | **Canonical:** AUTOMATION Appendix A dot-notation (`user.login`) as the single event constant registry. Rewrite IDENTITY_NAMING §29.3 as a reference to it; IAM §28.4 maps its constants to AUT names. |

#### IS-10 — Idle timeout: 30 min vs 15 min
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | IAM, Security |
| **Description** | IAM §18.4: 30-minute idle timeout. SECURITY §5.5: 15-minute idle timeout. |
| **Impact** | Sessions expire at different times depending on which doc the implementer follows. |
| **Resolution** | **Canonical:** 30 minutes standard (IAM §18.4, matches API_INTEGRATION §3.1); 15 minutes applies to admin/elevated sessions only (consistent with IS-04). Amend SECURITY §5.5. |

#### IS-11 — API versioning conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | API Service, API Integration, IAM, System Configuration |
| **Description** | API_INTEGRATION §2.4 mandates `/api/v{N}` + `Deprecation`/`Sunset` headers + 6-month sunset; API_SERVICE §41.4 describes "soft" versioning; IAM §43.4 (`/api/auth/*`) and SYSTEM_CONFIGURATION §14.10 (`/api/admin/settings*`) show unversioned endpoints. |
| **Impact** | Breaking API changes cannot be deprecated safely; clients hard-code conflicting paths. |
| **Resolution** | **Canonical:** API_INTEGRATION §2.4 hard rule. Amend API_SERVICE §41.4 to match (6-month sunset); version all public endpoints, including auth and admin settings. |

## 4.4 Commerce Core (Product, Catalog, Variant & Inventory, Cart/Wishlist/Checkout, Order Management)

#### CC-01 — ProductVariant schema irreconcilable (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | Product Engine, Catalog, Variant & Inventory, Cart/Checkout, Order Management |
| **Description** | PE App A.1 and CA §2.4 define `ProductVariant` with hardcoded `size VARCHAR(50)`, `color VARCHAR(100)`, `colorHex`, `@@unique([productId, size, color])`; VI App A.2 and §16.1 define a dynamic Global Attribute System (`variantAttributes VariantAttribute[]`) and mandate "Never hardcode variant types — Use Global Attribute System". |
| **Impact** | The two schemas are mutually incompatible; any product/variant implementation must pick one, and every downstream module (cart, inventory, order items) consumes the chosen model. |
| **Resolution** | **Canonical:** Variant & Inventory's dynamic Global Attribute System (VI §16.1 — enterprise-appropriate, extensible; matches VARIANT_INVENTORY's mandate and the SKU `{PRODUCT}-{ATTRIBUTES}` model). Rewrite PE App A.1 and CA §2.4 `ProductVariant` to the dynamic model; keep `size`/`color` as seed attributes defined in the Global Attribute catalog, not columns. |

#### CC-02 — Inventory reservation timing contradicts (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | Order Management, Cart/Checkout, Variant & Inventory, Product Engine, Payment |
| **Description** | OM §2.4 step 2: "INVENTORY RESERVATION … Reservation timeout: 15 minutes" before payment creation; OM §2.6: "Reserve on payment success, not cart creation"; PE §6.6.1/VI §5.6.1: reserve at checkout; SC §5.5: "Reserve stock during checkout". Three timings across four docs, and OM contradicts itself. |
| **Impact** | Overselling if reservation is too late; abandoned reservations if too early; inconsistent behavior between flows. |
| **Resolution** | **Canonical (binding):** reservation at **payment initiation** (checkout → validate availability → reserve 15 min → create payment → on failure/timeout release). This preserves the 15-minute timeout (consistent across 10 citations) and prevents overselling, and matches PAYMENT §6.4's order-after-capture flow. Amend OM §2.6 to this canonical timing; SC §13.3's optimistic-UI note applies to *display* only (see CC-03). |

#### CC-03 — Reservation synchronicity contradicts (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | Order Management, Cart/Checkout, Variant & Inventory |
| **Description** | SC §13.3: "No synchronous stock reservation — Optimistic UI with background sync"; OM §2.4/§2.6 and VI §16.3: "Use database transaction for atomicity", "Reserve during checkout: Prevent overselling". |
| **Impact** | Optimistic reservations allow overselling and silent stock divergence (UI shows availability that no longer exists). |
| **Resolution** | **Canonical:** atomic synchronous DB reservation at payment initiation (OM/VI — DB transaction + `SELECT ... FOR UPDATE`/conditional update; SC §13.3 amended). Optimistic UI is permitted for *cart badge display* only, with server reconciliation on checkout. Amend SC §13.3. |

#### CC-04 — SKU format defined three ways
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Product Engine, Catalog, Variant & Inventory |
| **Description** | PE §5.5.2: `{PRODUCT-SLUG}-{SIZE}-{COLOR}` → `PREMIUM-COTTON-TSHIRT-M-BLK`; VI §4.4: Display `{PRODUCT}-{ATTRIBUTES}` → `TSH-RED-M` and internal `NB-7F3A2B`; CA §9.7 example `"sku": "TEE-BLK-M"`. Three formats. |
| **Impact** | Products created via different screens produce different SKU shapes; uniqueness and parsing code diverges. |
| **Resolution** | **Canonical:** VI §4.4 model — Display SKU `{PRODUCT-CODE}-{ATTRIBUTE-SHORTCODES}` (e.g., `TSH-RED-M`), internal code `NB-{UUID-SUFFIX}`, barcode EAN-13/UPC, validation rules per VI §4.10 (alphanumeric+hyphens, 1–50 chars). Amend PE §5.5.2 and CA §9.7 examples. |

#### CC-05 — SKU editability contradicts
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Product Engine, Variant & Inventory |
| **Description** | PE §5.6: "Edit variant: Admin updates stock, price, SKU". VI §4.5/§4.9/§16.4: "SKU never changes after creation", "No update operation allowed", "SKU is permanent". |
| **Impact** | Editing a SKU silently breaks references (inventory movements, order items, barcodes). |
| **Resolution** | **Canonical:** SKU is immutable (VI §4.5/§4.9/§16.4). Amend PE §5.6 to remove SKU from editable fields. |

#### CC-06 — Inventory status bands contradict
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Variant & Inventory, Catalog, Product Engine |
| **Description** | VI §5.10: "In Stock `availableStock > 10`; Low Stock `1 < availableStock <= 10`; Last Few `== 1`; Out of Stock `<= 0`; Discontinued". VI §5.5: "In stock `availableStock > 0`; Low stock `<= lowStockThreshold`" — no Last Few. |
| **Impact** | Badges and filters show different states depending on implementation; UI promises "Last Few" that never appears. |
| **Resolution** | **Canonical:** VI §5.10 five-state table with **threshold-based definition**: Low Stock = `1 <= availableStock <= lowStockThreshold` (default 10); Last Few = `availableStock == 1`; In Stock = `> lowStockThreshold`. Amend VI §5.5 to defer to §5.10. |

#### CC-07 — Availability filter reads the wrong stock field
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Catalog, Variant & Inventory, Product Engine |
| **Description** | PE §9.5/CA §6.4.1 availability toggle reads `ProductVariant.stock`; VI §9.6/SC §5.4 read `availableStock` (= stock − reservedStock). |
| **Impact** | During reservations, catalog shows items as available that are already reserved (overselling pressure, checkout failures). |
| **Resolution** | **Canonical:** availability always evaluates `availableStock` (VI §9.6). Amend PE §9.5 and CA §6.4.1. |

#### CC-08 — Cache TTLs conflict across four data types
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Catalog, Product Engine |
| **Description** | CA §11.6: listings 5m, detail 10m, category 30m, collection 15m. PE §11.9: detail 5m, list 2m, category 1h, collection 5m. All four TTLs differ. |
| **Impact** | Inconsistent freshness; stale data served from one cache while another is fresh. |
| **Resolution** | **Canonical:** PE §11.9 (product engine owns product data): detail 5m, list 2m, category tree 1h, collection 5m. Amend CA §11.6. |

#### CC-09 — Bulk operation batch limits conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Product Engine, Variant & Inventory, Order Management |
| **Description** | PE §2.13.1: "Max 50 operations per batch" but lists "100 per batch" for category/price/tag; VI §6.10/§16.8: max 100 variants; OM §12.5: max 100 orders; PE-only delete cap 20/batch. |
| **Impact** | Validation failures at the boundary; batch implementations capped differently. |
| **Resolution** | **Canonical:** max 100 per batch for create/update; max 20 per batch for delete (safest caps; keeps OM/VI consistent). Amend PE §2.13.1/§2.13.2. |

#### CC-10 — Draft validation requirements conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Product Engine |
| **Description** | PE §2.7.2: "Minimal validation: Only name required for draft". PE §8.4: `categoryId` and `basePrice` both "Required" for Draft. |
| **Impact** | Product creation aborts on missing category for drafts that should save. |
| **Resolution** | **Canonical:** draft requires name only (PE §2.7.2); publish-time validation requires category + price + variant (PE §8.4 applies to publish). Amend PE §8.4 to scope "Required" to publish. |

#### CC-11 — Publish validation conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Product Engine |
| **Description** | PE §2.8.2: publish requires ≥1 active variant. PE §8.9: publish requires "At least 1 variant: Active variant with stock" + `PUBLISH_NO_STOCK`. |
| **Impact** | A product with zero-stock variants could publish in one flow and be rejected in another. |
| **Resolution** | **Canonical:** PE §8.9 (≥1 active variant **with stock**) at publish. Amend §2.8.2. |

#### CC-12 — No canonical error-code registry; `INSUFFICIENT_STOCK` 400 vs 422
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | All commerce modules, API Service |
| **Description** | VI App C.3: `INSUFFICIENT_STOCK` → 400. SC §8.11: `INSUFFICIENT_STOCK` → 422. Each doc ships its own error table with no shared registry. |
| **Impact** | Client error handling branches on inconsistent statuses. |
| **Resolution** | **Blueprint default:** HTTP 409 Conflict for insufficient stock (state-based conflict); adopt API_SERVICE error envelope as the canonical format; build the shared error registry in `api/_lib/errors/` referenced by all modules. Amend VI App C.3 and SC §8.11. |

#### CC-13 — Product URL pattern conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Catalog, Product Engine, Search, UX |
| **Description** | CA §9.4/§9.7: `/shop/{category-slug}/{product-slug}` (e.g., `/shop/men/premium-cotton-tee`). PE §3.13.1 JSON-LD: `https://nabome.online/products/{slug}`. |
| **Impact** | Canonical URLs, SEO, and deep links diverge. |
| **Resolution** | **Canonical:** `/shop/{category-slug}/{product-slug}` (CA §9.4 — matches navigation/UX URL rules and CX §2.5). Amend PE §3.13.1 structured-data URL to the canonical pattern. |

#### CC-14 — `meta` JSON shape diverges
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Product Engine, Catalog, Variant & Inventory |
| **Description** | PE App A.1 `meta` includes `salePrice`, `compareAtPrice`, `attributes`, `richContent`; CA §2.4 documents "Expected meta shape: { material, care[], origin }"; VI §7.7 stores `salePrice` in `Product.meta`. |
| **Impact** | Parsing code written to one shape fails on the other; pricing fields stored under meta bypass typed pricing. |
| **Resolution** | **Canonical:** `meta` is **untyped JSONB for product-detail attributes only** (material/care/origin per CA §2.4); `salePrice`/`compareAtPrice` become typed pricing columns (VI §7.9 pricing rules), never meta. Amend PE App A.1 and VI §7.7. |

#### CC-15 — Cancellation window conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Order Management |
| **Description** | OM §3.8: "Cancellation window: Before packing only". OM §7.4: customer "Allowed before `packing`", shop owner "any pre-shipment state", admin "any state". |
| **Impact** | Cancellation permission matrix contradicted by the blanket rule. |
| **Resolution** | **Canonical:** OM §7.4 actor matrix (customer pre-packing; shop owner pre-shipment; admin any state). Amend OM §3.8. |

#### CC-16 — `cancelled → refunded` transition missing from the state table
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Order Management, Payment, Finance |
| **Description** | OM §3.4 diagram: `CANCELLED ──▶ REFUNDED ──▶ ARCHIVED`. OM §3.5 table: `cancelled → (terminal — refund)` with no transition row; only `returned → refunded` exists. |
| **Impact** | Cancel-a-paid-order produces no defined refund path in the state machine. |
| **Resolution** | **Canonical:** add `cancelled → refunded` (when paid) to OM §3.5, matching the §3.4 diagram; keep `cancelled` terminal for unpaid orders. |

#### CC-17 — `failed_delivery` state used but not in the enum (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management, Shipping |
| **Description** | OM §1.8: `in_transit` next states include `failed_delivery`; §3.4 diagram shows `[FAILED_DELIVERY]`; §3.5 transition `in_transit → delivered, failed_delivery`; §6.8 shipping event named `delivery_failed`. The state `failed_delivery` is absent from the canonical 16-state enum, and its name conflicts with the `delivery_failed` shipping event. |
| **Impact** | Order rows can enter a state with no schema/home; status sync with shipments breaks. |
| **Resolution** | **Canonical:** add `failed_delivery` to the OM order-status enum (OM §1.8) with transitions `in_transit → failed_delivery → delivered (retry) | returned_to_sender`; keep shipping event name `delivery_failed` (different namespace — order status vs shipment event). |

#### CC-18 — `held` state used but not in the enum (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management |
| **Description** | OM §7.7: "Order must be in held state"; §7.8: "Admin places order on hold". No `held` state exists in OM §1.8/§3.5. |
| **Impact** | The hold/resume feature cannot be implemented against the state machine. |
| **Resolution** | **Canonical:** add `held` to the OM order-status enum with transitions `any pre-delivery state → held → resume (previous state) | cancelled`; admin-only, audited (AUDIT event `ORDER_HELD`). Amend OM §1.8/§3.5/§7.7. |

#### CC-19 — Variant deletion: cascade hard-delete vs soft-delete
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Variant & Inventory, Product Engine |
| **Description** | VI §8.5: "Deletion: Cascade delete with product: Cleanup". VI §5.13/§16.3: "Hard delete variants: Lost inventory history: Soft delete only", "No hard deletes". |
| **Impact** | Hard deletes destroy inventory movement history and order-item references. |
| **Resolution** | **Canonical:** soft-delete only (VI §5.13/§16.3), matching DATA_LIFECYCLE product rules (soft-delete 30d → archive). Amend VI §8.5. |

#### CC-20 — `AUTO_ADJUST` movement type undeclared
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Variant & Inventory |
| **Description** | VI §6.9 logs `type=AUTO_ADJUST`; the canonical `InventoryMovementType` union (VI §5.11.1) has `STOCK_ADJUST` but no `AUTO_ADJUST`; DB schema accepts any string, masking the mismatch. |
| **Impact** | Analytics and audit queries on movement types miss auto-adjust rows. |
| **Resolution** | **Canonical:** use `STOCK_ADJUST` with a `source` field (`manual | auto`); remove `AUTO_ADJUST` from VI §6.9; add a CHECK constraint to the movement-type column (VI App A.2). |

#### CC-21 — Wishlist cap conflict
| | |
|---|---|
| **Severity** | Low |
| **Affected modules** | Cart/Wishlist |
| **Description** | SC §3.4: "No limit: No artificial maximum items". SC §3.6: "Max items: 50: Prevent abuse". |
| **Impact** | Wishlist add behavior differs by flow. |
| **Resolution** | **Canonical:** max 50 items per wishlist (SC §3.6 — abuse control). Amend SC §3.4. |

#### CC-22 — Return window vs auto-completion conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Order Management, Customer Resolution, Reviews |
| **Description** | OM §8.4/§10.5: return window "7 days from delivery". OM §3.8: "Delivery to completion: 30 days (auto) \| Return window"; §3.7: "Auto-complete after 30 days if no return". |
| **Impact** | The label "Return window" on a 30-day auto-complete conflicts with the 7-day return policy and resolution engine's windows. |
| **Resolution** | **Canonical:** return window **7 days** from delivery (OM §8.4; matches CUSTOMER_RESOLUTION §2.4 default); order auto-completes 30 days after delivery (OM §3.7) — relabeled "auto-completion", not return window. Amend OM §3.8 wording. |

#### CC-23 — Guest cart TTL: 90 days vs 7 days (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Cart/Checkout |
| **Description** | SC §2.4/§2.6/§2.8: "90 days for guest, indefinite for customer"; "90 days from last activity". SC §2.5/§2.11: "7 days: Cart expires (guest)". |
| **Impact** | Cart recovery emails (1h/24h/72h) fire against carts whose expiry is ambiguous; stale inventory reservations. |
| **Resolution** | **Canonical:** guest cart TTL **7 days** from last activity (SC §2.5/§2.11 — aligns with checkout-expiry and recovery cadence); customer cart TTL 90 days from last activity. Amend SC §2.4/§2.6/§2.8. |

#### CC-24 — Guest wishlist stored in localStorage (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Cart/Wishlist, Security |
| **Description** | SC §3.4: "Server-side: Database-backed, not localStorage". SC §3.6: guest wishlist "Storage: localStorage". |
| **Impact** | Wishlist data lost across devices; security rule ("never store tokens/data client-side" pattern) violated; sync complexity. |
| **Resolution** | **Canonical:** database-backed wishlist for all users (SC §3.4); guests get a server-side anonymous wishlist keyed by session cookie, merged on login. Amend SC §3.6. |

#### CC-25 — Checkout: 3 screens vs 5 stages
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Cart/Checkout, UX |
| **Description** | SC §4.4/§13.3: "Minimum steps: 3 screens: Address → Shipping → Payment". SC §4.5: 5 stages (Cart Review → Address → Shipping → Payment → Confirmation). |
| **Impact** | Checkout flow spec ambiguous for the frontend agent. |
| **Resolution** | **Canonical:** 5 stages as the state machine (SC §4.5); 3 screens as the mobile UX target by combining Cart Review into Address and Confirmation into Payment result (SC §4.4) — stages are the contract, screens are the presentation. Amend SC §4.5/§13.3 wording to say so. |

#### CC-26 — `categoryId` nullable vs required
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Product Engine, Catalog |
| **Description** | PE App A.1/CA §2.4: `categoryId String?` with `onDelete: SetNull`. CA §14.3/PE §8.4: "Every product has exactly one categoryId" / `categoryId` "Required". |
| **Impact** | Schema permits null while rules forbid it; category deletion silently un-categorizes products. |
| **Resolution** | **Canonical:** exactly one primary category required (CA §14.3); `onDelete: Restrict` for primary category (admin must move products before deleting a category). Amend PE App A.1. |

#### CC-27 — No canonical order-status enum across commerce docs (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | Order Management, Payment, Shipping, Cart/Checkout, All consumers |
| **Description** | Three vocabularies: Payment §2.6 COD uses `confirmed`/`pending`; Shipping §8.4 maps `accepted/packing/ready_to_ship/shipped/delivered/completed`; OM §1.8 defines the full 16-state machine (`pending, confirmed, processing, accepted, rejected, packing, ready_to_ship, shipped, in_transit, delivered, completed, cancelled, failed, returned, refunded, archived`). Payment §5.6 requires `Status = pending` for payment validation — a state no order-in-progress holds. |
| **Impact** | Payment validation, shipment sync, and customer status display all key on different state names; order lifecycle breaks end-to-end. |
| **Resolution** | **Canonical:** OM §1.8 16-state machine (plus CC-17 `failed_delivery` and CC-18 `held` → 18 states), with OM §3.5 transition table as the single source. Amend PAYMENT §2.6 (use `pending` at creation → `confirmed` on capture) and §5.6 validation; SHIPPING §8.4 mapping stands (it already maps shipment states onto OM states) but must reference OM §1.8. Customer-visible mapping per UX-11. |

#### CC-28 — No payment sub-status enum (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management, Payment |
| **Description** | OM tracks only `pending`/`confirmed`/`failed` for payment; "refund initiated" appears in prose with no state; refund ETA ("5-7 business days", OM §8.8) unrepresented. |
| **Impact** | Customers and shop owners cannot distinguish "refund processing" from "refunded"; state machines cannot transition. |
| **Resolution** | **Canonical:** add an `OrderPaymentStatus` sub-enum on Order: `pending, authorized, captured, refunding, refunded, failed` (mapped to PAYMENT statuses per ML-03), visible in order history. Amend OM §1.8. |

#### CC-29 — Order completion timing conflict
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Order Management, Shipping, Finance |
| **Description** | SHIPPING §8.4: "Order completes when all shipments delivered". SHIPPING §4.9: "Auto-complete 7 days after delivery if no return"; §3.8: "delivered → closed \| Auto-close after 7 days". OM §3.7: auto-complete 30 days. |
| **Impact** | Finance hold periods and settlement eligibility key off conflicting completion anchors (7d vs 30d). |
| **Resolution** | **Canonical:** shipment `delivered` → order `delivered` immediately; order `completed` after **30 days** (OM §3.7) if no return; shipment `closed` 7 days post-delivery (SHIPPING §3.8) — different objects, different windows; Finance hold (7-day eligibility) keys off order `delivered`, not `completed`. Amend SHIPPING §4.9/§8.4 wording to the 30-day completion. |

#### CC-30 — Order-creation contract lives in the wrong doc
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Order Management, Cart/Checkout |
| **Description** | OM §2.3 references `api/_handlers/checkout/` but defines no endpoints or schemas; the actual contract exists only in SC §4.18/§4.19 (zod). |
| **Impact** | Order agents cannot implement to the owning document. |
| **Resolution** | **Canonical:** SC §4.18/§4.19 remain the contract; OM §2.3 must cite SC §4.18/§4.19 as the authoritative checkout-to-order contract, and OM defines the order-creation *side effects* (status, history, notifications, finance events). |

#### CC-31 — No stock restoration on order rejection (High)
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management, Variant & Inventory |
| **Description** | OM §4.5 rejection ends at "Status → rejected, initiate refund" with no stock release. VI §6.7 release triggers cover only cancel/abandon/timeout. |
| **Impact** | Rejected orders leak reserved stock permanently → phantom out-of-stock. |
| **Resolution** | **Canonical:** rejection releases reserved stock via `STOCK_RELEASE` + `ORDER_CANCEL` movement types (VI §5.11.1), executed in the same transaction as the status change. Amend OM §4.5 and VI §6.7. |

#### CC-32 — No stock restoration on returns/refunds (High)
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management, Variant & Inventory, Customer Resolution |
| **Description** | `ORDER_RETURN` movement type exists (VI §5.11.1) but no operation emits it; return approval → refund flows (OM §8.5–8.8) never restock; OM §16.3 only says "Inventory must remain synchronized". |
| **Impact** | Returned items never return to sellable stock. |
| **Resolution** | **Canonical:** return **approved** → restock `ORDER_RETURN` on item receipt (shipping "return received" event per SHIPPING §8.5); refund proceeds only after restock in the same flow. Amend VI §6.x to define the operation, OM §8.5–8.8 to call it. |

#### CC-33 — No pre-order/backorder status
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Variant & Inventory, Product Engine, Cart/Checkout |
| **Description** | VI §9.7 offers a "Pre-order" filter; no pre-order/backorder state exists in product status, inventory status, or order flows. |
| **Impact** | The filter has no backing model; pre-order UI cannot be built. |
| **Resolution** | **Blueprint default:** defer pre-order/backorder to a future release (matches product status enum and inventory status table as approved); remove the VI §9.7 filter until the feature exists, or add an ADR for the pre-order state model. No change to current scope. |

## 4.5 Money & Logistics (Payment, Finance, Shipping)

#### ML-01 — Market jurisdiction: India vs Bangladesh never resolved (Critical)
| | |
|---|---|
| **Severity** | **Critical** |
| **Affected modules** | All (payment, finance, shipping, CMS, UX, account, resolution, notifications) |
| **Description** | The majority of documents are India-scoped: PAYMENT §1.2 "Indian payment regulations (RBI), PCI DSS"; FINANCE §1.2 "Indian tax laws (GST)"; SHIPPING §2.6 "Shiprocket, Delhivery, BlueDart, DTDC (Indian market)"; rates in ₹ (₹99/₹149/₹199/₹249, free ≥₹999); ACCOUNT §3.4 "pincode … 6 digits for India", §3.9 "Validate against India Post"; RESOLUTION §2.2 "Indian consumer protection laws", §6.2 "RBI regulations"; DOCUMENT §2.5 "GST-compliant … CGST + SGST or IGST"; NOTIFICATION §2.11 "TRAI compliance"; timezone `Asia/Kolkata`. Meanwhile CMS `BaseContent.locale` is `"bn-BD" | "en-US"` (CMS §5.2), NOTIFICATION §8.7 lists language "English, Bengali, Hindi (future)", and the product name is Bengali (নবME). No doc defines the canonical market/locale/currency model, and no doc mentions Bangladesh DPA or bKash/Nagad/SSLCommerz. |
| **Impact** | Compliance (GST vs BDT/DDPA), currency display, payment providers, couriers, return-law windows, and locale defaults all depend on a market decision that no document makes. Implementation cannot proceed safely. |
| **Resolution** | **Canonical (binding):** **India is the launch market** — currency INR, locale `en-IN` default with Bengali (`bn-IN`) and Hindi (`hi-IN`) as display locales (per DATABASE §19.5, NOTIFICATION §8.7), compliance per RBI/GST/PCI DSS/TRAI/IT Act 2000, couriers per SHIPPING §2.6, payment per Razorpay. `bn-BD` in CMS §5.2 is corrected to a display-locale value (`bn-IN`); Bangladesh (BDT, bKash, DDPA) is explicitly **future market expansion**, not part of v1. Register via ADR-0001 (market decision) per GOVERNANCE T1 rules. |

#### ML-02 — Payment state machine self-contradiction
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Payment, Order Management |
| **Description** | PAYMENT §4.4 declares `captured` and `completed` both "(terminal)"; §4.5 diagram allows `CAPTURED → COMPLETED → PARTIALLY_REFUNDED/REFUNDED`; §4.6 transition table: `captured → completed, partially_refunded, refunded` and `completed → partially_refunded, refunded`. Table and rules contradict each other. |
| **Impact** | Refunds on captured/completed payments cannot be modeled (terminal states cannot transition). |
| **Resolution** | **Canonical:** `completed` = terminal for *forward* flow; `captured` and `completed` both allow refund transitions (`→ partially_refunded, refunded`) per §4.6. Rewrite §4.4 to mark refund transitions from both states, resolving the contradiction. |

#### ML-03 — Refund statuses duplicated with payment states
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Payment, Order Management, Finance |
| **Description** | Payment states include `refunded`/`partially_refunded` (PAYMENT §4.4) while §7.9 defines a separate refund-status enum `initiated, processing, completed, failed, settled`; §7.4's refund lifecycle adds `completed → partially_refunded` — a value that exists only in the payment-state enum. No mapping between `Refund.status` and `Payment.status`. |
| **Impact** | Two overlapping status dimensions with no join rule; reconciliation queries go wrong. |
| **Resolution** | **Canonical:** `Refund.status` is the operational enum (PAYMENT §7.9: initiated/processing/completed/failed/settled); `Payment.status` reflects aggregate refund state (`refunded`/`partially_refunded`) derived from refund records. Remove `partially_refunded` from the refund lifecycle (§7.4) and publish the derivation rule. |

#### ML-04 — Earnings accrual timing: four anchors
| | |
|---|---|
| **Severity** | High |
| **Affected modules** | Finance, Order Management, Shipping |
| **Description** | FINANCE §2.7: "Earnings accrued on order confirmation"; §8.4 step 1: records created at "ORDER CONFIRMED"; step 2: hold timer at "ORDER SHIPPED"; step 3: "ORDER DELIVERED → Start 7-day hold period → Earnings become eligible after hold"; §4.13: "Earnings credited to period when delivery confirmed". Four different accrual anchors, two hold-period starts (shipped vs delivered) in the same diagram. |
| **Impact** | Settlement periods and eligibility computed from different events produce wrong payout windows. |
| **Resolution** | **Canonical:** finance *records* are created at order confirmation (FINANCE §8.4-1); **hold period (7 days) starts at order `delivered`** (FINANCE §8.4-3, matching SHIPPING §3.8's 7-day close and CC-29). Amend FINANCE §4.13/§8.4-2 wording to "delivered", and §2.7 to distinguish record creation from eligibility. |

#### ML-05 — Commission cap ranges inconsistent
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Finance, System Configuration |
| **Description** | FINANCE §3.6/§6.4: global commission rate 0–50% (default 15%); max-cap setting allows 10–100% (§6.4). A cap of 75% could be configured that no rate can reach. |
| **Impact** | Misconfigured caps are silently ineffective. |
| **Resolution** | **Canonical:** cap range 10–50% (max achievable), default 50%; validation: cap ≥ highest rate. Amend FINANCE §6.4 range. |

#### ML-06 — Shipping rate inconsistencies
| | |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Shipping, Finance, Cart/Checkout |
| **Description** | SHIPPING §2.4/§5.4/§5.10: Standard ₹99 (free ≥₹999), Express ₹199 flat. §5.6 zone table: Tier 2 Express ₹249, Tier 3 Standard ₹149 — partial overrides with no precedence rule. |
| **Impact** | Checkout shows different prices than admin shipping-rule screens; finance records diverge. |
| **Resolution** | **Canonical:** base rates Standard ₹99 / Express ₹199 (SHIPPING §2.4); zone table overrides apply as explicit overrides with documented precedence (zone > method base rate); Tier 2 Express = ₹249 and Tier 3 Standard = ₹149 are *valid overrides*, but §5.6 must state the precedence rule. Amend SHIPPING §5.6 header to declare precedence. |

#### ML-07 — Invoice generation timing conflict
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Payment, Finance, Shipping, Document Engine |
| **Description** | PAYMENT §6.9: "Invoice \| Order confirmed". SHIPPING §8.9: "Invoice \| On delivery". FINANCE §8.9: timing unspecified. |
| **Impact** | Customers receive invoices at different points depending on module; GST invoice timing is legally meaningful. |
| **Resolution** | **Canonical:** **invoice at order confirmation (payment captured)** per PAYMENT §6.9/DOCUMENT §2.5 ("Order confirmed (payment received)"); the shipping-side "on delivery" entry is a *delivery note*, not an invoice — rename in SHIPPING §8.9. Document Engine remains the generator owner (see PS-04). |

#### ML-08 — COD end-to-end settlement undefined
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Payment, Finance, Shipping |
| **Description** | COD spec exists only in PAYMENT §2.6/§2.8 (courier collects, webhook confirms, Payment captured, "Courier settlement reconciled daily"). FINANCE has no COD settlement, no courier-payout flow, no cash reconciliation to shop earnings. The chain customer cash → courier → platform → shop owner is undefined end-to-end. |
| **Impact** | COD orders cannot be settled; courier cash cannot be reconciled to finance records; ₹5,000 daily collections unaccounted. |
| **Resolution** | **Blueprint default (binding):** add a COD settlement flow to FINANCE: courier collection webhook (PAYMENT) → `COD_COLLECTED` finance record → courier remittance tracked as a payable → shop-owner settlement includes COD net of courier fee; reconcile daily per PAYMENT §2.6. Amend FINANCE to define this flow and its movement types. |

#### ML-09 — Refund-before-shipment and double-payout validation gaps
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Payment, Shipping, Finance, Order Management |
| **Description** | Refund validation (PAYMENT §7.7) checks captured/not-refunded/amount/window/reason only — no shipment-state check; "Trigger: Order cancellation, return, rejection" (§7.5) allows refunding a shipped order with goods in transit (no return-received signal, despite SHIPPING §8.6 requiring return-delivered for return refunds). Settlement reversal is defined only from `COMPLETED` (FINANCE §4.5), not from `PAID`; restored earnings re-enter eligibility with only period-scoped idempotency. |
| **Impact** | Customer can be refunded while goods are in transit; a `PAID` settlement cannot be reversed; double-payout risk on restoration. |
| **Resolution** | **Canonical:** (1) refund validation adds shipment-state checks (refund after shipment requires `returned_to_sender` or return-received per SHIPPING §8.6, except fraud/admin cases); (2) reversal defined from both `COMPLETED` and `PAID` (FINANCE §4.5) with earnings-scoped idempotency key `(settlementId, orderId)` per FINANCE §4.6/§1.11. Amend PAYMENT §7.7 and FINANCE §4.5/§4.6. |

#### ML-10 — Revenue finance-record timing: on capture vs order confirmed
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Payment, Finance |
| **Description** | PAYMENT §6.7: "Payment captured → Create finance record for revenue → On capture" (capture precedes order creation, §2.5 steps 11–12). FINANCE §8.4: records created at "ORDER CONFIRMED". Same event, two timestamps. |
| **Impact** | Duplicate or missing finance records when the payment is captured before order creation. |
| **Resolution** | **Canonical:** finance records are created on **order confirmed** (FINANCE §8.4-1 — the order carries item/commission data needed for records); the payment "on capture" entry in PAYMENT §6.7 is amended to "on order confirmed (payment captured)" — one event, one record, idempotent via orderId. |

#### ML-11 — Gateway fees not modeled in Finance
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Finance, Payment |
| **Description** | Gateway-fee handling exists only in PAYMENT §9.6 ("Fee deduction") and §9.9 settlement report; FINANCE never models gateway fees as an expense line, and its event sources omit "Payments". |
| **Impact** | P&L and settlement reports miss gateway costs; net platform income overstates. |
| **Resolution** | **Canonical:** gateway fees are an expense line in FINANCE settlement/reporting, sourced from Payment's reconciliation data (PAYMENT §9.6); add "Payments" to FINANCE event sources (FINANCE §1.5). |

#### ML-12 — `PAID` settlement terminal blocks reversal
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Finance |
| **Description** | FINANCE §4.5: `PAID` = terminal; reversal only from `COMPLETED`; §4.11 "Reversal readiness" claims support. |
| **Impact** | Post-payout reversal (recovery of overpaid settlement) is impossible in the state machine. |
| **Resolution** | Per ML-09 resolution: add `PAID → REVERSED` transition (admin + reason + audit). Amend FINANCE §4.5. |

#### ML-13 — COD cap has no finance counterpart
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Payment, Finance, Shipping |
| **Description** | PAYMENT §2.6/§2.8: COD max amount default ₹5,000, restricted pincodes; no corresponding risk/settlement rule in FINANCE. |
| **Impact** | Cash collection at the cap has no courier-settlement accounting (see ML-08). |
| **Resolution** | Fold into ML-08 resolution: COD settlement flow must carry `codMaxAmount` config (PAYMENT §2.8) into courier-remittance reconciliation. |

#### ML-14 — Free-shipping threshold duplicated with wording drift
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Shipping, Finance, Cart/Checkout, Order Management, Catalog |
| **Description** | ₹999 free-shipping threshold defined in 6 places across 5 docs (OM §6.4/§6.5, SC §4.11/§11.2, CA §9.6, FINANCE §6.4) with drift: "Free over ₹999" vs "over ₹999" vs "above ₹999" vs "₹999 (configurable)". Standard ₹99/Express ₹199 duplicated similarly; 7-day hold duplicated in 6 places. |
| **Impact** | Doc hygiene; values could drift in future edits. |
| **Resolution** | Centralize numeric policy defaults in SYSTEM_CONFIGURATION (config keys: `shipping.standardRate`, `shipping.expressRate`, `shipping.freeThreshold`, `finance.holdDays`); module docs reference the keys. Low-priority cleanup. |

#### ML-15 — Wallet/escrow readiness mismatch
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Payment, Finance |
| **Description** | PAYMENT lists Wallets/Platform Wallet as future (§1.5/§2.4) and escrow readiness §14.10 ("Hold funds until delivery confirmation"); FINANCE has no wallet/escrow accounting model. |
| **Impact** | Future feature with no finance model; harmless today. |
| **Resolution** | Keep future-only; no v1 change. Register as future-readiness note. |

## 4.6 Platform Services (Notifications, Documents, BI/Exports, Data Lifecycle)

#### PS-01 — Notification retention: 3-way conflict
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Notifications, Data Lifecycle, Audit |
| **Description** | NOTIFICATION §4.8: per-type retention (security 1y archive-never-delete; order 2y; finance 7y; system 90d; marketing 30d delete; in-app unread 90d → archive). NOTIFICATION §9.7 + Mandatory Rule 16: "All notifications and messages retained permanently". DATA_LIFECYCLE §1.6/§2.13: "Notifications \| 90 days \| None (delete)"; "No archive \| Notifications not archived". |
| **Impact** | Cleanup jobs delete records that compliance paths need; security notifications purged. |
| **Resolution** | **Canonical (binding):** two distinct stores — (1) **user-facing in-app `Notification` rows: 90 days** then delete (DATA_LIFECYCLE §1.6 wins; it is the retention SSOT); (2) **notification delivery/audit records** (channel, template, status, timestamps) follow AUDIT §8.3 class-based retention (security events 5y, financial 7y, etc.) and are never deleted before their class deadline. Amend NOTIFICATION §4.8/§9.7 to this split; Data Lifecycle §2.13 defines the user-facing path. |

#### PS-02 — Conversation retention: permanent vs 90 days
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Notifications (Internal Messaging), Data Lifecycle |
| **Description** | NOTIFICATION §5.11/§5.12/§9.9: "Conversation history is never deleted" (append-only, audit). DATA_LIFECYCLE §2.14: "Messages \| 90 days \| None \| Delete". |
| **Impact** | Message purge job conflicts with the audit-trail mandate for customer-service records. |
| **Resolution** | **Canonical:** conversation and message records are **permanent (append-only)** per NOTIFICATION §5.11 — they are customer-service business records (audit value); amend DATA_LIFECYCLE §2.14 to classify conversations as permanent records (archive, never delete), with *attachments* still governed by STORAGE/Media retention. |

#### PS-03 — Audit log retention: three models
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Audit, Data Lifecycle, IAM, Security |
| **Description** | DATA_LIFECYCLE §2.15: flat "1 year active → 6 years archive → 7 years total, never hard-deleted". AUDIT §8.1: permanent primary-DB retention for financial/tax/security. AUDIT §8.3: class-based (auth 3y, user 2y, security 5y, financial 7y, system 1y) with per-class archive thresholds. |
| **Impact** | The lifecycle engine's flat 7y model would archive at 1y — contradicting AUDIT's permanent/class-based model. |
| **Resolution** | **Canonical:** AUDIT §8.3 class-based retention (as registered in IS-05); DATA_LIFECYCLE §2.15's flat model is amended to apply per-class thresholds and the AUDIT doc's "permanent" categories. |

#### PS-04 — Invoice/receipt generation triplicated
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Document Engine, Finance, Payment, Shipping |
| **Description** | DOCUMENT declares itself "the single source of truth for document generation" (§1.4 "Independent from business modules"); FINANCE §8.9/§14.5 claims GST invoice generation; PAYMENT §6.9/§15 lists receipt generation as its own; "Settlement receipt" (FINANCE §8.9) vs "Settlement Report `STL`" (DOCUMENT §2.4) — two names for one artifact. |
| **Impact** | Three engines generating the same document produce format drift and duplicate jobs. |
| **Resolution** | **Canonical:** **Document Engine owns all generation** (single pipeline: trigger → validate → template → render → PDF → R2 → notify → serve, DOCUMENT §3.4). Payment/Finance/Shipping emit events (`payment.captured`, `settlement.completed`, `order.shipped`) — they never generate PDFs. Rename "Settlement receipt" → Settlement Report (`STL`). Amend FINANCE §8.9/§14.5 and PAYMENT §6.9 to delegation. |

#### PS-05 — Payment Receipt missing from Document registry
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Document Engine, Payment |
| **Description** | DOCUMENT §1.10/§7.6/§8.5 reference Payment receipts (7y, R2, "Payment captured → Payment Receipt"), but §2.4 Type Registry and §5.6 prefixes contain no Payment Receipt entry; Appendix A.1 maps payment receipt → Refund Receipt template (conflating artifacts). |
| **Impact** | Payment receipts cannot be generated or prefixed. |
| **Resolution** | **Canonical:** add `Payment Receipt` (`PRC`) to DOCUMENT §2.4 registry and §5.6 prefixes with template; fix Appendix A.1 mapping. |

#### PS-06 — Shipping label ownership: future vs current
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Document Engine, Shipping, Data Lifecycle |
| **Description** | DOCUMENT §8.4/Appendix A.1: "Shipping Label (future)". SHIPPING §2.6/§8.9: active courier-API generation (`generateLabel(shipmentId)`, label on courier assignment). DATA_LIFECYCLE §2.11 defines shipping-label retention (until delivered, 3y). |
| **Impact** | The artifact has retention and generation but no registry entry, template, or owner in the Document Engine. |
| **Resolution** | **Canonical:** shipping labels are **active**; add `Shipping Label` (`SHL`) to DOCUMENT §2.4 registry + templates, generated via Document Engine pipeline on courier assignment (SHIPPING §8.9 event `shipment.created`); retention per DATA_LIFECYCLE §2.11 (3y). |

#### PS-07 — Order notification events: dot vs underscore, different channels
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Notifications, Order Management, Shipping |
| **Description** | NOTIFICATION §3.5: `order.created`, `order.packing`, `order.ready_to_ship`, `order.shipped` (In-App + Email; push future). ORDER_MANAGEMENT §9.4: `order_created`, `order_packing`, `order_shipped`, `out_for_delivery` (Email + Push + SMS today). Recipient sets and channel sets differ; event sets differ (`in_transit`, `order.completed` vs `delivery_failed`, `review_request`). |
| **Impact** | Notifications silently go to the wrong recipients/channels; some events never notify. |
| **Resolution** | **Canonical:** event names in dot-notation per IS-09 (AUTOMATION Appendix A registry — add missing events there: `out_for_delivery`, `delivery_failed`, `review_request`, `in_transit`, `order.completed`); channel/recipient matrix per NOTIFICATION §3.5 as the notification SSOT; ORDER_MANAGEMENT §9.4 and SHIPPING §9.4 amended to reference it (push/SMS remain future channels per NOTIFICATION §2.11/§2.12). |

#### PS-08 — Notification retry policy contradicts itself
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Notifications |
| **Description** | NOTIFICATION §4.7: "Max retries 3, exponential 1s/4s/16s, DLQ". §7.6 priority classes: Urgent 5 retries @1s, High 3, Normal 3, Low 2 linear, Background 1. |
| **Impact** | Urgent retries (5) exceed the universal cap (3); backoff sequences incompatible. |
| **Resolution** | **Canonical:** priority classes govern retries (NOTIFICATION §7.6); §4.7's "max 3" applies to Normal/High default classes only. Amend §4.7 to reference §7.6. |

#### PS-09 — Export/report retention: 7 days vs 30 days
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Export/BI, Data Lifecycle, Document Engine |
| **Description** | EXPORT §12.4.1/§8.7: export files "deleted after 7 days". EXPORT lifecycle description + DATA_LIFECYCLE §1.6/§4.10: "Exports \| 30 days"; cleanup job "Exports older than 30 days" daily. DOCUMENT §2.4: Export Report `EXP` 30 days. The BI doc contradicts itself (7d vs 30d) and both other engines use 30d. |
| **Impact** | Cleanup job deletes at 30d while doc promises 7d, or vice versa. |
| **Resolution** | **Canonical:** **30 days** (DATA_LIFECYCLE §1.6 + DOCUMENT §2.4; cleanup job cadence). Amend EXPORT §12.4.1/§8.7 to 30 days. |

#### PS-10 — Document archive/deletion policy self-contradiction
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Document Engine, Data Lifecycle |
| **Description** | DOCUMENT §3.13: "Financial docs \| Never archived (7-year retention)" and "Permanent deletion after archive retention (+3 years)" (i.e., 7+3 = 10y). §7.6: invoices/payment receipts "2 years active → 5 years archive → 7 years", deletion "Manual admin". §1.10: invoices "7 years \| R2 archive bucket". §1.6: "Financial documents never deleted, even after parent deletion". Invoice lifetime = 7y, 10y, and "never", in one document. |
| **Impact** | Archive and purge jobs follow contradictory rules; legal risk on deletion. |
| **Resolution** | **Canonical (binding):** financial documents (invoice, payment/refund receipt, settlement, audit, finance reports) — **7 years in R2 archive, never hard-deleted** (DOCUMENT §1.10 + DATA_LIFECYCLE §2.11 "Financial documents never deleted"); active→archive split at 2 years (DOCUMENT §7.6) is retained as operational tiering; delete the "additional 3 years → permanent deletion" rule (§3.13) and "Never archived" wording (§3.13). Amend DOCUMENT §3.13/§7.6 accordingly. |

#### PS-11 — Archive tier mismatch: Glacier vs archive bucket
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Data Lifecycle, Document Engine, Storage |
| **Description** | DATA_LIFECYCLE §1.5: "Cold Archive \| R2 Glacier-class \| 7+ years". DOCUMENT §7.4: `nabome-documents-archive` bucket, no tiering; §7.8 cross-region replication. |
| **Impact** | Lifecycle engine expects R2 lifecycle tiering that the Document Engine's storage plan doesn't define. |
| **Resolution** | **Canonical:** active/archive buckets as approved (DOCUMENT §7.4); R2 Glacier-class *infrequent-access tiering* is an R2 lifecycle policy on the archive bucket, to be configured (R2 supports lifecycle rules) — DATA_LIFECYCLE §1.5 retains its model, DOCUMENT §7.4 adds the tiering note. No architecture change. |

#### PS-12 — Notification preferences ownership ambiguity
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Notifications, IAM |
| **Description** | NOTIFICATION §1.6: "User preferences \| Auth domain \| `api/_lib/auth/preferences.ts`"; §8.3: `api/_handlers/auth/preferences/`; IAM §42.4 only shows `preferences Json?` on Profile — the Auth doc never specifies the preference structure, which is defined only in the Notification doc. |
| **Impact** | Preference API implemented without a schema owner. |
| **Resolution** | **Canonical:** schema lives in NOTIFICATION §8.9 (`NotificationPreferences` interface — channels, frequency, quiet hours, timezone); storage and endpoints live in the Auth domain per NOTIFICATION §1.6 (IAM §42.4 gains the typed column reference). Amend IAM to point at NOTIFICATION §8.9. |

#### PS-13 — In-app notification states vs lifecycle cleanup
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Notifications, Data Lifecycle |
| **Description** | NOTIFICATION §4.4/§4.6 states include `archived`/`expired` with retention-expiry transitions; DATA_LIFECYCLE §2.13 path is "Created → Delivered → [90 days] → Deleted" with no queued/read/archived states. |
| **Impact** | Lifecycle cleanup doesn't know notification states; auto-archive never runs. |
| **Resolution** | Per PS-01 resolution: user-facing rows follow the DATA_LIFECYCLE path; the state machine (NOTIFICATION §4.4) governs delivery lifecycle *before* cleanup (queued → delivered → read; 90d → deleted). Amend DATA_LIFECYCLE §2.13 to acknowledge the delivery states preceding deletion. |

#### PS-14 — Export one-time URL vs re-download
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Export/BI |
| **Description** | EXPORT §5.7: "One-time download \| URL invalidated after first download" + 15-min expiry. §8.5/§8.7: "Re-download expired exports (regenerate)". Ambiguity: is a second download blocked or regenerated? |
| **Impact** | UX confusion; download failures. |
| **Resolution** | **Canonical:** one-time URLs are invalidation-on-first-use for *delivery links*; expired exports can be regenerated on demand (EXPORT §8.5/§8.7) within the 30-day retention (PS-09). Amend §5.7 wording. |

#### PS-15 — Materialized-view catalog: 6 vs 8 views
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Export/BI |
| **Description** | EXPORT §2.4 diagram lists 6 materialized views; §2.6 lists 8 (adds `refund_trend_summary`, `category_performance_summary`). |
| **Impact** | Implementation may miss 2 views. |
| **Resolution** | **Canonical:** 8 views (EXPORT §2.6); amend §2.4 diagram. |

#### PS-16 — "Real-time" dashboard claims vs future WebSocket
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Export/BI, Notifications, Dashboards |
| **Description** | EXPORT §4.3.1 lists "Real-time Activity Feed" as current; §14.10 marks WebSocket infrastructure as future; NOTIFICATION §2.5: "polls every 30s or uses future WebSocket". |
| **Impact** | "Real-time" promises unfulfillable today; agents build polling against a real-time spec. |
| **Resolution** | **Canonical:** v1 uses 30s polling (NOTIFICATION §2.5) and 5-min KV-cached dashboard data (EXPORT §4.3.1); WebSocket is future. Rename the activity feed to "Near-real-time (30s polling)" in EXPORT §4.3.1. |

#### PS-17 — No digest engine
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Notifications |
| **Description** | "Daily digest / Weekly digest" exists only as a preference string (NOTIFICATION §8.7); no digest batching workflow, template, or scheduler. |
| **Impact** | Users who choose digest get immediate sends. |
| **Resolution** | **Blueprint default:** v1 ships immediate + in-app only; digest delivery is future (NOTIFICATION §8.7 preferences remain, marked future). Register via ADR if shipped. |

#### PS-18 — No unified PII classification tiers
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Export/BI, Data Lifecycle, Security, Audit |
| **Description** | PII handled as ad-hoc flags: masking in exports (EXPORT §12.4.1), "Anonymize, don't delete" (DATA_LIFECYCLE §2.5), encryption mandates (EXPORT §12.4.2); no tier model shared across engines; report sensitivity tiers (High/Medium) exist only in EXPORT §12.4.4. |
| **Impact** | Masking/anonymization applied inconsistently per module. |
| **Resolution** | **Blueprint default (binding):** adopt EXPORT §12.4.4 sensitivity tiers (High = financial/audit/PII, Medium, Low) as the platform classification; DATA_LIFECYCLE §2.5 anonymization rules keyed to tiers. Amend DATA_LIFECYCLE to reference the tier model. |

#### PS-19 — No notification ↔ audit event contract
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Notifications, Audit |
| **Description** | NOTIFICATION §12.8 mandates 7-year retention for audit logs of notifications but names no audit event types for delivery attempts; DATA_LIFECYCLE §9.2 defines lifecycle events only. |
| **Impact** | Delivery failures are not auditably traceable. |
| **Resolution** | **Canonical:** add audit events `NOTIFICATION_DELIVERED`, `NOTIFICATION_FAILED`, `NOTIFICATION_BOUNCED` to the AUDIT event catalog (per AUDIT naming, IS-09), retained per AUDIT §8.3 security class. |

#### PS-20 — Certificate (`CRT`) has no template or trigger
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Document Engine |
| **Description** | DOCUMENT §2.4 registers Certificate `CRT` ("Event-based (future)"); no template, R2 path, or generation trigger defined. |
| **Impact** | Registry entry is inert. |
| **Resolution** | Keep as future; remove from active registry or mark "(future)" explicitly in the registry table. |

#### PS-21 — Scheduled reports ownership split
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Export/BI, Document Engine, Automation |
| **Description** | EXPORT §14.6: scheduled reports "Daily, weekly, monthly, quarterly". DOCUMENT §14.9: "Daily, weekly, monthly, quarterly, yearly". Both claim ownership; neither names a scheduler. |
| **Impact** | Duplicate scheduling infrastructure; frequency ambiguity. |
| **Resolution** | **Canonical:** scheduling is a future feature (both docs agree it is §14 future-readiness); when built, it is owned by AUTOMATION_WORKFLOW_ENGINE (the scheduling SSOT, per DI-01 PG job tables) with EXPORT as the report generation consumer. Harmonize frequency sets to daily/weekly/monthly/quarterly/yearly. No v1 work. |

## 4.7 UX, Content & Dashboards (UX, Design System, Components, Navigation, Responsive, CMS, Homepage Builder, Search, CX, Account, Feedback, Resolution, Dashboards)

#### UX-01 — Footer: desktop-only vs mobile accordion
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Responsive Layout, Navigation, Component Library, CX |
| **Description** | RESPONSIVE §2.4 shell: `FOOTER (desktop only)`; NAVIGATION §6.6/§6.7/§7.5: mobile collapsible accordion footer; COMPONENT §5.2: "Mobile: collapsible sections"; CX §2.4.1 lists footer with no mobile exclusion. |
| **Impact** | Mobile users may lose legal/support links; layout conflict for the shell agent. |
| **Resolution** | **Canonical:** footer is present on all breakpoints — desktop 4-column grid, mobile collapsible accordion (NAVIGATION §6, the navigation SSOT). Amend RESPONSIVE §2.4 to remove "(desktop only)". |

#### UX-02 — Collection URLs: path vs query parameter
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Navigation, CX, Catalog, Search |
| **Description** | CX §2.5: `**Collection** | /shop/collection/summer-2026` and "No query params for core routes — `/shop/men` not `/shop?category=men`". NAVIGATION §3.15: "URL | `/shop?collection=slug`"; §3.5 desktop nav: Collections `/shop?tab=collections`, New Arrivals `/shop?sort=new`, Sale `/shop?sale=true`. UX desktop nav agrees with NAVIGATION (query params). |
| **Impact** | Deep links, SEO, and bookmarking depend on contradicting URL contracts. |
| **Resolution** | **Canonical:** path-based core routes per CX §2.5: `/shop/collection/{slug}` for collections; categories `/shop/{category-slug}`; product `/shop/{category-slug}/{product-slug}` (CC-13). Sort/filter/sale remain query parameters on those paths. Amend NAVIGATION §3.15/§3.5 to path-based collection URLs. |

#### UX-03 — Mobile header height: 56px vs 64px
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Component Library, Navigation, Responsive Layout, CX |
| **Description** | COMPONENT §5.1: "64px mobile, 80px desktop". NAVIGATION §2.7: mobile 56px, tablet 64px, desktop 80px. RESPONSIVE §2.4: 56/64/80. CX §2.4.1: "80px desktop / 56px mobile". |
| **Impact** | Sticky-header scroll offsets and layout heights diverge. |
| **Resolution** | **Canonical:** 56px mobile, 64px tablet, 80px desktop (NAVIGATION §2.7 ≡ RESPONSIVE §2.4 — 3 sources agree). Amend COMPONENT §5.1 and CX §2.4.1. |

#### UX-04 — Homepage Builder route and admin-menu membership unresolved
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Homepage Builder, Admin Dashboard, Navigation |
| **Description** | HOMEPAGE_BUILDER §1.3: Admin Dashboard at `/admin/cms/homepage`. ADMIN §3.4: route `/admin/homepage` under Layout group. NAVIGATION §3.18 admin list (11 items) contains no Homepage Builder entry at all. |
| **Impact** | The builder cannot be navigated to; route ambiguity for the router. |
| **Resolution** | **Canonical:** route `/admin/cms/homepage` (HOMEPAGE_BUILDER §1.3 — under the CMS module, consistent with `admin/cms/*`); add it to NAVIGATION §3.18 admin sidebar under CMS; amend ADMIN §3.4 route. |

#### UX-05 — Homepage section count: 13 vs 18
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | CMS Engine, Homepage Builder |
| **Description** | CMS §1.3: "13 homepage-specific sections"; HOMEPAGE_BUILDER §9.3 defines 18 section types (hero-banner … custom). |
| **Impact** | Builder agents implement 13; the catalog defines 18. |
| **Resolution** | **Canonical:** HOMEPAGE_BUILDER §9.3 catalog of 18 sections is authoritative for the homepage; CMS §1.3's "13" is corrected to reference the builder catalog (or "18"). |

#### UX-06 — Empty-state catalog: 4 vs 5 types
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Design System, UX, Component Library |
| **Description** | DESIGN_SYSTEM §25.4: No items / No results / First time / Error (4). UX §10.4: adds **Coming soon** (5). |
| **Impact** | The EmptyState component may lack the "Coming soon" variant. |
| **Resolution** | **Canonical:** 5 types (UX §10.4 superset — "Coming soon" is used by product status `scheduled`). Amend DESIGN_SYSTEM §25.4. |

#### UX-07 — CMS block count: 23 vs 25
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | CMS Engine |
| **Description** | CMS §5.3.2/§1.3: "All 23 block types" / "23+"; CMS §6.3 registry lists 25 (text 5, media 5, layout 4, commerce 3, interactive 4, advanced 4). |
| **Impact** | Registry count wrong in two places of the same doc. |
| **Resolution** | **Canonical:** 25 (CMS §6.3 registry). Correct §5.3.2/§1.3 counts. |

#### UX-08 — Admin sidebar: 11 items vs 27 modules; "Brands"/"Media" undefined
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Navigation, Admin Dashboard |
| **Description** | NAVIGATION §3.18: 11 items (Dashboard, Products, Orders, Customers, Categories, Collections, **Brands**, Coupons, CMS, **Media**, Analytics, Settings). ADMIN §3.4: 27 modules. "Brands" and "Media" exist nowhere in ADMIN's catalog; ADMIN's Shipping, Returns, Refunds, Blogs, Shop Owners, Discounts, Labels, Tags, Payments, Storage, Documents, Reports, Audit Logs, Exports, Homepage Builder are absent from NAVIGATION. |
| **Impact** | Admin cannot reach most modules; undefined "Brands"/"Media" screens. |
| **Resolution** | **Canonical:** the admin sidebar mirrors ADMIN §3.4's 27-module catalog (grouped: Overview, Content, Commerce, Operations, Finance, Platform); remove "Brands" and "Media" from NAVIGATION §3.18 (Brands is a Product Engine concept; Media is under CMS/Storage) and add the missing modules. |

#### UX-09 — Shop sidebar: 5 items vs 15 modules
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Navigation, Shop Owner Dashboard |
| **Description** | NAVIGATION §3.19: "Dashboard, Products, Orders, Customers, Settings". SHOP_OWNER §3.4: 15 modules (adds Shop Details, Product Drafts, Inventory, Shipping, Returns, Refunds, Finance, Settlements, Exports, Messages, Permissions). |
| **Impact** | Shop owners cannot reach finance/settlement/returns screens. |
| **Resolution** | **Canonical:** shop sidebar mirrors SHOP_OWNER §3.4's 15 modules. Amend NAVIGATION §3.19. |

#### UX-10 — Bottom nav height: 64px vs 56px
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Navigation |
| **Description** | NAVIGATION §3.5: "Height 64px + safe area inset". §7.5: "5 tabs, icons + labels, 56px height". §7.6: "64px height". Internal contradiction. |
| **Impact** | Content bottom padding wrong on some breakpoints. |
| **Resolution** | **Canonical:** 64px + `env(safe-area-inset-bottom)` on all breakpoints (NAVIGATION §3.5). Amend §7.5. |

#### UX-11 — Customer-visible order statuses never mapped
| |
|---|---|
| **Severity** | High |
| **Affected modules** | Order Management, CX, Account, Shop Owner Dashboard, Admin Dashboard, Notifications |
| **Description** | CX §5.8 customer badges: "pending, processing, shipped, delivered" (4 states). SHOP_OWNER §5.7.1: operational machine (processing→accepted→packing→ready_to_ship→shipped→in_transit→delivered). ADMIN §2.6 donut: "Pending, Processing, Shipped, Delivered". SHOP_OWNER §5.11.1 filter: 7 states. No doc maps operational states to customer-visible ones or to allowed customer actions (cancel/return/review). |
| **Impact** | Customers see misleading statuses; cancel/return eligibility (per OM §7.4, §8.4) cannot be derived from what's displayed. |
| **Resolution** | **Canonical (binding):** customer-visible statuses = {`pending`, `confirmed`, `processing`, `packing`, `shipped` (covers in_transit), `delivered`, `cancelled`, `returned`, `refunded`, `completed`} with the OM §1.8 18-state machine as the source; mapping table (Appendix B.4) is binding. Customer cancel allowed until `packing`; return within 7 days of `delivered`; review after `delivered`/`completed` (per FEEDBACK §2.8). Amend CX §5.8, ADMIN §2.6, SHOP_OWNER §5.11.1 to reference the mapping. |

#### UX-12 — Locale/currency split (duplicate of ML-01)
| |
|---|---|
| **Severity** | **Critical** (duplicate) |
| **Affected modules** | CMS, UX, Account, Resolution, Navigation, Dashboards |
| **Description** | CMS `BaseContent.locale` = `"bn-BD" | "en-US"` (CMS §5.2) vs India-only UX (₹ formatting in SHOP_OWNER §2.8, pincode/India Post in ACCOUNT §3.4/§3.9, RBI/Indian law in RESOLUTION §2.2/§6.2, `[Visa][MC][UPI]` footer icons in NAVIGATION §6). No canonical market/locale model. |
| **Impact** | Same as ML-01 (registered for traceability; counted once). |
| **Resolution** | See ML-01. Canonical: launch market India — currency INR, default display locale `en-IN`, Bengali `bn-IN` and Hindi `hi-IN` supported as display locales; CMS §5.2 locale values corrected to `en-IN | bn-IN | hi-IN`. |

#### UX-13 — Homepage Builder ↔ CMS integration contract one-sided
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | CMS Engine, Homepage Builder |
| **Description** | CMS §1.3: "The Homepage Builder imports CMS blocks for homepage sections". HOMEPAGE_BUILDER §2.5 documents only its own `src/features/home/sections/registry.ts` with self-contained sections; no import mechanism specified. |
| **Impact** | Two content systems with no defined boundary → duplicated editors or blocked rendering. |
| **Resolution** | **Canonical:** the Homepage Builder owns the homepage page structure and section registry (18 section types, HOMEPAGE_BUILDER §9); CMS Engine owns reusable blocks (25 types, CMS §6.3) and shared content models; the builder *may* reference CMS blocks via the CMS block API (`CmsContent` by slug) — the import contract is the CMS read API, registered in HOMEPAGE_BUILDER §2.5. No v1 block-mixing editor. |

#### UX-14 — Dashboard shared-component contract missing
| |
|---|---|
| **Severity** | Medium |
| **Affected modules** | Shop Owner Dashboard, Admin Dashboard, Component Library |
| **Description** | Shop Owner and Admin intentionally duplicate widgets (revenue trend, orders-by-status donut, notifications, quick actions, recent activity, alerts) with no shared contract; refresh cadences differ (30s feed, 5-min KPIs). |
| **Impact** | Widget divergence and duplicated implementation. |
| **Resolution** | **Canonical:** shared dashboard widgets live in `src/features/dashboard/shared/` (ChartCard, KpiCard, Donut, ActivityFeed, NotificationsBell, AlertsPanel) per COMPONENT_LIBRARY; data via BI materialized views + KV caches (EXPORT §2.6/§2.4); SHOP_OWNER and ADMIN docs cite the shared components instead of re-specifying. |

#### UX-15 — No canonical SLA register
| |
|---|---|
| **Severity** | Low |
| **Affected modules** | Resolution, Account, Shop Owner Dashboard, Notifications |
| **Description** | Consistent-but-scattered SLAs: 24h initial response (ACCOUNT §6.9), 48h review (RESOLUTION §4.4), 48h accept/reject (SHOP_OWNER §5.5), 7-day total resolution (RESOLUTION §4.11), 4h flagged-content review (FEEDBACK §5.9). |
| **Impact** | No single contract; drift risk. |
| **Resolution** | **Blueprint default:** register SLAs in SYSTEM_CONFIGURATION as config keys (`sla.responseHours`, `sla.reviewHours`, `sla.acceptHours`, `sla.resolutionDays`, `sla.flaggedContentHours`) with the values above; module docs reference the keys. |

---

# 5. Consolidated Architecture

This section consolidates the approved architecture into the single implementation model all agents must build against. It does not add new design; it assembles the 44 documents' own definitions, with Section 4 resolutions applied.

## 5.1 System Map — Layered Module Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                                 │
│  UX_ARCHITECTURE · DESIGN_SYSTEM (tokens) · COMPONENT_LIBRARY       │
│  NAVIGATION · RESPONSIVE_LAYOUT (breakpoints)                       │
├─────────────────────────────────────────────────────────────────────┤
│  APPLICATIONS                                                       │
│  SHOP_OWNER_DASHBOARD (/shop)  ·  ADMIN_DASHBOARD (/admin)          │
│  Customer SPA (src/features/*: home, shop, product, cart, account)  │
├─────────────────────────────────────────────────────────────────────┤
│  CUSTOMER-FACING DOMAINS                                            │
│  CUSTOMER_EXPERIENCE · CUSTOMER_ACCOUNT_PROFILE · SEARCH_ENGINE     │
│  CUSTOMER_FEEDBACK_REVIEWS · CUSTOMER_RESOLUTION_ENGINE             │
│  CMS_ENGINE · HOMEPAGE_BUILDER                                      │
├─────────────────────────────────────────────────────────────────────┤
│  COMMERCE CORE                                                      │
│  PRODUCT_ENGINE → CATALOG → VARIANT_INVENTORY_ENGINE                │
│  SHOPPING_CART_WISHLIST_CHECKOUT → ORDER_MANAGEMENT                 │
│  PAYMENT_ENGINE · FINANCE_ENGINE · SHIPPING_DELIVERY_LOGISTICS      │
├─────────────────────────────────────────────────────────────────────┤
│  PLATFORM SERVICES                                                  │
│  IAM/AUTH (Supabase) · SECURITY · AUDIT · NOTIFICATION_COMMUNICATION│
│  DOCUMENT_ENGINE · EXPORT_REPORTING_BI · DATA_LIFECYCLE             │
│  AUTOMATION_WORKFLOW · SYSTEM_CONFIGURATION · API_SERVICE ·         │
│  API_INTEGRATION                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE (TECH_STACK · DATABASE · STORAGE · PERFORMANCE)     │
│  Cloudflare Pages + Functions · Neon Postgres + Prisma + Hyperdrive │
│  R2 · KV · Cloudflare Queues · PG job tables · Resend · Razorpay    │
│  Sentry · PostHog · Turnstile · Supabase Auth                       │
└─────────────────────────────────────────────────────────────────────┘
```

## 5.2 Module Ownership — Single Owner Per Domain

| Domain | Owning document (SSOT) | Delegated/amended documents |
|---|---|---|
| System architecture | ARCHITECTURE.md v3.0 | — |
| Engineering standards | ENGINEERING_HANDBOOK.md | ARCHITECTURE §32.4 (FG-03) |
| Governance | GOVERNANCE_CONSTITUTION.md | All supremacy claims (FG-01) |
| Data model, money, time | DATABASE_ARCHITECTURE.md | All money/timestamp rules consistent (2.3) |
| Storage | STORAGE_ENGINE_ARCHITECTURE.md | Keys/buckets (DI-05, DI-07) |
| Performance & scale | PERFORMANCE_SCALABILITY_INFRASTRUCTURE.md | Queue provider (DI-01) |
| QA & release | QA_TESTING_RELEASE_ARCHITECTURE.md | ci.yml gates (DI-06), refs (FG-05) |
| Identity & roles | IAM + SECURITY (IS-01) | SECURITY §5.2 hierarchy canonical |
| Auth implementation | Supabase Auth via API_INTEGRATION §3.1/SECURITY §4.4 | IAM §42.4 (IS-02) |
| Audit events & retention | AUDIT_COMPLIANCE_ENGINE §8.3 | IAM/SEC/LIFECYCLE flat rules (IS-05) |
| Event constants | AUTOMATION Appendix A (IS-09) | IDENTITY_NAMING §29.3, IAM §28.4 |
| Products | PRODUCT_ENGINE | — |
| Catalog & browse | CATALOG_ARCHITECTURE | TTLs (CC-08), URLs (CC-13) |
| Variants & inventory | VARIANT_INVENTORY_ENGINE (CC-01) | PE/CA schemas (CC-01) |
| Cart/wishlist/checkout | SHOPPING_CART_WISHLIST_CHECKOUT | TTL/wishlist fixes (CC-21–25) |
| Order lifecycle | ORDER_MANAGEMENT (18-state, CC-17/18/27/28) | PAYMENT/SHIPPING status refs |
| Payments | PAYMENT_ENGINE | state machine fix (ML-02) |
| Finance & settlements | FINANCE_ENGINE | accrual (ML-04), COD (ML-08), reversal (ML-09/12) |
| Shipping & logistics | SHIPPING_DELIVERY_LOGISTICS | rates precedence (ML-06) |
| Notifications & messaging | NOTIFICATION_COMMUNICATION_MESSAGING | retention split (PS-01/02) |
| Document generation | DOCUMENT_ENGINE | registry additions (PS-04/05/06) |
| Reporting & BI | EXPORT_REPORTING_BI | retention (PS-09), views (PS-15) |
| Data lifecycle/retention | DATA_LIFECYCLE_ENGINE | audit classes (PS-03) |
| Scheduler/durable jobs | AUTOMATION_WORKFLOW (PG job tables, DI-01) | — |
| System configuration | SYSTEM_CONFIGURATION | numeric defaults registry (ML-14, UX-15) |
| API standards | API_SERVICE + API_INTEGRATION (IS-11, IS-08) | versioning/signatures |
| Search | SEARCH_ENGINE | (explicit supersession of UX §7, CATALOG §6–7) |
| Homepage | HOMEPAGE_BUILDER (§9, 18 sections) | CMS §1.3 count (UX-05) |
| CMS content | CMS_ENGINE (§6.3, 25 blocks) | locale (UX-12) |
| Reviews & ratings | CUSTOMER_FEEDBACK_REVIEWS | — |
| Returns & resolution | CUSTOMER_RESOLUTION_ENGINE | restock contract (CC-32) |
| Design tokens | DESIGN_SYSTEM | empty states (UX-06) |
| Navigation/footer/bottom-nav | NAVIGATION | footer (UX-01), URLs (UX-02), sidebars (UX-08/09) |
| Responsive rules | RESPONSIVE_LAYOUT | footer desktop-only (UX-01) |
| Dashboards | SHOP_OWNER_DASHBOARD / ADMIN_DASHBOARD | sidebar catalogs (UX-08/09), shared widgets (UX-14) |

## 5.3 Business Workflow Map — Canonical Flows

### 5.3.1 Order lifecycle (canonical, per CC-27/17/18/28)

```
pending → confirmed → processing → accepted → packing → ready_to_ship
        → shipped → in_transit → delivered → completed (30d auto, CC-29)
                        │            └→ returned → refunded
                        └→ failed_delivery → delivered (retry) | returned_to_sender
cancelled (pre-shipment per OM §7.4 matrix) → refunded (if paid, CC-16)
rejected → refunded (stock released, CC-31)
held (admin, any pre-delivery state) → resume | cancelled (CC-18)
archived (30d after completed/refunded)
```
- **Reservation:** at payment initiation, atomic DB transaction, 15-min timeout (CC-02/03).
- **Payment sub-status on Order:** `pending → authorized → captured → refunding → refunded` (CC-28).
- **Finance hooks:** records at order confirmed (ML-10); hold 7d starts at delivered (ML-04); stock restored on reject (CC-31) and return approval (CC-32).

### 5.3.2 Payment flow (canonical, per PAYMENT §2.5/§6.4 + ML-02)

```
Checkout validate → reserve inventory (15 min) → Create Payment (created)
→ gateway order (paise, "INR") → client pays → verify-payment (HMAC)
→ Payment captured → Order created (confirmed) → webhook idempotent confirmation
→ invoice generated (Document Engine, order confirmed — ML-07)
→ finance records on order confirmed (ML-10)
Refunds: initiated → processing → completed → settled (PAYMENT §7.9);
payment status derives refunded/partially_refunded (ML-03);
post-shipment refunds require return-received signal (ML-09).
```

### 5.3.3 Return & refund flow (canonical, per RESOLUTION + OM + SHIPPING + PAYMENT)

```
Customer request (≤7 days, delivered) → proof + reason → admin review (48h SLA)
→ approved → return shipment (reverse logistics, SHIPPING §8.5)
→ return received → restock ORDER_RETURN (CC-32) → refund initiated
→ refund processed → order refunded; settlement reversal path per ML-09/12
```

## 5.4 Integration Map — Event-Driven Contracts

- **Transport:** Cloudflare Queues for fire-and-forget events; PostgreSQL job tables for durable/scheduled jobs (DI-01). Event outbox for durability (NOTIFICATION §1.9/§3.6).
- **Event names:** dot-notation constants from AUTOMATION Appendix A (IS-09), the single event registry; new events are added there.
- **Publish → consume:** business modules (orders, payments, shipping, finance, auth, CMS) emit; consumers subscribe: Notifications, Document Engine, Finance, BI, Audit, Data Lifecycle, Automation. **No module calls another module's business code directly** (PAYMENT §1.11 independence rule; G.13 resolution: finance records are written by the Finance consumer, not by payment handlers).
- **Webhooks:** inbound webhooks verified with `X-Nabome-Signature` + `${timestamp}.${payload}`, 5-min freshness (IS-08).
- **Documents:** Document Engine owns generation for all engines (PS-04); registry additions PRC/SHL (PS-05/06).
- **Retention:** one table of record — DATA_LIFECYCLE + AUDIT §8.3 classes (IS-05, PS-01/02/03/09/10).

---

# 6. Enterprise Blueprint

The enterprise properties of the consolidated system, per the approved performance/security/compliance documentation.

## 6.1 Scalability Model (PERFORMANCE §1–5)

- **Targets:** 0 → 1M+ users; mobile-first (70%+ traffic, design starts 320px); 99.9% uptime (ARCHITECTURE §1.2).
- **Compute:** SPA on Cloudflare Pages + edge Pages Functions; no Node server (TECH_STACK §1.1).
- **Data:** Neon Serverless Postgres (scale-to-zero, branching, built-in pooling) + Hyperdrive; Prisma 6.
- **Cache:** KV for edge caches (products 5m, category tree 1h, settings 10m, search 1m per ENGINEERING §13.3/ARCHITECTURE §29.7); materialized views + KV aggregates for BI (5-min dashboard TTL, 1-min counters, 15-min trends — EXPORT §2.4).
- **Async:** Cloudflare Queues + PG job tables with DLQ, leases, backoff (DI-01; PERFORMANCE §5; NOTIFICATION §7.6 priority classes).
- **Pagination:** 24/page (CA §14.4/VI §16.8/PE §11.10); bulk ops ≤100 (CC-09); exports ≤100,000 rows / 50MB (EXPORT §5.7).
- **Recovery:** RPO < 1h, RTO < 4h (GOVERNANCE §13.3, PERFORMANCE §9.6); Neon PITR + pg_dump + R2 versioning (DATA_LIFECYCLE §5).

## 6.2 Performance Budgets (PERFORMANCE §3–4, P/O/F rule sets)

- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 (p95, mobile); budgets enforced by CI quality gate G4 (DI-06).
- API p95 < 300ms, p99 < 1s; webhook processing < 5s (PAYMENT §12.5); search debounce 300ms, min 2 chars (UX §7.5).
- Rate limits: Public 60 / Authenticated 120 / Admin 300 / API Key 100 / Premium 500 per minute (IS-03).
- Timeouts: payment 15 min with inventory release (PAYMENT §4.8); session idle 30m / refresh 7d (IS-04/IS-10).

## 6.3 Security Model (SECURITY, IAM, IS-01…IS-10)

- **Auth:** Supabase Auth; httpOnly cookies; access 15m / refresh 7d; max 5 sessions; rotation; Turnstile on login/register; double-submit CSRF with `CSRF_SECRET`-signed token (DI-02/03).
- **Authorization:** additive role hierarchy Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100; `super_admin` as capability flag; default-deny + least privilege on both dashboards (IS-01).
- **Defense layers:** per-account 20/min AND per-IP 10/hr lockout (IS-03); generic auth errors; PII encrypted at rest/in transit; never store tokens in localStorage.
- **Webhooks:** HMAC-SHA256 signature, `${timestamp}.${payload}`, 5-min freshness, replay tracking (IS-08).
- **Documents:** R2 signed URLs (1h documents / 15m exports), one-time download for exports (PS-14).
- **Crypto-ready:** digital signatures and watermarking remain future (DOCUMENT §14.4/§11.9).

## 6.4 Compliance Model (ML-01 + IS-05/06/07 + DATA_LIFECYCLE)

| Area | Canonical |
|---|---|
| Market (v1) | India — INR, en-IN (+ bn-IN, hi-IN display), RBI, GST, PCI DSS, TRAI, IT Act 2000; Bangladesh is future expansion (ML-01) |
| Financial retention | 7 years, archive, never hard-delete (IS-06/07, PS-10) |
| Audit classes | auth 3y / user actions 2y / security 5y / financial 7y / system 1y (IS-05) |
| Invoices | GST-compliant (CGST+SGST/IGST, HSN, GSTIN), at order confirmation (ML-07); numbering `INV-YYYY-NNNNNN` (DOCUMENT §2.5) |
| User data | GDPR-style: export own data, 3y anonymized retention then PII deletion (DATA_LIFECYCLE §2.5/§10.1) |
| Privacy | PII tiers High/Medium/Low (PS-18); consent via preferences (NOTIFICATION §8.10) |
| Anonymization | Anonymize, don't delete (DATA_LIFECYCLE §2.5) |

## 6.5 Data Lifecycle Model (DATA_LIFECYCLE §1.5, Appendix B.2)

- **Classes:** Active (Postgres + CDN) → Warm Archive (Postgres archive tables, 1–7y) → Cold Archive (R2, 7+y) → Permanent (financial/audit, never deleted).
- **Rules:** archive before delete; financial/audit/legal never physically deleted; soft-delete first (7-day recovery window); hard delete max 100 records, admin approval + 7-year check.
- **Scheduled jobs:** 14 cron jobs (cleanup daily 2am, orphan detection daily 3am, media integrity weekly, archive verification monthly) — DATA_LIFECYCLE §17.3.

## 6.6 Observability (TECH_STACK §11–12, PERFORMANCE §6)

- Pino structured logging + Sentry error tracking + PostHog analytics; Cloudflare analytics for edge; audit trail via AUDIT engine; release confidence score for release gates (QA §1.7); DLQ alerting (>10/hour → admin alert, NOTIFICATION §7.6).

---

# 7. Dependency Model

## 7.1 Module Dependency Graph

```
                        ┌────────────┐
                        │  AUTH/IAM  │
                        └─────┬──────┘
                              │ identity
┌─────────┐   ┌──────────┐   ┌─▼──────────┐   ┌─────────┐   ┌─────────┐
│ PRODUCT │──▶│ CATALOG  │──▶│ VARIANT &  │──▶│ CART /  │──▶│ ORDER   │
│ ENGINE  │   │          │   │ INVENTORY  │   │ CHECKOUT│   │ MGMT    │
└─────────┘   └──────────┘   └────────────┘   └─────────┘   └────┬────┘
                                                                 │ events
                ┌──────────────┬────────────────┬────────────────┼───────────┐
                ▼              ▼                ▼                ▼           ▼
          ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌────────────┐ ┌─────────┐
          │ PAYMENT  │──▶│ FINANCE  │   │ SHIPPING   │   │  EVENT BUS │ │ DOCUMENT│
          │ ENGINE   │   │ ENGINE   │   │ & DELIVERY │   │ (outbox +  │ │ ENGINE  │
          └────┬─────┘   └────┬─────┘   └─────┬──────┘   │ CF Queues) │ └────┬────┘
               │              │               │          └─────┬──────┘      │
               │              ▼               ▼                ▼              │
               │        ┌───────────────────────────────────────────┐        │
               └───────▶│ CONSUMERS: NOTIFICATION · AUDIT · BI ·   │◀───────┘
                        │ DATA_LIFECYCLE · AUTOMATION · RESOLUTION │
                        └───────────────────────────────────────────┘
```

## 7.2 Dependency Rules (binding)

1. **Layering:** Presentation → Applications → Customer domains → Commerce Core → Platform Services → Infrastructure. Lower layers never depend on higher layers.
2. **Direction:** Commerce core depends on platform services (auth, config, events, documents); platform services never depend on commerce business logic (PAYMENT §1.2 independence; PS-04 delegation).
3. **Decoupling:** cross-module behavior is event-driven (event bus + outbox). Direct calls only within a domain. Finance records are written by the Finance consumer of events, not by payment handlers (G.13 resolution).
4. **Identity:** every record requiring user context references `auth.users.id` (Supabase) via the app-side `User` profile (IS-02).
5. **Documents:** no business module generates PDFs; all generation flows through DOCUMENT pipeline (PS-04).
6. **Retention:** all modules enforce retention via DATA_LIFECYCLE policies (PS-01/03) with AUDIT §8.3 classes.
7. **Config:** numeric policy defaults live in SYSTEM_CONFIGURATION keys (ML-14, UX-15); module docs reference keys, never duplicate values.
8. **Scheduling:** durable schedules via PG job tables (AUTOMATION §7.5); fire-and-forget via Cloudflare Queues (DI-01).
9. **Search:** SEARCH_ENGINE reads its own index; never queries product tables at request time (SEARCH §1.1).
10. **Availability:** `availableStock` (stock − reservedStock) is the only availability truth (CC-07).

## 7.3 Key Cross-Module Contracts

| Contract | Producer | Consumer | Canonical reference |
|---|---|---|---|
| `order.created`/`order.packing`/`order.shipped`/… events | Order Management | Notifications, BI, Automation | AUTOMATION App. A + NOTIFICATION §3.5 (PS-07) |
| `payment.captured`, `refund.processed` | Payment | Finance, Document, Notifications | PAYMENT §3.5/§6.7 (ML-10) |
| `shipment.delivered`, `delivery_failed` | Shipping | Order (status sync), Finance (hold), Notifications | SHIPPING §8.4 (CC-29, ML-04) |
| `settlement.completed` | Finance | Document (`STL`), Notifications | FINANCE §8.9 (PS-04) |
| Invoice/Receipt/Label generation requests | Any engine | Document Engine | DOCUMENT §3.4 (PS-04/05/06) |
| Return approved / return received | Resolution + Shipping | Inventory (restock), Payment (refund) | CC-32, ML-09 |
| COD collected (courier webhook) | Payment | Finance (COD settlement) | ML-08 |
| Audit events | All modules | Audit Engine | IS-09, PS-19 |
| Retention queries | Lifecycle | All modules | PS-01/03/09/10 |

---

# 8. Governance Summary

## 8.1 Authority Chain (binding)

Registered from GOVERNANCE_CONSTITUTION.md §1.5 (see §1.2). **This blueprint is the conflict-adjudication authority** for the 44-document family until each owning document is amended through the process below.

## 8.2 Document Lifecycle (GOVERNANCE §1.8)

`Draft → In Review → Active → Deprecated → Archived`. A document is "Active" only with the standard header (`Version`, `Date`, `Status: Active`, `Priority`, `Supersedes`). Deprecation and archiving follow governance change classes P1/P2/P3 (GOVERNANCE §1.7).

## 8.3 Amendment Rules (binding)

1. All amendments to the 44 documents originate from **ADRs** (`decisions/adr/NNNN-{kebab-slug}.md`, monotonic numbering, supersession chains, indexed in `decisions/README.md`) — GOVERNANCE §4.6.
2. T1 architectural decisions require an ADR and may not be made inside a PR (GOVERNANCE §1.4).
3. **While an issue in Section 4 is unresolved in its owning document, the registered resolution here is binding.** Once amended, the owning document's text wins and this blueprint is updated in a patch release (Version 1.x).
4. Every resolution above names the documents to amend; those amendments are P1 (mandatory before the affected module's first implementation slice) unless marked future-only.
5. Read-Before-Write Protocol (GOVERNANCE Appendix C): Governance → Architecture → Engineering → Domain → Verify; evidence = statement of documents read in task summary.
6. Completion regime: `PROJECT_COMPLETION.md` register; Module/Phase Completion Certificates with sign-offs (GOVERNANCE Appendix E).

## 8.4 Quality Gates (GOVERNANCE §1.9, QA §8.1)

G1 code review (T0 modules need a second reviewer) · G2 architecture · G3 security · G4 performance · G5 accessibility · G6 documentation · G7 coverage · G8 release approval (Release Manager + Product Owner). Release Confidence = Σ gate scores / total × 100%; ≥90 APPROVED, 80–89 with documented waivers, <80 BLOCKED (QA §1.7). **The ci.yml must enforce G3/G4/G5/G7 + G8 + canary + rollback (DI-06).**

## 8.5 Rule-Set Consolidation

The five uncoordinated "Mandatory Rules for AI Agents" sets (FG-02) are consolidated in Section 10. GOVERNANCE §2.3's 14 rules remain non-waivable; Section 10 supersets them. No document may add a new mandatory-rule list without ADR approval.

---

# 9. Implementation Readiness Report

## 9.1 Readiness Scores by Domain

| Domain | Foundation consistency | Blocking issues (Critical/High) | Readiness |
|---|---|---|---|
| Infrastructure (Pages/Postgres/R2/Queues) | High | DI-01, DI-02, DI-06 (High) | **AMBER** — provisionable; fix queue model, CSRF, ci.yml first |
| Data model & money | High | — | **GREEN** — DECIMAL(10,2), UTC, UUID consistent |
| Identity & Security | Mixed | IS-01, IS-02 (Critical); IS-03…IS-08 (High) | **RED** — role + auth model must be frozen first |
| Product/Catalog/Variant | Mixed | CC-01 (Critical); CC-04…CC-07 (High) | **RED** — variant model unresolved |
| Cart/Checkout/Orders | Mixed | CC-02, CC-03, CC-27 (Critical); CC-17, CC-18, CC-23, CC-24, CC-28, CC-31, CC-32 (High) | **RED** — reservation + status machine first |
| Payment/Finance/Shipping | Mixed | ML-01 (Critical); ML-02, ML-04, ML-07, ML-08, ML-09, ML-10 (High) | **RED** — market decision + money flows first |
| Notifications/Documents/BI/Lifecycle | Mixed | PS-01…PS-10 (High) | **AMBER** — retention + document ownership first |
| UX/Design/Content | High | UX-02, UX-04, UX-08, UX-11 (High) | **AMBER** — URLs, builder route, sidebar catalogs |
| Dashboards | High | UX-08/09/14 (Medium/High) | **AMBER** |

## 9.2 Recommended Implementation Order (dependency-safe)

1. **ADR-0001 — Market decision (India v1)** and **ADR-0002 — Variant data model (dynamic attributes)**: unblock all commerce work (ML-01, CC-01).
2. **Foundation slice:** ci.yml gates + env matrix (DI-06/07), queue model (DI-01), CSRF (DI-02/03), money/UTC standards (green).
3. **Identity slice:** role hierarchy + Supabase Auth profile (IS-01/02), sessions (IS-04/10), rate limits (IS-03), audit classes (IS-05/06/07), webhook signature (IS-08), event registry (IS-09).
4. **Catalog slice:** Product → Variant (dynamic) → Inventory (`availableStock`, statuses, movements incl. AUTO_ADJUST fix) → Catalog (TTLs, URLs) → Search index.
5. **Transactions slice:** Cart (TTL, wishlist) → Checkout (5 stages, atomic reservation at payment initiation) → Order 18-state machine → Payment (state fix) → Finance (accrual, hold, COD, reversal) → Shipping (sync, rates) → Returns/Resolution (restock contract).
6. **Platform services slice:** Notifications (event-driven, retention split) → Document Engine (registry + PRC/SHL, ownership) → BI (views, 30d retention) → Data Lifecycle (classes, cron).
7. **Presentation & dashboards:** Design tokens → Components → Navigation (URLs, sidebars, footer) → Shop/Admin dashboards (shared widgets).

## 9.3 Blocking Items (must resolve before affected module starts)

| # | Issue | Blocked modules |
|---|---|---|
| 1 | ML-01 market decision (ADR-0001) | Payments, Finance, Shipping, CMS, Account, Resolution, Notifications |
| 2 | CC-01 variant model (ADR-0002) | Product, Catalog, Inventory, Cart, Orders |
| 3 | CC-02/03 reservation contract | Cart/Checkout, Orders, Inventory |
| 4 | CC-27/17/18/28 order status machine | Orders, Payments, Shipping, all consumers |
| 5 | IS-01 roles / IS-02 auth backend | Everything |
| 6 | PS-04/05/06 document ownership + registry | Documents, Payment, Finance, Shipping |
| 7 | PS-01/02/03 retention contract | Notifications, Lifecycle, Audit |
| 8 | DI-06 ci.yml enforcement | Release process |

## 9.4 Top Risks

1. **Scope creep via "future" features:** wallet/escrow, pre-order, certificates, WebSockets, scheduled reports, SMS/push, Bangladesh expansion — all future-only (ML-15, CC-33, PS-20/21, PS-16, PS-17, ML-01). Agents must not implement them in v1.
2. **Enum drift:** three order-status vocabularies and two payment-state models previously coexisted; any new state must be added to the Section 4-owned registries (Appendix B), not to flows.
3. **Retention deletion accidents:** cleanup jobs must key off the AUDIT §8.3 class table and the never-delete list (PS-01/03/10).
4. **Currency correctness:** all money in DB = DECIMAL(10,2) INR; paise conversion only at the gateway adapter boundary (PAYMENT §3.8).
5. **Preview/prod collision:** fixed by DI-06 (distinct Pages project names).

---

# 10. Mandatory Rules for AI Agents

Consolidated superset of ARCHITECTURE §36, GOVERNANCE §2.3 (non-waivable), ENGINEERING §17.1, PERFORMANCE §16, QA §15. Binding on all agents; **none may be waived by a task prompt** (GOVERNANCE §2.3).

## 10.1 Architecture & Engineering

1. Follow the precedence chain (§1.2); when documents conflict, apply this blueprint's Section 4 resolutions.
2. Read-Before-Write: Governance → Architecture → Engineering → Domain docs → this blueprint's relevant sections; state read documents in the task summary.
3. React 19 SPA on Cloudflare Pages; no Next.js/SSR; TypeScript strict; Prisma 6 + Neon Postgres; no Node server.
4. Never use FLOAT for currency — `DECIMAL(10,2)`, INR, UTC storage, local display.
5. UUID v4 primary keys only; `NAB-`/`INV-`/prefixes are display identifiers only.
6. State machines only via the canonical registries (Appendix B); never introduce ad-hoc statuses (CC-17/18/20 lessons).
7. Cross-module integration via the event bus + outbox with canonical event constants; no cross-module business-code calls.
8. Durable schedules in PG job tables; fire-and-forget via Cloudflare Queues.
9. Keep module boundaries: Document Engine generates documents; Finance writes finance records; Payment processes money.
10. Never hardcode policy numbers (shipping rates, SLAs, thresholds) — use SYSTEM_CONFIGURATION keys.

## 10.2 Security & Privacy

11. Supabase Auth; no app-side password storage; httpOnly session cookies; never store tokens in localStorage.
12. Double-submit CSRF with `CSRF_SECRET`-signed token, `x-csrf-token` header, timing-safe compare.
13. Authorization: additive role hierarchy; default deny; enforce on server, not just UI.
14. Webhooks: verify `X-Nabome-Signature` (`${timestamp}.${payload}`, HMAC-SHA256, 5-min freshness); return non-2xx on failures.
15. Never log or commit secrets; env vars only; secret scan in CI.
16. Validate all inputs with Zod at every boundary; sanitize HTML (DOMPurify for CMS).
17. Mask/anonymize PII per tier model; anonymize, don't delete, per lifecycle rules.
18. Idempotency keys + unique constraints for payments, webhooks, settlements, notifications.

## 10.3 Data & Retention

19. Archive before delete; financial/audit/legal records never hard-deleted (7-year minimum, archive-only).
20. Enforce retention via Data Lifecycle policies; audit classes per AUDIT §8.3.
21. Soft-delete first (7-day recovery window); hard delete ≤100 records/batch with admin approval.
22. `availableStock` is the only availability truth; reservations atomic with 15-min timeout.

## 10.4 Quality & Performance

23. Coverage: utilities ≥90%, handlers ≥80%, T0 paths 100% (FG-03).
24. Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 (p95 mobile); CI enforces budgets.
25. Pagination 24/page; bulk ≤100; exports ≤100,000 rows/50MB; uploads per endpoint limits.
26. Respect rate limits (Public 60 / Authed 120 / Admin 300 / API Key 100 / Premium 500).
27. WCAG 2.2 AA; mobile-first from 320px; design tokens only (no arbitrary values).
28. No floating promises; background work via queues; <5s webhook processing.
29. All changes pass G1–G8 gates; Release Confidence ≥90 to deploy (waivers documented).
30. Never implement future-readiness features (wallet, pre-order, WebSocket, SMS/push, scheduled reports, digital signatures, Bangladesh market) in v1 without an ADR.

---

# Appendix A — Issue Registry Index

## A.1 Foundation & Governance (FG)

| ID | Severity | Summary |
|---|---|---|
| FG-01 | Medium | Competing supremacy claims |
| FG-02 | Medium | Five uncoordinated mandatory-rule sets |
| FG-03 | High | Test coverage targets conflict |
| FG-04 | Medium | T0 path undefined |
| FG-05 | Low | Broken cross-references |
| FG-06 | Low | README_EARLY.md historical banner |

## A.2 Data & Infrastructure (DI)

| ID | Severity | Summary |
|---|---|---|
| DI-01 | High | Queue technology not pinned (two-tier model) |
| DI-02 | High | CSRF cookie flags contradict |
| DI-03 | Medium | CSRF_SECRET orphaned |
| DI-04 | Medium | Upload rate limits conflict |
| DI-05 | Medium | R2 key prefix inconsistency |
| DI-06 | High | ci.yml missing governance gates; preview/prod same project |
| DI-07 | Medium | R2 bucket naming unspecified |
| DI-08 | Low | Backup RPO/RTO absent from DATABASE |
| DI-09 | Low | robots.txt.ts duplicated |

## A.3 Identity & Security (IS)

| ID | Severity | Summary |
|---|---|---|
| IS-01 | **Critical** | Role model conflict (4 vocabularies) |
| IS-02 | **Critical** | Auth backend conflict (Prisma vs Supabase) |
| IS-03 | High | Rate-limit layers conflict |
| IS-04 | High | Session TTL conflict |
| IS-05 | High | Audit retention flat vs class-based |
| IS-06 | High | GST retention 6y vs 7y |
| IS-07 | High | RBI retention 5y vs 7y |
| IS-08 | High | Webhook signature scheme conflict |
| IS-09 | Medium | Security event naming (3 conventions) |
| IS-10 | Medium | Idle timeout 30m vs 15m |
| IS-11 | Medium | API versioning conflict |

## A.4 Commerce Core (CC)

| ID | Severity | Summary |
|---|---|---|
| CC-01 | **Critical** | ProductVariant schema irreconcilable |
| CC-02 | **Critical** | Reservation timing (3 anchors) |
| CC-03 | **Critical** | Reservation synchronicity (optimistic vs atomic) |
| CC-04 | High | SKU format (3 variants) |
| CC-05 | High | SKU editable vs immutable |
| CC-06 | High | Inventory status bands |
| CC-07 | High | Availability reads wrong stock field |
| CC-08 | Medium | Cache TTLs conflict |
| CC-09 | Medium | Bulk batch limits (50/100/20) |
| CC-10 | Medium | Draft validation conflict |
| CC-11 | Medium | Publish validation conflict |
| CC-12 | Low | Error-code registry missing; 400 vs 422 |
| CC-13 | Medium | Product URL pattern |
| CC-14 | Medium | meta shape divergence |
| CC-15 | Medium | Cancellation window conflict |
| CC-16 | Medium | cancelled→refunded transition missing |
| CC-17 | High | failed_delivery not in enum |
| CC-18 | High | held state not in enum |
| CC-19 | High | Variant cascade vs soft delete |
| CC-20 | Medium | AUTO_ADJUST undeclared |
| CC-21 | Low | Wishlist cap none vs 50 |
| CC-22 | Medium | Return window 7d vs 30d auto-complete |
| CC-23 | High | Guest cart TTL 90d vs 7d |
| CC-24 | High | Guest wishlist localStorage |
| CC-25 | Medium | Checkout 3 screens vs 5 stages |
| CC-26 | Medium | categoryId nullable vs required |
| CC-27 | **Critical** | No canonical order-status enum |
| CC-28 | High | No payment sub-status |
| CC-29 | Medium | Order completion timing |
| CC-30 | Medium | Order-creation contract in wrong doc |
| CC-31 | High | No stock restoration on rejection |
| CC-32 | High | No stock restoration on returns |
| CC-33 | Medium | No pre-order/backorder status |

## A.5 Money & Logistics (ML)

| ID | Severity | Summary |
|---|---|---|
| ML-01 | **Critical** | Market jurisdiction India vs Bangladesh |
| ML-02 | High | Payment state machine self-contradiction |
| ML-03 | Medium | Refund statuses duplicated |
| ML-04 | High | Earnings accrual timing (4 anchors) |
| ML-05 | Medium | Commission cap ranges |
| ML-06 | Medium | Shipping rate inconsistencies |
| ML-07 | High | Invoice timing (confirmed vs delivery) |
| ML-08 | High | COD end-to-end settlement undefined |
| ML-09 | High | Refund/settlement validation gaps |
| ML-10 | High | Finance-record timing (capture vs confirmed) |
| ML-11 | Medium | Gateway fees not modeled |
| ML-12 | Medium | PAID settlement terminal |
| ML-13 | Medium | COD cap no finance counterpart |
| ML-14 | Low | Free-shipping threshold duplication |
| ML-15 | Low | Wallet/escrow readiness mismatch |

## A.6 Platform Services (PS)

| ID | Severity | Summary |
|---|---|---|
| PS-01 | High | Notification retention 3-way conflict |
| PS-02 | High | Conversation retention permanent vs 90d |
| PS-03 | High | Audit retention 3 models |
| PS-04 | High | Invoice/receipt generation triplicated |
| PS-05 | Medium | Payment Receipt missing from registry |
| PS-06 | High | Shipping label future vs current |
| PS-07 | High | Order notification events (dot vs underscore) |
| PS-08 | Medium | Retry policy contradiction |
| PS-09 | High | Export retention 7d vs 30d |
| PS-10 | High | Document archive policy self-contradiction |
| PS-11 | Medium | Archive tier mismatch (Glacier vs bucket) |
| PS-12 | Medium | Notification preferences ownership |
| PS-13 | Medium | In-app states vs lifecycle cleanup |
| PS-14 | Low | One-time URL vs re-download |
| PS-15 | Low | Materialized views 6 vs 8 |
| PS-16 | Medium | Real-time claims vs future WebSocket |
| PS-17 | Low | No digest engine |
| PS-18 | Medium | No PII classification tiers |
| PS-19 | Low | No notification↔audit contract |
| PS-20 | Low | Certificate CRT inert |
| PS-21 | Medium | Scheduled reports ownership |

## A.7 UX, Content & Dashboards (UX)

| ID | Severity | Summary |
|---|---|---|
| UX-01 | Medium | Footer desktop-only vs mobile accordion |
| UX-02 | High | Collection URL path vs query param |
| UX-03 | Low | Mobile header 56px vs 64px |
| UX-04 | High | Builder route + admin menu missing |
| UX-05 | Medium | Homepage sections 13 vs 18 |
| UX-06 | Low | Empty states 4 vs 5 |
| UX-07 | Low | CMS blocks 23 vs 25 |
| UX-08 | High | Admin sidebar 11 vs 27; Brands/Media undefined |
| UX-09 | Medium | Shop sidebar 5 vs 15 |
| UX-10 | Low | Bottom nav 64px vs 56px |
| UX-11 | High | Customer-visible order statuses unmapped |
| UX-12 | **Critical** (dup) | Locale/currency split (→ ML-01) |
| UX-13 | Medium | Builder ↔ CMS contract one-sided |
| UX-14 | Medium | Dashboard shared-component contract missing |
| UX-15 | Low | No SLA register |

**Totals:** Critical 8 (1 duplicate: UX-12 = ML-01) · High 40 · Medium 44 · Low 18 · **110 registrations → 109 unique issues**. Note: IS-05 and PS-03 both cover audit-log retention from different sides of the same conflict (registered for traceability in both domains); the canonical resolution is IS-05/AUDIT §8.3.

---

# Appendix B — Canonical Enum & Standard Registry

The binding values for all implementation agents. Values supersede any conflicting text in the 44 source documents (see §1.2).

## B.1 Order Status (18 states — ORDER_MANAGEMENT §1.8 + CC-17/18/28)

`pending → confirmed → processing → accepted → rejected → packing → ready_to_ship → shipped → in_transit → delivered → completed → cancelled → failed → returned → refunded → archived` + **`failed_delivery`** (from `in_transit`; → `delivered` retry or `returned_to_sender`) + **`held`** (admin; → resume or `cancelled`). Transitions per OM §3.5 with CC-15/16/22/29 amendments. Order number: `NAB-YYYYMMDD-XXXXXX` (OM §2.9).

## B.2 Customer-Visible Order Status (UX-11 mapping)

| Customer-visible | Covers operational state(s) |
|---|---|
| pending | pending |
| confirmed | confirmed |
| processing | processing |
| packing | packing |
| shipped | shipped, in_transit |
| delivered | delivered |
| cancelled | cancelled |
| returned | returned |
| refunded | refunded |
| completed | completed |

## B.3 Payment & Refund Status

- **Payment (PAYMENT §4.4, ML-02):** `created → initiated → processing → authorized → captured → completed`, with `failed` (→ created retry), `cancelled`, `expired` (→ created retry), and refund transitions `captured/completed → partially_refunded → refunded`.
- **Refund (PAYMENT §7.9, ML-03):** `initiated → processing → completed → settled`, `failed` (retry). Types: full / partial / credit note (future).
- **Order payment sub-status (CC-28):** `pending, authorized, captured, refunding, refunded, failed`.

## B.4 Settlement Status (FINANCE §4.5, ML-09/12)

`PENDING → ELIGIBLE → CREATED → REVIEW → APPROVED → PROCESSING → COMPLETED → PAID`, plus `REJECTED → PENDING`, `FAILED` (from PROCESSING), `REVERSED` (from COMPLETED **or PAID**). Hold: 7 days from order `delivered` (ML-04).

## B.5 Shipment Status (12 states — SHIPPING §3.5)

`shipment_created → ready_to_pack → packed → ready_for_pickup → picked_up → in_transit → out_for_delivery → delivered → closed`, plus `delivery_failed`, `exception`, `returned_to_sender`. Closed 7 days post-delivery (SHIPPING §3.8). Tracking events include `returned` (SHIPPING §4.6). Casing: lowercase snake_case (diagram UPPERCASE is illustrative only — G.11 resolution).

## B.6 Product & Inventory Status

- **Product:** `draft → scheduled → published → archived` (PE App A.1 / CA §2.4 / VI §8.8).
- **Inventory (VI §5.10 + CC-06):** In Stock (`availableStock > threshold`), Low Stock (`1 ≤ availableStock ≤ threshold`), Last Few (`== 1`), Out of Stock (`≤ 0`), Discontinued. `availableStock = stock − reservedStock`. Low-stock threshold default 10.
- **Variant:** dynamic Global Attribute System (CC-01); `isActive` flag; soft-delete only (CC-19); SKU immutable (CC-05).

## B.7 Money, IDs & Time

| Item | Canonical |
|---|---|
| Currency in DB | `DECIMAL(10,2)` INR (never float); VARCHAR(3) `INR` |
| Gateway boundary | smallest unit (paise, ×100) |
| Primary keys | UUID v4 only |
| Display IDs | Order `NAB-YYYYMMDD-XXXXXX`; Documents `INV`/`ORD`/`PKS`/`RET`/`RFD`/`STL`/`FIN`/`EXP`/`AUD`/`CST`/`SST`/`CUS`/`CRT` + `PRC`/`SHL` (PS-05/06) |
| SKU | Display `{PRODUCT-CODE}-{ATTRIBUTE-SHORTCODES}`; internal `NB-{UUID-SUFFIX}`; barcode EAN-13/UPC; 1–50 chars alphanumeric+hyphen |
| Time | TIMESTAMPTZ, UTC storage, local display; locale en-IN, bn-IN, hi-IN display (ML-01) |

## B.8 Roles (IS-01)

`Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100` (additive); `super_admin` = capability flag; Compliance = scoped role; permission format `{scope}:{resource}:{action}`.

## B.9 Retention (IS-05/06/07, PS-01/02/03/09/10)

| Record class | Retention | Fate |
|---|---|---|
| Financial records (orders, payments, refunds, settlements, invoices, receipts) | 7 years | Archive, **never hard-delete** |
| Audit — authentication | 3 years | Archive |
| Audit — user actions | 2 years | Archive |
| Audit — security events | 5 years | Archive |
| Audit — financial transactions | 7 years | Archive |
| Audit — system events | 1 year | Archive |
| User PII | 3 years post-deletion | Anonymize, then delete PII |
| In-app notifications (user-facing) | 90 days | Delete (delivery audit records follow audit classes) |
| Conversations/messages | Permanent | Append-only, never delete |
| Exports/reports | 30 days | Delete |
| Shipping/return labels | 3 years | Archive |
| Sessions | 30 days | Delete |
| Guest carts | 7 days (customers: 90 days) | Delete |

## B.10 API & Delivery Standards (IS-08/11, DI-01)

`/api/v1` versioned; response envelope + error registry per API_SERVICE; webhook header `X-Nabome-Signature` with `${timestamp}.${payload}`; rate limits Public 60 / Authed 120 / Admin 300 / API Key 100 / Premium 500 per minute; events in dot-notation from the AUTOMATION registry; queues = Cloudflare Queues (fire-and-forget) + PG job tables (durable/scheduled).

---

# Appendix C — Glossary

| Term | Definition |
|---|---|
| ADR | Architecture Decision Record (`decisions/adr/NNNN-{slug}.md`) |
| availableStock | stock − reservedStock; the only availability truth |
| Blueprint default | A binding default registered by this document where sources are silent (until superseded by an ADR) |
| Canonical | The single approved definition selected from the 44 documents' own text |
| COD | Cash on Delivery |
| DLQ | Dead Letter Queue |
| DPA | Data Protection Act (Bangladesh — future market) |
| Event outbox | DB-backed queue for publishing events before dispatch |
| HSN | Harmonized System of Nomenclature (GST) |
| PITR | Point-in-Time Recovery (Neon) |
| RPO / RTO | Recovery Point Objective (< 1h) / Recovery Time Objective (< 4h) |
| SSOT | Single Source of Truth |
| T0 path | Critical user flows: auth, payments, checkout, orders, refunds, settlements (GOVERNANCE §12.3) |
| Tier 0/1/2 modules | Governance module criticality classes (T0: auth/payments/checkout/orders) |

---

*End of MASTER_ARCHITECTURE_BLUEPRINT.md v1.0 — the single source of truth for consolidated architecture, conflict resolution, and implementation planning. Next review: September 03, 2026.*
