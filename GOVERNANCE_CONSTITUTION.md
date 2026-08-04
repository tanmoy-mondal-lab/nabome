# নবME (Nabome) — AI Governance, Development Standards & Project Completion Constitution

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the supreme governance authority — the constitutional layer that defines how every Nabome decision is made, recorded, reviewed, and completed  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), ENGINEERING_HANDBOOK.md (v1.0), TECH_STACK.md (v1.0), FOLDER_ARCHITECTURE.md (v1.0), IDENTITY_NAMING_ARCHITECTURE.md (v1.0) and the entire Nabome architecture document family  
> **Companion governance artifacts:** `decisions/` (ADR log) and `PROJECT_COMPLETION.md` (completion register) — introduced by this document (Section 3.2)

---

## Table of Contents

1. [Governance Foundation](#1-governance-foundation)
2. [AI Development Rules](#2-ai-development-rules)
3. [Project Structure](#3-project-structure)
4. [Documentation Standards](#4-documentation-standards)
5. [Development Standards](#5-development-standards)
6. [Design System Governance](#6-design-system-governance)
7. [Architecture Compliance](#7-architecture-compliance)
8. [AI Collaboration](#8-ai-collaboration)
9. [Quality Governance](#9-quality-governance)
10. [Project Completion](#10-project-completion)
11. [Change Management](#11-change-management)
12. [Security Governance](#12-security-governance)
13. [Performance Governance](#13-performance-governance)
14. [Accessibility Governance](#14-accessibility-governance)
15. [Future Governance](#15-future-governance)

- [Appendix A: Document Hierarchy & Authority Map](#appendix-a-document-hierarchy--authority-map)
- [Appendix B: ADR Template](#appendix-b-adr-template)
- [Appendix C: Agent Read-Before-Write Protocol](#appendix-c-agent-read-before-write-protocol)
- [Appendix D: Decision Escalation Flow](#appendix-d-decision-escalation-flow)
- [Appendix E: Completion Certificates](#appendix-e-completion-certificates)
- [Appendix F: Governance Glossary](#appendix-f-governance-glossary)

---

## 1. Governance Foundation

### 1.1 What

Governance is the system of principles, authorities, and processes that ensures every contribution to Nabome — by any human or any AI agent — is consistent with every previous approved decision. This Constitution is the topmost layer of that system. It does not replace any technical standard; it governs *how standards are created, changed, enforced, and retired*.

Nabome is built to feel like the product of one highly experienced engineering team. Governance is the mechanism that makes this possible: no duplicated decisions, no conflicting architectures, no silent drift.

### 1.2 Why

| Reason | Consequence if ignored |
|--------|------------------------|
| **Consistency at scale** | As modules, agents, and contributors multiply, ungoverned work fragments |
| **Decision permanence** | Every approved decision becomes binding knowledge; without governance it is lost or contradicted |
| **Agent reliability** | AI agents have no institutional memory — they must inherit it from documents. Governance defines what they must read, respect, and record |
| **Enterprise growth** | The governance model must hold from a single-developer rebuild to a multi-team, marketplace, open-source enterprise (Section 15) |

### 1.3 Governance Philosophy

| Pillar | Definition | Binding Consequence |
|--------|------------|---------------------|
| **Architecture-first** | Architecture always takes precedence over implementation. No code, test, or fix may contradict an approved architecture decision | All implementation work is validated against ARCHITECTURE.md and the domain architecture documents before acceptance (Section 7) |
| **Documentation-first** | No work product is complete without its documentation. A feature without documentation is not delivered | Documentation is a mandatory review gate (G6) and a completion criterion (Section 10.6) |
| **Consistency** | Every file, module, and decision looks like it was produced by the same team | Standards are centralized (single source of truth per domain) and enforced by CI and review (Section 5) |
| **Enterprise-grade** | Production-ready, compliant, scalable, observable work only. No placeholders, no shortcuts | Quality gates G1–G8 are mandatory; S0/S1 defects block release (Section 9) |
| **Mobile-first** | 70%+ of traffic is mobile. Every design and layout decision starts at 320px | Responsive and touch standards are mandatory gates (Sections 6.6, 14.3) |
| **Premium quality** | Apple-level attention to detail in code, UI, and documentation | Definition of Done (ENGINEERING_HANDBOOK.md §18.1) applies to every module |

### 1.4 Decision Hierarchy

Every decision in Nabome belongs to exactly one tier. The tier determines the authority, the process, and whether an ADR is required.

| Tier | Decision Scope | Authority | ADR Required | Example |
|------|----------------|-----------|--------------|---------|
| **T0 — Strategic** | Vision, brand, roadmap, phase scope, market positioning | Product Owner / Founding Leadership | Yes (recorded) | Phase roadmap, marketplace expansion |
| **T1 — Architectural** | System-wide decisions: tech stack, module boundaries, cross-module contracts, data model, security model | Architecture Authority (Architecture Review Board) | Yes — mandatory | Adding an infrastructure service; changing the response envelope |
| **T2 — Domain** | Decisions inside one module that may affect other modules or the documentation family | Domain Lead (module owner) | Yes, if cross-module impact | New public ID prefix; new API endpoint group |
| **T3 — Implementation** | Code-level decisions fully inside a module, following existing standards | Agent / Developer (autonomy) | No | Naming a helper function; component internal state |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No silent escalation** | A decision that belongs to a higher tier must be escalated, never made locally | Prevents ungoverned architecture change |
| **No bypass** | T1 decisions may not be made inside a PR; they require an ADR first | Architecture precedes implementation |
| **Autonomy bounded by standards** | T3 decisions are free only within approved standards | Consistency without bureaucracy |
| **Disputed tiers** | When the tier is unclear, treat as the higher tier | Safer governance default |

### 1.5 Architecture Authority

The Architecture Authority is a defined role, not an individual personality. In practice it is exercised by:

| Authority | Holds | Power |
|-----------|-------|-------|
| **Constitution** (this document) | Governance process, completion, collaboration | Defines how decisions are made |
| **ARCHITECTURE.md (v3.0)** | System architecture — supersedes all other documentation | Binding system-wide decisions |
| **ENGINEERING_HANDBOOK.md (v1.0)** | Consolidated engineering standards — single source of truth for all engineering standards | Binding engineering practice |
| **Domain architecture documents** | Per-domain single source of truth (`{TOPIC}_ARCHITECTURE.md`) | Binding within domain scope |
| **ADR log** (`decisions/adr/`) | Approved decision records | Binding — records all decisions and supersessions |

**Precedence chain (highest first):**

```
GOVERNANCE_CONSTITUTION.md        → How decisions are made
ARCHITECTURE.md (v3.0)            → System architecture
ENGINEERING_HANDBOOK.md (v1.0)    → Engineering standards
{TOPIC}_ARCHITECTURE.md (v1.x)    → Domain standards
ADR-NNNN                          → Approved decision records
Task prompt / session instruction → Task-level direction (never contradicts the above)
```

**Conflict resolution rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Specificity wins** | Between two active documents of equal authority level, the more specific scope governs | Domain precision beats general guidance |
| **Recency within lineage** | A newer version of the *same* document supersedes the older version | Documents evolve deliberately |
| **ADR overrides** | A later-approved ADR overrides any conflicting earlier decision, and must cite what it supersedes | Decisions are changed only by decision |
| **Escalation** | Unresolvable conflicts are escalated to a T1 ADR — never resolved ad hoc | No silent contradiction |

### 1.6 Documentation Authority

| Document | Owner | Approval Required To Change |
|----------|-------|-----------------------------|
| GOVERNANCE_CONSTITUTION.md | Tech Lead (Governance) | T1 ADR + full review |
| ARCHITECTURE.md | Tech Lead | T1 ADR + G2 review |
| ENGINEERING_HANDBOOK.md | Tech Lead | T1 ADR + G2 review |
| TECH_STACK.md | Tech Lead | T1 ADR (technology changes) |
| FOLDER_ARCHITECTURE.md | Tech Lead | T1 ADR if folder rules change |
| DESIGN_SYSTEM_ARCHITECTURE.md | Design Lead | G5 review; token changes = ADR |
| DATABASE_ARCHITECTURE.md | Database Lead | ADR for schema-level decisions |
| API_SERVICE_ARCHITECTURE.md / API_INTEGRATION_ARCHITECTURE.md | Backend Lead | G2 + G3 review |
| Domain `{TOPIC}_ARCHITECTURE.md` | Domain Lead | T2 decision + G2 review |
| IDENTITY_NAMING_ARCHITECTURE.md | Tech Lead | ADR for prefix registry changes |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single source of truth** | One document per domain; no parallel duplicates | No duplicated standards |
| **Status discipline** | Every document carries Version / Date / Status / Priority / Supersedes headers | Documents are reviewable artifacts |
| **No ghost updates** | Changing a standard without updating its owning document is a governance violation | Documentation is mandatory |
| **Doc registry** | Appendix A is the authoritative registry; additions require a T2 decision | New documents are governed, not spontaneous |

### 1.7 Change Management Foundation

All changes are classified and routed (full process in Section 11):

| Change Class | Examples | Process |
|--------------|----------|---------|
| **P1 — Governance/Architecture** | New module, schema change, dependency addition, doc-hierarchy change | ADR + gates G1–G7 + review board |
| **P2 — Domain** | Feature within an existing module, API extension | Branch + PR + gates G1–G7 |
| **P3 — Maintenance** | Bug fix, refactor, documentation wording | Branch + PR + gate G1 (subset) |

### 1.8 Version Governance

| Scope | Versioning | Rule |
|-------|-----------|------|
| **Product releases** | SemVer `MAJOR.MINOR.PATCH` (ENGINEERING_HANDBOOK.md §16.5) | MAJOR = breaking (API contract, DB schema); MINOR = features; PATCH = fixes |
| **Architecture documents** | Per-document `MAJOR.MINOR` | MAJOR = scope/authority change; MINOR = content refinement; version history retained |
| **ADR numbers** | Monotonic `NNNN` sequence | Never renumbered; superseded ADRs remain on file |
| **API versions** | `/api/v{N}/` prefix for breaking; headers for additive (per API_INTEGRATION_ARCHITECTURE.md) | 6-month minimum sunset |

Document status lifecycle: `Draft → In Review → Active → Deprecated → Archived`. Only `Active` documents bind agents. A document whose scope has been absorbed by another must be marked `Deprecated` with a `Supersedes` pointer — never silently left stale.

### 1.9 Review Process

Reviews map to the quality gates G1–G8 defined in QA_TESTING_RELEASE_ARCHITECTURE.md:

| Review | Gate | Required For | Approver |
|--------|------|--------------|----------|
| Code review | G1 | Every PR | ≥1 peer; T0 modules (auth, payments, checkout) require a second reviewer |
| Architecture review | G2 | New modules, boundary changes, new deps, API/DB schema changes | Architecture Authority |
| Security review | G3 | Every PR + release | Security Lead / designated reviewer |
| Performance review | G4 | Preview + release | Performance Lead |
| Accessibility review | G5 | Every UI change | Design/A11y reviewer |
| Documentation review | G6 | Every PR touching behavior | Tech Lead / doc owner |
| Test coverage review | G7 | Per-PR for new code | QA Lead |
| Release approval | G8 | Every release | Release Manager + Product Owner |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Gate completeness** | A change requiring a gate may not merge without it | No bypass paths |
| **Evidence** | Every gate approval is recorded in the PR or release record | Auditability |
| **Waivers** | Waivers require owner, expiry date, and release documentation (per QA doc) | Controlled exceptions |
| **Small PRs** | < 500 lines, single responsibility (ENGINEERING_HANDBOOK.md §16.4) | Reviewable units |

### 1.10 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Treating governance as bureaucracy | Agents skip process, then drift | Every rule carries a failure mode it prevents; see Rationale columns |
| Local-only decisions on shared scope | Conflicting modules later | Tier table + mandatory ADRs |
| Stale documents | Agents follow outdated standards | Status lifecycle + Next Review dates |
| Multiple documents owning one domain | Duplicated, conflicting standards | Single source of truth doctrine + Appendix A registry |
| Governance that does not scale | Process collapse under growth | Section 15 tiers the governance load by contribution type |

---

## 2. AI Development Rules

### 2.1 What

The mandatory rules every AI agent must follow on every Nabome task. Section 17 of ENGINEERING_HANDBOOK.md defines the engineering-level AI rules; this section elevates them to constitutional law and adds the governance-level rules that bind agents across sessions, teams, and modules.

### 2.2 Why

- AI agents have no memory between sessions — the only continuity is the documentation they read and the decisions they record.
- A single ungoverned agent action (a re-design, a duplicate module, an unvalidated endpoint) costs the project more than the feature it delivered.
- These rules convert the project vision ("feels like one highly experienced engineering team") into enforceable behavior.

### 2.3 The Binding Rules

Every AI agent MUST follow all of the following. None may be waived by a task prompt:

| # | Rule | Standard | Rationale |
|---|------|----------|-----------|
| 1 | **Read before write** | Complete the Read-Before-Write Protocol (Appendix C) before producing any artifact | Previous decisions must govern new work |
| 2 | **Respect previous architecture** | Follow approved patterns, boundaries, and decisions exactly | Consistency and stability |
| 3 | **Never duplicate functionality** | Search existing modules, `shared/`, `lib/`, and `api/_lib/` before creating anything | DRY at project scale |
| 4 | **Never redesign completed modules** | Working, approved modules are changed only via the Change Management process (Section 11) | Stability |
| 5 | **Never hardcode business logic** | Configuration, constants, feature flags, and services only | Maintainability |
| 6 | **Build production-ready** | No placeholders, no TODOs in code, no stubs, no fake data paths | Enterprise quality |
| 7 | **Explain architectural decisions** | Record every non-trivial decision in the task summary; ADR when required | Knowledge inheritance |
| 8 | **Keep modules independent** | Dependency flow strictly per FOLDER_ARCHITECTURE.md and Section 5.2 | Modularity |
| 9 | **Maintain consistency** | Match existing code style, naming, and patterns exactly | One-team feel |
| 10 | **Documentation is mandatory** | Every deliverable updates its documents; no behavior change without doc update | Documentation-first |
| 11 | **No conflicting standards** | Never introduce a standard that contradicts an Active document; escalate instead | No duplicated decisions |
| 12 | **Respect the precedence chain** | Constitution > Architecture > Handbook > Domain docs > ADRs > prompt | Authority order |
| 13 | **Complete, don't begin** | Deliver complete work: code + tests + documentation + evidence | Completion culture |
| 14 | **Report decisions upward** | Decisions at T1/T2 tier are surfaced, never silently made | Governance transparency |

### 2.4 Reading Previous Documentation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mandatory reading** | Constitution (this doc) + ARCHITECTURE.md + ENGINEERING_HANDBOOK.md before any task | Baseline knowledge |
| **Domain reading** | The owning `{TOPIC}_ARCHITECTURE.md` document(s) for the task domain | Domain rules |
| **Decision reading** | `decisions/` index — all ADRs touching the domain | Prior decisions bind |
| **Code reading** | The module's existing code and its tests | Pattern replication |
| **Proof of reading** | Task summary states which documents were read and which decisions were respected | Verifiable compliance |
| **Unknown territory** | If a document is missing or ambiguous, escalate — never invent | No phantom standards |

### 2.5 Respecting Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Architecture precedes implementation** | No code against an architecture decision | Core philosophy |
| **Boundary compliance** | Imports and calls strictly per the dependency matrix (Section 5.2) | Module independence |
| **No silent drift** | Deviations require an ADR first — a code comment is not an approval | Controlled change |
| **Contract stability** | Public contracts (API, types, IDs) change only via Section 7 processes | Cross-module safety |

### 2.6 Avoiding Duplicated Work

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search first** | Grep/glob the codebase and documentation before creating a file, function, component, or endpoint | DRY |
| **Reuse-first ladder** | Existing `shared/ui`, `lib/`, `api/_lib/` → extend them → only then create new | No parallel utilities |
| **Duplicate detection** | Naming overlap, behavior overlap, or doc overlap triggers an investigation, not a new artifact | No duplicated decisions |
| **Cross-check** | Check the component library (COMPONENT_LIBRARY_ARCHITECTURE.md) before any new UI element | Component governance |

### 2.7 Module Independence

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No cross-feature imports** | Features import only `shared/`, `lib/`, `stores/`, `types/` — never other features | Independence |
| **Handler isolation** | `api/_handlers/` never imports other handler domains | Backend independence |
| **Leaf discipline** | `types/` imports nothing; `lib/` imports only `types/` | Dependency direction |
| **Extraction, not coupling** | Shared needs are extracted to `lib/` / `shared/` / `api/_lib/`, never coupled across modules | Reusability |

### 2.8 Reusability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Generic-first** | New shared capability is written generically once, used by all consumers | One implementation |
| **No copy-variation** | Copying a component and tweaking it is a violation; extend or compose | No drift |
| **Parameterize** | Variants via props/tokens, not duplicate files | Consistency |
| **Publish to the library** | New reusable UI goes to `src/shared/ui/` and is registered in COMPONENT_LIBRARY_ARCHITECTURE.md | Discovery |

### 2.9 Maintainability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-documenting code** | Clear names, small files (limits per FOLDER_ARCHITECTURE.md), no unnecessary comments | Readability |
| **No magic** | Constants and configuration instead of literals | Changeability |
| **Small modules** | File limits: components 300, handlers 150, hooks 200, utilities 150, types 500 lines | Reviewability |
| **Backward-compatible thinking** | Every change considers existing consumers | Safe evolution |

### 2.10 Enterprise Thinking

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Think in production** | Rate limits, validation, auth, observability, error handling on every path — not just happy paths | Enterprise grade |
| **Think in compliance** | DPDP/GDPR/RBI/GST/PCI implications of every data handling decision | Trust |
| **Think in scale** | 0 → 1M+ users: caching, pagination, indexing, statelessness per PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md | Future-proof |
| **Think in security** | The never-rules and checklists of SECURITY_ARCHITECTURE.md are binding | Zero-trust |
| **Think in completion** | Deliver evidence of quality gates, not just code | Release readiness |

### 2.11 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Skipping the reading protocol | Re-implementing or contradicting existing decisions | Appendix C checklist |
| Treating the prompt as overriding the constitution | Conflicting standards and duplicate work | Rule 12 precedence chain |
| "Small" architecture changes in PRs | Ungoverned drift compounds | Tier table + ADR mandates |
| Agent-created conventions | Inconsistent style across sessions | Rules 9, 11 |
| Half-delivered work | Broken builds, missing tests, stale docs | Rule 13 + completion gates |

---

## 3. Project Structure

### 3.1 What

The standards for where things live, how they are named, who owns them, and how the documentation family is laid out. FOLDER_ARCHITECTURE.md is the single source of truth for the folder hierarchy; this section governs the structure as a *governance contract* and introduces the governance artifacts owned by this Constitution.

### 3.2 Folder Hierarchy

The canonical tree is defined in FOLDER_ARCHITECTURE.md. This Constitution adds exactly two governance artifacts and declares them part of the root layout:

```
nabome/
├── GOVERNANCE_CONSTITUTION.md       ← This document (governance authority)
├── PROJECT_COMPLETION.md            ← Completion register (Section 10.8)
├── ARCHITECTURE.md                  ← System architecture (existing)
├── ENGINEERING_HANDBOOK.md          ← Engineering standards (existing)
├── TECH_STACK.md                    ← Technology decisions (existing)
├── FOLDER_ARCHITECTURE.md           ← Folder hierarchy (existing)
├── IDENTITY_NAMING_ARCHITECTURE.md  ← Identity/naming (existing)
├── {TOPIC}_ARCHITECTURE.md          ← Domain architecture family (existing)
├── decisions/                       ← NEW — decision records (owned by this Constitution)
│   ├── README.md                    ← ADR index (single source of truth for decisions)
│   └── adr/
│       ├── 0001-{slug}.md           ← ADR-NNNN naming (Section 4.6)
│       └── ...
└── ... (src/, api/, functions/, prisma/, e2e/, public/ — per FOLDER_ARCHITECTURE.md)
```

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hierarchy authority** | FOLDER_ARCHITECTURE.md governs code folders; this Constitution governs governance folders | No split authority |
| **No root clutter** | Root holds only config files, source directories, and documentation — never ad-hoc files | Clean structure |
| **Governance isolation** | `decisions/` contains only decision records; code never imports from it | Separation |
| **Additions are governed** | Any new root-level directory requires a T2 decision + FOLDER_ARCHITECTURE.md update | No spontaneous structure |

### 3.3 File Organization

Per FOLDER_ARCHITECTURE.md (binding): no source at root, config at root, no `src/lib/media/` barrel, no `dist/`/`node_modules`/`.env` in git, path aliases (`@/...`), named exports only, one component per file, one barrel file only (`src/shared/ui/index.ts`), file length limits as listed in Section 2.9.

### 3.4 Naming Conventions

Enforced, not redefined: components PascalCase, hooks `use`-prefixed camelCase, utilities camelCase, constants SCREAMING_SNAKE_CASE, files kebab-case (handlers) / PascalCase (components), folders plural (features) / singular (utilities), DB tables snake_case plural, API endpoints kebab-case, event names `{ENTITY}_{ACTION}`, and the full registry in IDENTITY_NAMING_ARCHITECTURE.md (public IDs, display IDs `ORD-2026-000001`, FK naming, index names `idx_`, unique constraints `uk_`).

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Registry discipline** | New public ID prefixes, display ID prefixes, storage paths, or event names are added ONLY to the registries in IDENTITY_NAMING_ARCHITECTURE.md via a T2 decision | No collisions |
| **No parallel naming schemes** | If a convention exists, it is used — no agent-local variants | Consistency |
| **Naming change = breaking** | Renaming a public identifier is a breaking change (Section 7.5) | Contract stability |

### 3.5 Documentation Layout

The documentation family is the project's institutional memory and must be navigable in a fixed order:

```
GOVERNANCE_CONSTITUTION.md          (How to decide — read first)
  → ARCHITECTURE.md                 (What the system is)
    → ENGINEERING_HANDBOOK.md       (How to engineer)
      → {TOPIC}_ARCHITECTURE.md     (Domain specifics)
        → decisions/adr/            (What was decided and why)
          → Module code + tests     (Ground truth of implementation)
```

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One level per document** | A document's scope is its domain; it must not govern other domains | No duplication |
| **Pointer discipline** | Documents reference each other by filename, never embed each other's standards | Single source of truth |
| **Discovery** | Every new document is registered in Appendix A | Findability |

### 3.6 Module Ownership

| Module / Area | Owner | Accountability |
|---------------|-------|-----------------|
| Storefront features (`src/features/*`) | Frontend Lead per feature | Feature quality, gates, docs |
| Admin (`src/features/admin/*`) | Admin/Backoffice Lead | Admin quality, gates, docs |
| Shared UI & design system (`src/shared/`, DESIGN_SYSTEM_ARCHITECTURE.md) | Design Lead | Token/component consistency |
| Backend (`api/_handlers/`, `api/_lib/`) | Backend Lead | API quality, security gates |
| Database (`prisma/`, DATABASE_ARCHITECTURE.md) | Database Lead | Schema, migrations, indexes |
| Infrastructure/DevOps (CI, environments) | DevOps | Pipeline, deployments, rollback |
| QA/E2E (`e2e/`, QA_TESTING_RELEASE_ARCHITECTURE.md) | QA Lead | Test strategy, release evidence |
| Security & compliance (SECURITY_ARCHITECTURE.md) | Security Lead | Reviews, incident response |
| Performance (PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md) | Performance Lead | Budgets, monitoring |
| Documentation family | Tech Lead + per-doc owners (§1.6) | Currency, status, registry |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Owner consults** | Changes to another owner's area require that owner's review | Accountability |
| **Ownerless code** | No module may exist without a documented owner | No orphaned surface |
| **Ownership ≠ lock** | Owners gate, not block; standards govern both sides | Balanced governance |

### 3.7 Shared Resources

| Resource | Location | Rule |
|----------|----------|------|
| UI primitives | `src/shared/ui/` | No feature logic, no API calls, `forwardRef`, `displayName` |
| Layout components | `src/shared/layout/` | Only via `shared/` rules |
| Global utilities | `src/lib/` | Pure functions only, imports only `types/` |
| Global state | `src/stores/` | Zustand stores per state rules (handbook §9) |
| Global types | `src/types/` | Leaf node |
| Backend shared | `api/_lib/` | Services only, no handler logic |

### 3.8 Asset Organization

Per IDENTITY_NAMING_ARCHITECTURE.md (binding): Cloudinary/R2 paths `nabome/{domain}/{uuid}/...`, lowercase kebab-case, plural domains, max 3 levels deep, generated file names (`invoice-ORD-2026-000001.pdf`, `products-export-2026-08-03.csv`). No user input in paths, ever.

### 3.9 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Ad-hoc root files | Unfindable, unowned artifacts | Section 3.2 rules |
| New naming schemes per agent | Colliding identifiers | Registry discipline (§3.4) |
| Documentation sprawl | Duplicate sources of truth | Appendix A registry + one level per document |
| Unowned modules | Silent drift and conflicts | §3.6 ownership matrix |

---

## 4. Documentation Standards

### 4.1 What

The standards for every documentation artifact Nabome produces: what exists, who owns it, how it is structured, how it changes, and when it is complete. Documentation is not an afterthought — it is a deliverable with its own quality gate (G6).

### 4.2 Why

- Documentation is the only durable memory across AI sessions (Section 8.7).
- Every future decision must be checkable against written precedent.
- "Documentation is mandatory" is a project rule; this section makes it operational.

### 4.3 Document Taxonomy

| Type | Purpose | Authority | Template Conventions |
|------|---------|-----------|----------------------|
| **Architecture documents** | System and domain design; binding | Per §1.6 | `# নবME (Nabome) — {Topic}` header block, numbered TOC, numbered sections, `### N.1 What` / `### N.2 Why` pattern, `| Rule | Standard | Rationale |` tables, ASCII diagrams, `✓ CORRECT / ✗ WRONG` examples, appendices, Version / Last Updated / Next Review footer |
| **Technical specifications** | Precise implementation contract for a feature or subsystem | Domain Lead | Header block + scope, interfaces, data, behavior, edge cases, acceptance criteria, gates |
| **Functional specifications** | What the system must do from a user/business perspective | Product Owner | User stories, flows, states, validation rules, acceptance criteria |
| **ADRs** | Recorded architecture decisions | Architecture Authority | Appendix B template |
| **API documentation** | Endpoint contracts | Backend Lead | Per handbook §15.2: handler comment, Zod schema as doc, response format, all error codes |
| **UI documentation** | Screen/flow behavior and states | Design Lead | Per DESIGN_SYSTEM_ARCHITECTURE.md conventions |
| **Component documentation** | Component contracts (props, variants, a11y) | Design Lead | Per COMPONENT_LIBRARY_ARCHITECTURE.md; registration required |
| **Change logs** | Release history | Release Manager | Conventional commits → changelog; breaking changes + migrations documented |

### 4.4 Architecture Documents

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Header completeness** | Version, Date, Status, Priority, Supersedes/Complements in every Active document | Auditability |
| **Status accuracy** | Draft / In Review / Active / Deprecated / Archived states are truthful and current | No stale authority |
| **What/Why/Where pattern** | Every section explains what, why, and where it applies | Usability |
| **Owned changes** | Changes go through the owner (Section 11.3); doc version bumps with change | Traceability |
| **Next Review dates** | Every document records its next review; overdue documents are flagged | No decay |

### 4.5 Technical & Functional Specifications

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Spec before build** | T1/T2 work requires an approved spec before implementation PRs | Architecture precedes implementation |
| **Acceptance criteria** | Every spec lists testable acceptance criteria mapped to gates | Verifiable completion |
| **Traceability** | Specs link to ADRs, domain docs, and completion records | Full audit trail |
| **Single location** | Specs live with their module documentation — not scattered | Findability |

### 4.6 ADRs (Architecture Decision Records)

ADRs are the project's formal decision log — the mechanism that turns decisions into binding precedent.

**Location and naming:** `decisions/adr/NNNN-{kebab-slug}.md`, zero-padded 4-digit sequence (0001, 0002, ...). Index at `decisions/README.md`, updated on every ADR.

**When required (mandatory):**

| Trigger | Example |
|---------|---------|
| T0/T1 decisions | Roadmap change, tech stack change |
| New module or new root directory | Marketplace module, new governance directory |
| Breaking change to contracts | API response envelope change, public ID format change |
| Database schema decisions with migration impact | Soft-delete strategy change |
| New dependency or external service | Adding a provider behind an adapter |
| Security/compliance posture change | Consent model change, data retention change |
| Design system token-level changes | Brand palette change |
| Document hierarchy changes | New top-level document, doc consolidation |
| Superseding a previous decision | Reversing an earlier ADR |

**Lifecycle:**

```
Draft → Proposed → (Review: G2 + owner) → Accepted / Rejected → (later) Superseded / Deprecated
```

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One decision per ADR** | Atomic records | Reversibility |
| **Monotonic numbering** | Never renumber; superseded ADRs remain on file | History integrity |
| **Binding when Accepted** | Accepted ADRs are law until superseded | Precedent |
| **Supersession chain** | A new ADR must cite the ADRs it supersedes; the old ADR is marked `Superseded by ADR-NNNN` | Traceability |
| **Rejected ADRs retained** | Rejected records stay with rationale | Prevents re-litigation |
| **Template compliance** | Appendix B template is mandatory | Uniformity |

### 4.7 API Documentation

Per handbook §15.2 and API_INTEGRATION_ARCHITECTURE.md: handler comment describes purpose; Zod schemas are the request docs; standardized response envelope; all error codes documented; breaking changes require versioning and changelog entries; external APIs require OpenAPI 3.0.

### 4.8 UI Documentation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **State coverage** | Every screen documents default, loading, empty, error, success states | DESIGN_SYSTEM requirements |
| **Token usage** | UI docs reference tokens, never raw values | Consistency |
| **Responsive behavior** | Breakpoint behavior documented per screen | Mobile-first enforcement |
| **A11y behavior** | Keyboard, focus, ARIA, reduced-motion documented | G5 readiness |

### 4.9 Component Documentation

Per COMPONENT_LIBRARY_ARCHITECTURE.md: every `src/shared/ui/` component is registered with props (unions over strings), variants, states, keyboard behavior, and accessibility notes. A new component without registration is not accepted (G6 fails).

### 4.10 Change Logs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **SemVer + conventional commits** | Changelog entries derive from commit types | Automation-ready |
| **Breaking changes section** | Every breaking change documented with migration guidance | Consumer safety |
| **Deprecation notices** | 6-month minimum notice with `Sunset:` headers per API doc | Migration time |
| **Release notes** | Per-release notes drafted at QA-ready (per QA doc) | Release gate input |

### 4.11 Documentation Quality Gate (G6)

| Criterion | Standard |
|-----------|----------|
| Owning document updated for the behavior change | Mandatory |
| Changelog entry present | Mandatory |
| API/error codes documented for new endpoints | Mandatory |
| ADR recorded when required (§4.6) | Mandatory |
| Component registered when new | Mandatory |
| No duplicate standards introduced | Mandatory |

### 4.12 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Docs updated after code, or never | Stale authority and drift | G6 gate + doc-in-PR rule |
| Documented decisions not enforced | Governance theater | ADR compliance mapping |
| Duplicate documentation | Contradictory standards | One-level-per-document rule |
| No decision records | Re-litigated architecture | Mandatory ADR triggers |
| Versionless docs | Untrackable change | Header block discipline |

---

## 5. Development Standards

### 5.1 What

The standards that keep the codebase one coherent system: boundaries, dependencies, reusability, and the classic engineering principles — expressed as *binding rules* consistent with ENGINEERING_HANDBOOK.md. This section governs *how* those principles are applied to architecture; the code style itself remains the Handbook's scope.

### 5.2 Module Boundaries

Binding dependency flow (from FOLDER_ARCHITECTURE.md, enforced by CI):

```
app/ → features/ → shared/ → lib/ → types/   (frontend)
api/_handlers/ → api/_lib/                    (backend)
```

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Frontend direction** | Features never import features; shared never imports features/stores; lib imports types only | Independence |
| **Backend direction** | Handlers import only `_lib/`; never other handler domains | Separation |
| **Boundary violation = review trigger** | Any required boundary break goes through the extraction process (FOLDER_ARCHITECTURE.md) + G2 | Controlled exception |
| **Independently maintainable** | A module can be understood, tested, and changed without reading other modules | Core requirement |

### 5.3 Dependency Management

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lockfile discipline** | pnpm with pinned lockfile; lockfile audit in CI | Reproducibility |
| **Review before adding** | Any new runtime dependency requires G2 + G3 review and TECH_STACK.md update | No surprise vendors |
| **Rejected stacks** | Explicitly rejected technologies (TECH_STACK.md) are not reintroduced | Precedent |
| **No duplicate dependencies** | Overlapping packages are rejected at review | Simplicity |
| **Version policy** | Dependency upgrades are MINOR changes; major upgrades are T1 decisions | Risk control |

### 5.4 Reusability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Shared-first** | Capability needed by 2+ modules goes to `shared/`, `lib/`, or `api/_lib/` | DRY |
| **Composition over copy** | Extend/compose existing components; never fork them | No drift |
| **Generic parameterization** | Tokens and props over duplicate files | Consistency |
| **Registration** | New reusable assets registered in their owning docs | Discovery |

### 5.5 Single Responsibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One purpose per unit** | Component, hook, handler, service, and file each have one reason to change | Maintainability |
| **File limits** | Component 300 / handler 150 / hook 200 / utility 150 / type 500 lines; split on exceed | Reviewability |
| **Handler = orchestration** | Handlers orchestrate services; business logic lives in services (`api/_lib/`) | Separation |

### 5.6 Separation of Concerns

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Layered separation** | Presentation / business / data access separated (Clean Architecture readiness, §5.10) | Testability |
| **No UI logic in stores** | State stores hold state; components hold view logic; hooks hold interaction logic | Clarity |
| **No business logic in components** | Business rules live in services, validators, and hooks | Reuse |
| **Cross-cutting centralized** | Auth, logging, validation, rate limiting centralized in `api/_lib/` and middleware | No per-handler drift |

### 5.7 DRY (Don't Repeat Yourself)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One implementation** | Every behavior exists exactly once; duplicates are reviewed as defects | Maintainability |
| **Extraction threshold** | Third occurrence of a pattern → extract to shared location | Pragmatic DRY |
| **Type-sharing** | Shared types from `src/types/` and feature `types.ts`, never redefined | Contract integrity |

### 5.8 KISS (Keep It Simple)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Simplest correct solution** | No speculative generality; no unused abstractions | Maintainability |
| **Patterns over cleverness** | Established patterns beat novel tricks | Consistency |
| **No speculative features** | Work only what the spec requires | Scope control |
| **Complexity requires justification** | Complexity beyond the obvious needs an ADR note | Guardrail |

### 5.9 SOLID Readiness

| Principle | Nabome Application |
|-----------|--------------------|
| **S — Single Responsibility** | §5.5 file/unit rules |
| **O — Open/Closed** | Components parameterized via props/tokens; services behind adapters (IPaymentProvider, etc. per API_INTEGRATION_ARCHITECTURE.md) |
| **L — Liskov** | Provider adapters implement contracts without behavioral surprises |
| **I — Interface Segregation** | Service interfaces expose only needed operations |
| **D — Dependency Inversion** | Handlers depend on services; services depend on abstractions for external providers |

### 5.10 Clean Architecture Readiness

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Boundary seams** | Extraction seams exist for every layer (per PERFORMANCE doc): database seam, cache seam, delivery seam | Future extraction |
| **Monolith-first** | Single deployment now; microservice extraction only at Enterprise scale with seams already in place | Pragmatic growth |
| **Dependency direction inward** | Outer layers depend on inner abstractions, never the reverse | Testability |
| **Provider abstraction** | Every external service sits behind an adapter interface | Vendor neutrality |

### 5.11 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Boundary exceptions accumulating | Modularity erodes into a monolith-blob | G2 on every violation |
| Dependencies added casually | Lockfile bloat, risk, duplicates | §5.3 review rules |
| Copy-paste reuse | Divergent bugs and UI drift | §5.4 composition rules |
| Over-engineering "for the future" | Unmaintainable speculative code | KISS + scope control |
| Layers fused | Untestable code | SoC + Clean Architecture seams |

---

## 6. Design System Governance

### 6.1 What

The standards that guarantee every screen of Nabome looks and behaves like one premium product. DESIGN_SYSTEM_ARCHITECTURE.md is the single source of truth for design; COMPONENT_LIBRARY_ARCHITECTURE.md for components; this section governs *how those standards are enforced* in every AI-delivered UI.

### 6.2 Why

- Visual consistency is the most visible symptom of governance quality.
- Uncontrolled UI creation is the fastest path to an inconsistent, unbranded product.
- Accessibility and responsiveness are legal and ethical obligations (DPDP/GDPR, WCAG 2.2 AA).

### 6.3 Component Reuse

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Component-first** | Any new UI is built from `src/shared/ui/` primitives; check COMPONENT_LIBRARY_ARCHITECTURE.md first | Reuse |
| **No new primitive without review** | Adding a primitive is a design-system decision (G5 + Design Lead) | Controlled surface |
| **Composition rules** | Max 3 nesting levels, compound components, `as` prop, slot pattern per component doc | Maintainability |
| **No inline duplication** | Copying a primitive's markup into a feature is a violation | Consistency |

### 6.4 UI Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tokens only** | No arbitrary colors, spacing, radii, or shadows — design tokens only | Themeability |
| **State coverage** | Default / hover / focus / active / disabled / loading / selected / error / success per state standards | Behavior consistency |
| **One pattern per need** | One loading pattern, one empty state, one error pattern per context | Predictability |
| **Motion discipline** | Motion tokens only; < 500ms; `prefers-reduced-motion` honored | Premium feel |

### 6.5 Layout Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Grid discipline** | Layout on the design system grid and spacing scale | Visual rhythm |
| **Breakpoint behavior** | Mobile-first; behavior defined per breakpoint in RESPONSIVE_LAYOUT_ARCHITECTURE.md | No improvisation |
| **Hierarchy** | Interface hierarchy per DESIGN_SYSTEM (one primary action per screen) | UX quality |

### 6.6 Accessibility Compliance

Binding: WCAG 2.2 AA — contrast 4.5:1 (3:1 large), visible focus, keyboard navigation, screen reader support, 44×44 touch targets (min 24×24 with spacing), no color-only indicators, skip link, reduced motion. Verification process in Section 14.

### 6.7 Responsive Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first design** | Design at 320px, enhance to 768px, 1280px+ | Traffic reality |
| **Touch-first** | Thumb zones, no hover dependency, swipe patterns per DESIGN_SYSTEM | Mobile UX |
| **Fluid assets** | Responsive images (srcSet 320/480/640/960/1280), `f_auto` / `q_auto` | Performance + fit |

### 6.8 Branding Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Token-bound brand** | Colors, type, spacing bound to tokens — never hardcoded | Rebrandable |
| **Typography contract** | Cormorant Garamond (display) / Manrope (body) / Noto Serif Bengali (Bangla), sizes per tokens | Premium identity |
| **Name discipline** | নবME written correctly; `Nabome` in code and docs; title pattern `{pageTitle} | নবME` | Brand integrity |
| **No decorative drift** | New visual elements must be approved against DESIGN_SYSTEM_ARCHITECTURE.md | Controlled evolution |

### 6.9 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Feature-local UI styles | Divergent screens | Tokens-only + G5 |
| Unregistered components | Duplicated primitives | Component registry gate |
| Accessibility as an afterthought | Blocked releases, compliance risk | G5 gate + Section 14 process |
| Hardcoded brand values | Broken theming and dark mode | Token discipline |
| UI shortcuts for "speed" | Long-term visual debt | G5 + completion criteria |

---

## 7. Architecture Compliance

### 7.1 What

The standards that keep every module compatible with every other module over time: contract stability, dependency validation, reviews, breaking change policy, migration strategy, and technical debt control.

### 7.2 Why

- Cross-module incompatibility is the primary failure mode of growing systems.
- Unmanaged breaking changes destroy consumer trust and block delivery.
- Technical debt is only acceptable when it is *named, owned, and scheduled*.

### 7.3 Cross-Module Compatibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Contract-first** | Cross-module interactions happen through documented contracts (API, types, events, IDs) | Stability |
| **Reference integrity** | Cross-module references always use internal UUIDs (per IDENTITY_NAMING_ARCHITECTURE.md) | No coupling to display values |
| **No cross-module queries** | Handlers query only their own tables; shared access via FK relations, read-only | Independence |
| **Event compatibility** | Events versioned (`type.version`); consumers tolerate unknown values | At-least-once + safe evolution |

### 7.4 Dependency Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **CI enforcement** | Import rules and dependency direction validated in CI (lint / architectural tests) | No silent violations |
| **Boundary audit** | Quarterly dependency matrix audit vs FOLDER_ARCHITECTURE.md | Early drift detection |
| **Provider seams** | External service usage only through adapter interfaces | Replacement safety |
| **Lockfile audit** | Dependency scan every PR + daily (per QA/SECURITY docs) | Supply chain safety |

### 7.5 Architecture Reviews (G2)

| Trigger | Review Requirement |
|---------|--------------------|
| New module or feature | Full G2 vs ARCHITECTURE.md + domain docs |
| Boundary or dependency change | G2 + extraction decision |
| API/DB schema change | G2 + G3 + ADR if breaking |
| Tech stack change | T1 ADR + G2 + TECH_STACK.md update |
| Document hierarchy change | G2 + ADR |

Reviewers verify: compliance with the precedence chain, no duplication, no conflicting standards, compatibility with all consumers, and a migration path.

### 7.6 Breaking Change Policy

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Classification** | Breaking = removing/changing response fields, changing types, adding required request fields, changing URL structure, changing auth, changing error format | Clear definition |
| **ADR mandate** | Every breaking change requires an ADR | Deliberate decision |
| **Version bump** | MAJOR version + `/api/v{N}/` (or header per versioning doc) | Isolation |
| **Deprecation period** | 6-month minimum with `Deprecation:` + `Sunset:` headers and changelog | Migration time |
| **Migration guide** | Every breaking change ships a documented migration path | Consumer safety |
| **No silent breaks** | Consumers are never surprised — deprecation notices are mandatory | Trust |

### 7.7 Migration Strategy

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Expand/contract** | Release 1: additive (nullable column + backfill); Release 2: code; Release 3: drop | Zero-downtime |
| **Migration before code** | DB migrations tested locally before deploy, applied before code (per QA doc) | Order safety |
| **Backward-compatible only** | Migrations never modify deployed migration history | Integrity |
| **Rollback-ready** | One-click rollback, migration-aware, quarterly drills (per QA doc) | Recovery |
| **Versioned data contracts** | Schema and API evolve in lockstep via releases | Consistency |

### 7.8 Technical Debt Management

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Debt register** | Debt is recorded in the owning module's documentation with owner, impact, and expiry | Named debt |
| **Debt budget** | Debt paydown allocated per release cycle; debt never grows unbounded | Sustainability |
| **No permanent hacks** | Workarounds carry issue links and removal plans (`// TODO(#123)`) | Transient only |
| **Debt review** | Architecture reviews include a debt pass | Visibility |
| **Legacy retirement** | Deprecated code is removed on the documented sunset date — not left in place | No graveyard code |

### 7.9 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Breaking changes in PATCH releases | Consumer breakage, emergency fixes | Classification + versioning |
| Unrecorded debt | Rot that becomes architecture | Debt register |
| Contract drift without review | Incompatible modules | G2 triggers + CI validation |
| Endless deprecation periods | Dead code accumulation | Sunset enforcement |
| Migration reordering | Data loss or downtime | Expand/contract discipline |

---

## 8. AI Collaboration

### 8.1 What

The standards for how AI agents work together and with humans: role definitions, communication, context sharing, conflict resolution, deliverable validation, and knowledge inheritance. These rules make multi-agent and repeated-agent work behave like one team.

### 8.2 Why

- Agents work in parallel and across sessions; without collaboration rules they produce conflicting artifacts.
- Context must flow through documents, not through memory.
- Conflicts are inevitable; the question is whether they are resolved by process or by accident.

### 8.3 Agent Responsibilities

| Role | Responsibility | Deliverable |
|------|----------------|-------------|
| **Explorer** | Read docs and code; map decisions, patterns, and gaps | Structured findings; no code |
| **Planner** | Decompose work per module boundaries; check duplication | Plan with document references |
| **Implementer** | Build per standards; run local gates | Code + tests + doc updates |
| **Reviewer** | Gate-check work vs the Constitution and standards | Gate evidence |
| **Integrator** | Merge, resolve conflicts, run full gates | Merged, green branch |
| **Documenter** | Keep the doc family and decision log current | Doc updates + ADR if needed |
| **Architect (human)** | Approve T1 decisions and gate waivers | ADR approvals |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Separation of roles** | The implementer is not the sole approver of their own work | Objectivity |
| **Role completion** | A role's deliverable is complete only when its evidence exists | No half-work |
| **Human escalation** | T0/T1 approvals and waivers are human decisions | Accountability |

### 8.4 Agent Communication

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Decision surfacing** | Every non-trivial decision appears in the task summary with rationale | Transparency |
| **Precedent citations** | Work cites the documents and ADRs it follows | Verifiability |
| **Change notices** | Cross-module impact is announced in the PR description | Coordination |
| **No silent conflict** | Disagreement with an Active decision is escalated, never ignored | Governance integrity |

### 8.5 Context Sharing

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Documents over memory** | All shared context lives in documents; agent sessions reference, never assume | Inheritance |
| **Session brief** | Agents start from the Appendix C protocol and cite what they read | Verifiable baseline |
| **ADR as handoff** | Cross-session decisions are recorded as ADRs | Continuity |
| **No tribal knowledge** | Anything learned that affects others is written down | Institutional memory |

### 8.6 Conflict Resolution

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Precedence first** | Resolve by the precedence chain (§1.5) | Deterministic |
| **Specificity second** | The more specific Active document governs | Precision |
| **ADR escalation** | Unresolved conflict → T1 ADR with both positions and a decision | Recorded resolution |
| **No fork** | Agents never maintain private parallel versions of a standard | No split-brain |
| **Respect supersession** | Older decisions yield to newer approved ADRs citing them | Legal clarity |

### 8.7 Deliverable Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-check before submit** | Run the gate subset relevant to the deliverable (lint, typecheck, tests, build) | No broken handoffs |
| **Evidence attached** | Gate outputs and doc diffs accompany the deliverable | Auditability |
| **DoD checklist** | Handbook §18.1 checklist completed for modules | Completion culture |
| **No open ends** | TODOs, stubs, or unanswered questions block completion | Production readiness |

### 8.8 Knowledge Inheritance

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Documentation-first** | Knowledge is inherited through the doc family, never through session memory | Durability |
| **Decision log** | All decisions enter `decisions/` or the owning document | Precedent |
| **Onboarding standard** | New agents follow Appendix C before touching the codebase | Uniform competence |
| **Deprecation education** | Agents must know what was *rejected* too — ADRs record rejections | No re-litigation |

### 8.9 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Agents working from memory of old sessions | Contradicting current standards | Appendix C protocol |
| Parallel agents inventing patterns | Duplicate, conflicting modules | Search-first + registry discipline |
| Conflicts resolved by silence | Drift and breakage | Escalation rules |
| Unrecorded decisions | Lost rationale, re-litigation | ADR mandate |
| Self-approved work | Quality theater | Role separation |

---

## 9. Quality Governance

### 9.1 What

The standards defining what "quality" means for code, documentation, architecture, reviews, testing, and releases — and the gates that enforce it. Quality standards are defined in QA_TESTING_RELEASE_ARCHITECTURE.md and ENGINEERING_HANDBOOK.md §14/§18; this section governs the *quality system* itself.

### 9.2 Why

- Quality is the aggregate of many small gates; a system without a quality framework has random quality.
- Release readiness is a governance state, not a feeling.
- Coverage and gate data turn quality into a measurable, improvable system.

### 9.3 Code Quality

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lint + typecheck** | ESLint 0/0, Prettier, TypeScript strict 0 errors in CI | Baseline |
| **Review quality** | PR < 500 lines, single purpose, description with what/why, tests included | Reviewable units |
| **Self-documenting** | Named exports, no `any`, no magic numbers, no console.log (per handbook §5) | Maintainability |
| **Boundary respect** | Dependency matrix enforced by CI | Architecture integrity |

### 9.4 Documentation Quality

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Current** | Status/version fields accurate; Next Review not overdue | Trust |
| **Complete** | All sections per template; no empty sections | Usability |
| **Consistent** | Terminology matches the glossary (Appendix F) and existing docs | Clarity |
| **G6 enforced** | Documentation is a gate, not a wish | Mandatory docs |

### 9.5 Architecture Quality

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Precedent-backed** | Every architecture element traces to an Active doc or ADR | Accountability |
| **No duplication** | No two modules solve the same problem | Efficiency |
| **Seam-ready** | Boundaries exist for future extraction | Future-proof |
| **Measured** | Architecture quality reviewed at G2 with the debt pass | Continuous |

### 9.6 Review Quality

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Checklist reviews** | Reviewers verify against the gate checklist, not vibes | Consistency |
| **Approval = accountability** | Approvers own the correctness of their approval | Responsibility |
| **No rubber stamps** | CI-only approval without reading is a violation | Integrity |
| **T0 second review** | Auth, payments, checkout require two reviewers (per QA doc) | Critical-path safety |

### 9.7 Testing Quality

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Coverage floors** | Utilities 90%+, handlers 80%+, components 70%+, T0 paths 100% (per TECH_STACK.md §13) | Measured quality |
| **Deterministic** | No flaky tests; unit < 100ms, E2E < 5min (per QA doc) | Reliable signal |
| **Regression for every fix** | Bug fix ships a regression test that fails on pre-fix code | No recurrence |
| **Critical flows sacred** | Auth, payments, checkout E2E always green before release | Safety |

### 9.8 Release Readiness

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Gates G1–G8** | All gates pass with evidence (per QA doc) | Systematic readiness |
| **Confidence score** | ≥ 90 with documented waivers | Objectivity |
| **No S0/S1** | Zero open critical/high defects | Safety |
| **Rollback verified** | Rollback path proven before every release | Recovery |
| **48h monitoring** | Heightened monitoring post-production per QA doc | Early catch |

### 9.9 Quality Metrics

| Metric | Cadence | Governance Use |
|--------|---------|----------------|
| Defect escape rate | Monthly | Review quality trend |
| Coverage drift | Monthly | Testing discipline |
| MTTR | Monthly | Release quality |
| Suite time | Monthly | Pipeline health |
| Debt register size | Quarterly | Debt control |

### 9.10 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Gates that pass without evidence | False confidence | Evidence rules |
| Coverage chasing without review quality | High numbers, broken design | Balanced gates |
| Quality owned by one person | Single point of failure | Role matrix + sign-offs |
| Release without rollback proof | Emergency recovery | §9.8 rules |
| Ignoring metrics | Slow, undetected decay | §9.9 cadence |

---

## 10. Project Completion

### 10.1 What

The formal criteria and evidence required to declare any unit of work complete: a module, a phase, the project, the documentation, production readiness, and launch readiness. Completion is a *recorded governance state* with named sign-off — not an assumption.

### 10.2 Why

- "Done" must mean the same thing to every agent, reviewer, and stakeholder.
- Completion records make progress auditable and prevent re-litigating finished work.
- The rebuild roadmap (README_EARLY.md, 14-week phases) requires measurable phase completion to govern the schedule honestly.

### 10.3 Module Complete

A module is complete when ALL of the following hold:

| Criterion | Evidence | Sign-off |
|-----------|----------|----------|
| Handbook §18.1 DoD checklist fully met | Completed checklist in PR/release record | Module owner |
| Gates G1–G7 passed | CI + review records | Reviewers |
| Coverage floors met, incl. T0 100% where applicable | Coverage report | QA Lead |
| Architecture compliance verified | G2 record | Architecture Authority |
| Documentation updated (owning docs, changelog, API docs) | Doc diffs | Doc owner |
| No TODOs, placeholders, or stubs | Lint + grep evidence | Reviewer |
| ADRs recorded for decisions taken | ADR files | Architecture Authority |
| Module registration complete (component registry, ID registries, Appendix A) | Registry diffs | Owners |

**Module Completion Certificate:** recorded in `PROJECT_COMPLETION.md` with module name, owner, date, gate evidence links, and known debt (if any). A module with unexpired debt is "Complete with tracked debt" — never silently complete.

### 10.4 Phase Complete

A phase (per the README_EARLY.md phase plan) is complete when:

| Criterion | Evidence |
|-----------|----------|
| Every module in the phase is Module Complete | PROJECT_COMPLETION.md certificates |
| Cross-module integration verified (no boundary violations, contracts hold) | Integration test suite green |
| Full regression suite green on `develop` | CI record |
| Phase acceptance criteria met (spec review) | Phase acceptance record |
| Phase documentation complete (doc family current for all touched domains) | G6 evidence |
| No S0/S1 open defects | QA record |
| Performance budgets verified at phase scope | G4 evidence |

**Sign-off:** Phase Owner + QA Lead + Architecture Authority. Phase Complete does not require launch; it requires *integration-safe* completion.

### 10.5 Project Complete

The project is complete when:

| Criterion | Evidence |
|-----------|----------|
| All roadmap phases are Phase Complete | PROJECT_COMPLETION.md |
| Production Ready and Launch Ready states achieved (§10.7–10.8) | G8 + launch record |
| Documentation Complete (§10.6) | G6 + doc registry audit |
| No open governance violations or unowned debt | Governance audit |
| Handover documentation exists (runbooks, monitoring, support) | Handover package |

### 10.6 Documentation Complete

The documentation family is complete when:

| Criterion | Evidence |
|-----------|----------|
| Every Active document has correct status, version, and Next Review date | Registry audit |
| Every module has an owning architecture document registered in Appendix A | Registry audit |
| Every decision has an ADR (no undocumented T1/T2 decisions) | Decision log audit |
| Every endpoint/component/event/ID in the registries is documented | Registry diffs |
| No duplicate or deprecated-but-active documents | Consistency audit |
| Changelog current for all releases | Changelog review |

### 10.7 Production Ready

Production Ready is the release-state certification:

| Criterion | Evidence |
|-----------|----------|
| Gates G1–G8 passed with evidence | Release record |
| Confidence score ≥ 90 (or documented waivers) | QA record |
| Security scans clean (no critical/high), secrets absent | G3 record |
| Migrations tested and backward-compatible | Migration review |
| Rollback path verified | Drill record |
| Monitoring, alerting, and runbooks in place | Ops checklist |
| Performance budgets met (CWV, API p95) | G4 record |
| Accessibility verified (WCAG 2.2 AA) | G5 record |

### 10.8 Launch Ready

Launch Ready adds the commercial and operational dimension:

| Criterion | Evidence |
|-----------|----------|
| Production Ready state achieved | Certification |
| DNS/SSL/CDN configured and verified (nabome.online) | Ops record |
| Seed data and environment parity verified | QA record |
| Support/contact channels operational | Ops record |
| Compliance posture documented (RBI, GST, DPDP, PCI via Razorpay) | Compliance record |
| Backup + disaster recovery verified (RPO < 1h, RTO < 4h) | DR drill record |
| Launch checklist executed (per QA doc release workflow) | Launch record |
| Post-launch monitoring plan (48h heightened) in place | Ops record |

### 10.9 Completion Registry

`PROJECT_COMPLETION.md` is the single register of completion state, following the document conventions of this family. It records, per module and phase: status, owner, completion date, gate evidence links, sign-offs, known debt, and next review. It is updated only by the completion authority (module owner + QA Lead + Architecture Authority). No module, phase, or project is "complete" until registered.

### 10.10 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| "Complete" without evidence | Hidden incompleteness | Certificate rule |
| Completing code but not docs | Broken inheritance | Documentation Complete criteria |
| Phase complete without integration | Broken handoffs | §10.4 integration criterion |
| Launch without production readiness | Operational failure | §10.7–10.8 ordering |
| Unofficial completion states | Conflicting status claims | PROJECT_COMPLETION.md exclusivity |

---

## 11. Change Management

### 11.1 What

The standards for changing anything that others depend on: architecture, documentation, contracts, versions, migrations, and deprecations. Change Management ensures every modification is deliberate, reviewed, versioned, and communicated.

### 11.2 Why

- Change is the primary source of conflict between modules, documents, and agents.
- Unmanaged change is how small drift becomes architecture breakage.
- A change without a record is a change that will be re-done or contradicted.

### 11.3 Change Classification and Routing

| Class | Scope | Process | Examples |
|-------|-------|---------|----------|
| **P1 — Governance/Architecture** | Cross-module or system-wide | ADR → spec → implementation PRs → G1–G7 → G8 at release | New module, schema change, dependency, doc hierarchy, security model |
| **P2 — Domain** | Within one module, no external contract change | Branch → PR → G1–G7 | New feature, endpoint extension, UI change |
| **P3 — Maintenance** | Fixes and refinements | Branch → PR → G1 (+ subset) | Bug fix, refactor, doc wording |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Classification honesty** | Under-classifying a change (P1 as P3) is a violation | Process integrity |
| **Sequence** | Architecture change precedes implementation change (§11.3) | Order |
| **Single PR = single class** | Mixed-class PRs are split | Reviewability |
| **Emergency override** | Hotfix path exists (ENGINEERING_HANDBOOK.md §16.6) but never carries new features | Discipline |

### 11.4 Architecture Updates

| Rule | Standard | Rationale |
|------|----------|-----------|
| **ADR first** | Architecture changes begin as ADRs before implementation | Precedent before code |
| **Doc in same change** | The owning document updates in the same change as the code | No ghost updates |
| **Consumers notified** | Cross-module impact announced with migration path | Coordination |
| **Version discipline** | Doc version bump (MAJOR if scope/authority changes) | Traceability |

### 11.5 Documentation Updates

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Doc-in-PR** | Documentation changes ship with the code change that requires them | Currency |
| **Owner approval** | Doc changes require the owning authority (§1.6) | Control |
| **Status transitions** | Draft → Active → Deprecated transitions are recorded with dates | Audit |
| **Changelog linkage** | Doc changes are referenced in release notes | Findability |

### 11.6 Versioning

| Rule | Standard | Rationale |
|------|----------|-----------|
| **SemVer everywhere** | Product, APIs, events, documents follow their versioning scheme (§1.8) | Consistent communication |
| **Version = contract** | Consumers may rely on any released version's contract | Trust |
| **No version-less changes** | Every released change carries a version | Auditability |

### 11.7 Migration

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Expand/contract only** | Zero-downtime additive-then-drop migrations (§7.7) | Safety |
| **Tested before apply** | Migrations tested locally and on staging first | Reliability |
| **Migration guide** | Every breaking change ships a written migration path | Consumer safety |
| **Migration ledger** | Migration status tracked in release records | Visibility |

### 11.8 Deprecation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Notice period** | 6-month minimum between deprecation notice and sunset | Migration time |
| **Headers** | `Deprecation: true` + `Sunset: <date>` on deprecated APIs | Machine-readable notice |
| **Changelog entry** | Deprecation announced in changelog and release notes | Awareness |
| **Sunset enforcement** | Deprecated elements are removed on the sunset date — not indefinitely retained | No graveyard code |
| **ADR for reversal** | Reversing a deprecation is a new decision | Precedent discipline |

### 11.9 Compatibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Backward-compatible default** | Changes default to additive unless a deliberate ADR decides otherwise | Safety |
| **Contract testing** | Contract tests protect consumers at CI | Early detection |
| **Compatibility matrix** | Version compatibility documented per release | Clarity |
| **No silent breaking** | Every consumer-visible break is announced (§7.6) | Trust |

### 11.10 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Code before decision | Ungoverned architecture | ADR-first rule |
| Docs updated by different people than code | Doc/code divergence | Doc-in-PR |
| Deprecation without sunset | Dead code forever | Sunset enforcement |
| Version bumps without changelog | Consumers in the dark | Changelog linkage |
| Hotfixes carrying features | Scope creep and risk | Emergency override rule |

---

## 12. Security Governance

### 12.1 What

The standards governing security, privacy, dependency, and compliance reviews, and the approval workflow that gates them. SECURITY_ARCHITECTURE.md is the single source of truth for security design; this section governs the *security review system*.

### 12.2 Why

- The prior codebase's history (committed secrets, unvalidated endpoints, JWT in localStorage) is the cautionary tale — governance exists to prevent recurrence.
- DPDP (₹250 crore fines), GDPR, RBI, GST, and PCI obligations make compliance a legal requirement, not an option.
- Security failures are the highest-cost failures; they are prevented by process, not by luck.

### 12.3 Security Reviews (G3)

| Surface | Classification | Review Requirement |
|---------|---------------|--------------------|
| Auth, payments, checkout, orders | **T0** | Every PR: manual auth/authz/IDOR/payment review + automated scans; zero-risk tolerance for known-exploitable findings |
| Search, profile, reviews, admin | **T1** | Every PR: automated scans + manual review of changed paths |
| Marketing, CMS read paths | **T2** | Automated scans only + release-level review |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every PR** | G3 applies to every PR, depth by surface class | No un-reviewed code |
| **Never-rules** | The 15 never-rules of SECURITY_ARCHITECTURE.md are absolute (e.g. no secrets in committed .env, no client-side-only validation, no raw SQL interpolation) | Zero tolerance |
| **Pre/post-implementation checklists** | SECURITY_ARCHITECTURE.md checklists completed per change | Discipline |
| **Secrets** | Cloudflare Pages secrets only; rotation every 90 days; quarterly inventory | No recurrence |
| **AuthN/AuthZ order** | Authenticate first, authorize second, ownership third (per IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md) | Zero-trust |

### 12.4 Privacy Reviews

| Trigger | Requirement |
|---------|-------------|
| New data collection or field | DPDP/GDPR data flow review; consent model per SECURITY_ARCHITECTURE.md |
| New third-party integration | Data-sharing review + privacy policy impact |
| Retention or deletion changes | Retention schedule review (orders/audit 7 years, etc.) |
| New analytics/telemetry | Anonymization and consent verification |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consent-first** | Explicit, granular, revocable consent; no dark patterns | Legal + ethical |
| **Minimization** | Collect only what the feature needs | DPDP principle |
| **PII protection** | PII AES-256 at rest; never in logs; anonymize before analytics | Data safety |
| **Right-to-erasure path** | Data export within 24h, deletion with grace period, per SECURITY_ARCHITECTURE.md | Compliance |

### 12.5 Dependency Reviews

| Cadence | Scope |
|---------|-------|
| Every PR | Lockfile audit (no critical/high new findings) |
| Daily | Automated dependency scan |
| Quarterly | License, maintenance, and abandonment review of all runtime deps |
| Major upgrade | T1 decision + G3 review |

### 12.6 Compliance Reviews

| Domain | Requirement |
|--------|-------------|
| Payments (RBI/PCI DSS) | Card data never stored; Razorpay vault; PCI via Razorpay; KYC for high-value transactions |
| Tax (GST Act, Income Tax Act) | GST invoices, 7-year records, TDS handling |
| Corporate (Companies Act) | Financial record keeping, immutable business records |
| Privacy (DPDP, GDPR) | Consent, grievance officer, breach notification ≤ 72h, cross-border transfer protection |
| Security posture | Quarterly review; role reviews; access audits |

### 12.7 Approval Workflow

| Level | Decision | Approver |
|-------|----------|----------|
| L1 | Code-level security implementation | Reviewing engineer |
| L2 | Security-relevant feature approval | Security Lead |
| L3 | Security model changes, exemptions | Security Lead + Architecture Authority |
| L4 | Compliance posture changes, legal matters | Product Owner / Legal counsel |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Exemptions are rare and recorded** | Exemption with owner, risk assessment, expiry — same as waivers | Controlled risk |
| **Incident path** | IR runbook per SECURITY_ARCHITECTURE.md; severity-based alerting (SMS+Email+Slack immediate for critical) | Response readiness |
| **No security gate skip** | G3 may not be waived for T0/T1 surfaces | Absolute |

### 12.8 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Security review only at release | Late discovery, blocked releases | Per-PR G3 |
| Secrets in env templates | Recurrence of the committed-secret incident | Secrets policy + scans |
| Privacy reviewed once | Drift from DPDP requirements | Trigger-based privacy reviews |
| Dependency review skipped | Supply chain attack | Per-PR + daily scans |
| Exemptions without expiry | Permanent insecurity | Exemption rules |

---

## 13. Performance Governance

### 13.1 What

The standards for performance budgets, monitoring, optimization reviews, and scalability reviews. PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md is the single source of truth for performance design; this section governs the *performance review system* that keeps every release within budget.

### 13.2 Why

- Performance is a brand attribute for a premium product and a conversion factor for commerce.
- Budgets turn performance from opinion into a gate.
- Scale readiness (0 → 1M+ users) is a governance question: are the seams, metrics, and headroom in place before growth demands them?

### 13.3 Performance Budgets (binding)

| Budget | Target | Gate |
|--------|--------|------|
| Core Web Vitals | LCP < 2.5s, INP < 200ms, CLS < 0.1 | G4 + CI (Lighthouse) |
| API latency | Read p95 < 200ms, write p95 < 400ms | G4 |
| Database queries | p95 < 100ms | G4 |
| Availability | 99.9% (~8.8h/yr), error budget 0.1%/month | G8 |
| Recovery | RPO < 1h, RTO < 4h | DR drill |
| Cache hit ratios | CDN > 95%, KV > 85% | Monitoring |
| Media weights | Hero < 150KB, card < 50KB, thumbnail < 15KB, banner < 120KB | G4 |
| Loading feedback | < 200ms | G5 |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Budgets are gates** | Budget violation fails the build/release (per QA doc) | Enforceability |
| **No regression vs baseline** | Versioned baselines; weekly RUM p75 trends | Trend control |
| **Load before release** | Load tests before major/minor releases on staging-scale | Preparedness |

### 13.4 Monitoring

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every endpoint observed** | Logs, metrics, and traces on every endpoint (Pino schema, requestId propagation) | Observability |
| **SLO burn alerts** | Alert on 2x budget burn in the hour; 5xx > 1% for 5 min; p95 > 300ms for 10 min | Early detection |
| **Capacity alerts** | Edge > 70%, DB > 80%, storage > 70%, projected full < 30 days | Headroom |
| **48h post-release window** | Heightened monitoring after every production release | Regression catch |
| **Alert runbooks** | Every alert has a runbook; monthly triage | Response readiness |

### 13.5 Optimization Reviews

| Trigger | Review |
|---------|--------|
| New query or endpoint | EXPLAIN ANALYZE; index review (composite, covering, partial) |
| New page or component | Bundle budget check; lazy loading; image budgets |
| Cache-related change | Cache invalidation deterministic (commit-then-invalidate); key discipline `{domain}:{entity}:{id}` |
| Any change touching the request path | No CPU-heavy work in request path; select fields only |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cache before DB** | Prefer KV cache over database reads (per performance doc P-rules) | Cost + latency |
| **No N+1** | Prisma queries only; eager loading; no raw SQL | Predictability |
| **Deterministic invalidation** | Versioned keys, collection invalidation (detail + lists + search + facets) | No stale caches |
| **Never lazy-load LCP** | LCP image `fetchpriority=high`, never lazy | CWV |

### 13.6 Scalability Reviews

| Trigger | Review |
|---------|--------|
| New feature with growth impact | Capacity model update; headroom check |
| Approaching threshold | Read replicas > 1000 read QPS; writes > 100 write QPS; partition readiness |
| Quarterly | Capacity report: utilization, growth, projected date-to-threshold |
| Enterprise milestone | Multi-region/multi-cloud readiness check (stateless everywhere, seams present) |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Seams before scale** | Extraction seams exist before scale demands them | No rewrite at scale |
| **Monolith-first** | Microservices only at Enterprise tier with seams in place | Pragmatism |
| **Partition-ready data** | Tenant FKs from day one; time-partitionable append-heavy tables | Future-proof |
| **Statelessness** | No session affinity; scale is horizontal | Elasticity |

### 13.7 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Budgets documented but not gated | Silent regression | CI budget gates |
| Monitoring without alerts | Observability theater | SLO burn alerts + runbooks |
| Optimization on feelings | Wrong hotspots | EXPLAIN ANALYZE + RUM data |
| Scaling reactively | Emergency rewrites | Capacity cadence + seams |
| Performance owned by one person | Blind spots | G4 role + review triggers |

---

## 14. Accessibility Governance

### 14.1 What

The standards for accessibility reviews, responsive verification, UX validation, and WCAG 2.2 AA compliance verification. Design requirements are defined in DESIGN_SYSTEM_ARCHITECTURE.md and QA_TESTING_RELEASE_ARCHITECTURE.md; this section governs the *verification system*.

### 14.2 Why

- WCAG 2.2 AA is a binding product requirement and a legal expectation (DPDP/GDPR accessibility posture).
- Accessibility failures are user-facing product defects — not cosmetic issues.
- Mobile-first demands touch and responsive verification on every change.

### 14.3 Accessibility Reviews (G5)

| Level | Requirement |
|-------|-------------|
| Automated | WCAG 2.2 AA scans in CI on every UI change |
| Manual | Keyboard walkthrough of every T0/T1 flow per release |
| Screen readers | VoiceOver + at least one more SR per release |
| Expert audit | Full a11y audit per major release |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Contrast** | 4.5:1 normal / 3:1 large on rendered tokens incl. states | WCAG 1.4.3 |
| **Keyboard** | Full keyboard operation; visible focus; skip link | WCAG 2.1/2.4 |
| **Touch** | ≥ 44×44 targets (min 24×24 with spacing) | WCAG 2.5.5 |
| **Reduced motion** | `prefers-reduced-motion` honored for all motion | WCAG 2.3.3 |
| **No color-only indicators** | Icons + text alongside color | WCAG 1.4.1 |
| **ARIA discipline** | Proper roles, labels, live regions, focus trap for overlays | SR compatibility |
| **Text scaling** | 200% zoom verified; no pinch-zoom blocking | WCAG 1.4.4 |

### 14.4 Responsive Verification

| Breakpoint | Verification |
|------------|--------------|
| 320px | All flows usable one-handed; no horizontal scroll; touch targets valid |
| 768px | Tablet layout verified; navigation patterns valid |
| 1280px+ | Desktop layout verified; no orphan states |

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every screen, every state** | Responsive verification covers default/loading/empty/error/success states | No blind spots |
| **Mobile-first review order** | Verify 320px before 1280px | Priority |
| **Fluid media** | No fixed-width images; srcSet everywhere | CLS + fit |

### 14.5 UX Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Design system compliance** | UX patterns per DESIGN_SYSTEM (one primary action, 3 clicks to goal, undo over confirmation) | Premium feel |
| **State completeness** | No blank screens; feedback for every action; progress indicators | Quality |
| **Error UX** | Clear, specific, actionable, non-blaming error states (§4.8) | Trust |
| **Loading UX** | Feedback < 200ms; skeletons for lists; no layout shift | Polished |

### 14.6 WCAG 2.2 Compliance Verification

| Check | Method |
|-------|--------|
| Automated scan | CI + Lighthouse accessibility runs |
| Manual keyboard walkthrough | Every T0/T1 flow per release |
| SR verification | VoiceOver + one more screen reader |
| Contrast verification | Rendered tokens incl. hover/focus/disabled states |
| Reduced-motion verification | All animations respect the preference |
| 200% zoom | No content loss or overlap |

### 14.7 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| A11y checked only at release | Costly late fixes | Per-PR G5 |
| Automated scans alone | False confidence | Manual + SR verification |
| Responsive checked on desktop only | Mobile breakage | 320px-first verification |
| UX validation skipped for AI work | Feature works, experience fails | §14.5 rules |
| Accessible "for the gate" | Superficial compliance | Expert audit per major release |

---

## 15. Future Governance

### 15.1 What

The standards that keep governance effective as Nabome grows: new agents, new modules, plugins, third-party contributors, marketplace extensions, open-source readiness, and enterprise customization. Governance must scale with enterprise growth — this section defines how.

### 15.2 New AI Agents

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Onboarding protocol** | Every agent completes the Read-Before-Write Protocol (Appendix C) before first task | Uniform competence |
| **Role assignment** | Every agent is assigned an explicit role (§8.3) with bounded authority | No role drift |
| **Scope authorization** | Agents operate within their assigned tier (T2/T3 autonomy; T1 by ADR) | No escalation bypass |
| **Knowledge check** | Deliverables cite the standards they follow — evidence of inheritance | Verifiable compliance |
| **Agent registry** | New agent types are registered in the doc family with their responsibilities | Governed growth |

### 15.3 New Modules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Module charter** | A new module requires: owning architecture doc, ownership assignment, boundary declaration, interface contract, completion criteria | Precedent before code |
| **ADR mandate** | New modules are T1 decisions with an ADR | Deliberate addition |
| **No overlap** | Charter must prove the capability does not exist elsewhere (search-first) | No duplicates |
| **Registry updates** | Module registered in FOLDER_ARCHITECTURE.md, Appendix A, and component/ID registries | Discovery |
| **Independent maintainability** | New module must be completable, testable, and releasable on its own | Modularity |

### 15.4 Plugin Ecosystem

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Contract-first** | Plugins integrate through documented, versioned extension points — never core modification | Stability |
| **Sandboxed execution** | Plugins run isolated with bounded permissions | Security |
| **Manifest standard** | Every plugin ships a manifest: version, permissions, contracts used, owner | Governability |
| **Compatibility policy** | Plugin versioning follows the API versioning policy (6-month deprecation) | Consumer safety |
| **Review path** | Plugin approval: security review + contract review + docs | No wild west |

### 15.5 Third-Party Contributors

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Contributor guide** | A public guide derived from this Constitution (governance, standards, gates) | Onboarding |
| **Full gates apply** | All PRs pass G1–G7 regardless of contributor | Quality parity |
| **Architecture review for architecture change** | T1 changes by contributors require Architecture Authority review | Controlled surface |
| **Ownership preserved** | Modules remain owned by Nabome leads; contributors propose, owners approve | Accountability |
| **DCO/CLA** | Contribution licensing recorded before merge | Legal hygiene |
| **Small PRs only** | PR < 500 lines; big ideas arrive as RFC/ADR first | Reviewability |

### 15.6 Marketplace Extensions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Extension registry** | Marketplace extensions registered with manifest, version, and audit status | Trust |
| **Security certification** | Extensions pass security review before listing | Platform trust |
| **Tenant isolation** | Extension data isolated per tenant (partition-ready from day one) | Multi-vendor safety |
| **Backward compatibility** | Extensions must survive core deprecation cycles | Longevity |
| **Vendor neutrality** | Extensions integrate through the abstraction seams, never direct vendor calls | Portability |

### 15.7 Open-Source Readiness

| Rule | Standard | Rationale |
|------|----------|-----------|
| **License and security policy** | LICENSE, SECURITY.md (reporting path), and contributing guide in place before public | Legal + trust |
| **No secrets ever** | Repo scan guarantees no secrets in history | Reputation |
| **Documentation parity** | Public docs mirror the doc family; internal governance stays internal | Transparency |
| **Issue templates** | Bug, feature, and RFC templates align with gates | Quality intake |
| **Governance public part** | Contribution rules public; decision authority stays with maintainers | Order |

### 15.8 Enterprise Customization

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Config over code** | Customization via configuration, feature flags, and settings — never forks | Maintainability |
| **Feature flags** | `{domain}-{feature}` naming; kill switches `kill-{feature}` per IDENTITY_NAMING_ARCHITECTURE.md | Safe rollout |
| **Token-driven theming** | White-label via design tokens, never hardcoded brand values | Branding flexibility |
| **Tenant readiness** | Tenant FKs and scoped queries from day one | Multi-tenant future |
| **Vendor-neutral seams** | S3-compatible storage seam, portable DB, provider-agnostic secrets (per performance doc) | Lock-in prevention |
| **Customization registry** | Enterprise customizations recorded with owner and upgrade path | No fork drift |

### 15.9 Common Governance Mistakes

| Mistake | Consequence | Prevention |
|---------|-------------|-----------|
| Onboarding agents without reading protocol | Institutional amnesia | §15.2 protocol |
| Modules added without charters | Duplicate, conflicting modules | §15.3 charter |
| Plugin ecosystem ungoverned | Platform security holes | §15.4 manifest + review |
| Contributors bypassing gates | Quality collapse | §15.5 parity rule |
| Open-sourcing secrets | Catastrophic exposure | §15.7 scans |
| Enterprise forks | Irreconcilable divergence | §15.8 config-over-code |

---

## Appendix A: Document Hierarchy & Authority Map

This is the authoritative registry of the Nabome documentation family. Status values follow §1.8. Additions require a T2 decision.

| Document | Scope | Authority Level | Owner | Status |
|----------|-------|-----------------|-------|--------|
| GOVERNANCE_CONSTITUTION.md | Governance process, AI rules, completion | Constitutional | Tech Lead (Governance) | Active (this document) |
| ARCHITECTURE.md | System architecture | System | Tech Lead | Active |
| ENGINEERING_HANDBOOK.md | Engineering standards (consolidates core standards) | Engineering | Tech Lead | Active |
| TECH_STACK.md | Technology decisions | Technology | Tech Lead | Active |
| FOLDER_ARCHITECTURE.md | Folder hierarchy, file organization | Structure | Tech Lead | Active |
| IDENTITY_NAMING_ARCHITECTURE.md | Identity, naming, ID registries | Identity | Tech Lead | Active |
| DATABASE_ARCHITECTURE.md | Database design, migrations | Data | Database Lead | Active |
| API_SERVICE_ARCHITECTURE.md | API/service design | API | Backend Lead | Active |
| API_INTEGRATION_ARCHITECTURE.md | API governance, integrations, webhooks | API | Backend Lead | Active |
| SECURITY_ARCHITECTURE.md | Security, privacy, compliance | Security | Security Lead | Active |
| PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md | Performance, scaling, infrastructure | Performance | Performance Lead | Active |
| QA_TESTING_RELEASE_ARCHITECTURE.md | QA, testing, release | Quality | QA Lead | Active |
| DESIGN_SYSTEM_ARCHITECTURE.md | Design system, UX | Design | Design Lead | Active |
| COMPONENT_LIBRARY_ARCHITECTURE.md | Component library | Design | Design Lead | Active |
| UX_ARCHITECTURE.md | User experience | Design | Design Lead | Active |
| RESPONSIVE_LAYOUT_ARCHITECTURE.md | Responsive behavior | Design | Design Lead | Active |
| IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md | AuthN/AuthZ | Security | Security Lead | Active |
| STORAGE_ENGINE_ARCHITECTURE.md | Storage | Data | Database Lead | Active |
| DATA_LIFECYCLE_ENGINE_ARCHITECTURE.md | Data lifecycle | Data | Database Lead | Active |
| AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md | Audit, compliance | Security | Security Lead | Active |
| Commerce domain docs (CATALOG, PRODUCT_ENGINE, VARIANT_INVENTORY_ENGINE, SEARCH_ENGINE, SHOPPING_CART_WISHLIST_CHECKOUT, ORDER_MANAGEMENT, PAYMENT_ENGINE, FINANCE_ENGINE, SHIPPING_DELIVERY_LOGISTICS, CUSTOMER_ACCOUNT_PROFILE, CUSTOMER_EXPERIENCE, CUSTOMER_FEEDBACK_REVIEWS_RATINGS_QUESTIONS, CUSTOMER_RESOLUTION_ENGINE, CMS_ENGINE, HOMEPAGE_BUILDER, NAVIGATION, NOTIFICATION_COMMUNICATION_MESSAGING, DOCUMENT_ENGINE, EXPORT_REPORTING_BI_ENGINE, AUTOMATION_WORKFLOW_ENGINE, SYSTEM_CONFIGURATION, SHOP_OWNER_DASHBOARD, ADMIN_DASHBOARD — `*_ARCHITECTURE.md`) | Per-domain design | Domain | Domain Lead each | Active |
| README_EARLY.md | Historical rebuild blueprint | Historical | Tech Lead | Historical (superseded by active docs) |
| decisions/README.md | ADR index | Decisions | Architecture Authority | Active |
| decisions/adr/NNNN-*.md | Decision records | Decisions | Architecture Authority | Per-ADR status |
| PROJECT_COMPLETION.md | Completion register | Completion | Completion Authority | Active |
| CHANGELOG | Release history | Release | Release Manager | Active |

## Appendix B: ADR Template

File: `decisions/adr/NNNN-{kebab-slug}.md` — copied verbatim for every new ADR.

```
# ADR-NNNN: {Title}

> **Status:** Proposed | Accepted | Rejected | Superseded | Deprecated
> **Date:** {YYYY-MM-DD}
> **Deciders:** {owners}
> **Related:** ADR-NNNN, {document references}
> **Supersedes:** {ADR(s) this decision replaces, or "None"}
> **Superseded by:** {ADR-NNNN or "None"}
> **Tier:** T0 | T1 | T2

## Context

{The problem, constraints, previous decisions, and options considered. Cite the
documents and ADRs this decision builds on.}

## Decision

{The decision, stated precisely and bindingly. What must agents, modules, and
documents do because of this ADR?}

## Consequences

| Type | Effect |
|------|--------|
| Positive | {what improves} |
| Negative | {what is traded off} |
| Neutral | {what changes without value judgement} |

## Compliance

{How compliance is verified: gates, CI checks, reviews, registries affected.}

## Migration

{Steps consumers must take if this decision changes existing behavior.
"None" when additive only.}
```

**Rules:** one decision per ADR; numbering monotonic; Accepted = binding; supersession chains required; Rejected ADRs retained with rationale.

## Appendix C: Agent Read-Before-Write Protocol

Mandatory for every AI agent before any artifact is produced. Evidence of completion is a statement of documents read in the task summary.

**Step 1 — Governance (10 minutes):**
- [ ] GOVERNANCE_CONSTITUTION.md (this document) — precedence chain, tier table, binding rules
- [ ] `decisions/README.md` — ADR index; read ADRs relevant to the task domain

**Step 2 — Architecture (20 minutes):**
- [ ] ARCHITECTURE.md — system architecture, module boundaries
- [ ] TECH_STACK.md — approved technology, rejected stacks

**Step 3 — Engineering (20 minutes):**
- [ ] ENGINEERING_HANDBOOK.md — coding, naming, state, database, git, DoD standards
- [ ] FOLDER_ARCHITECTURE.md — folder rules, dependency matrix
- [ ] IDENTITY_NAMING_ARCHITECTURE.md — ID and naming registries

**Step 4 — Domain (per task):**
- [ ] The owning `{TOPIC}_ARCHITECTURE.md` document(s) for the task domain
- [ ] Cross-cutting docs as relevant: SECURITY, PERFORMANCE, QA, DESIGN_SYSTEM, API docs
- [ ] The module's existing code, tests, and component registrations

**Step 5 — Verify (before writing):**
- [ ] Confirm the task does not duplicate existing functionality (search-first)
- [ ] Confirm the task does not conflict with any Active document or Accepted ADR
- [ ] Escalate conflicts per §1.5 — never resolve silently
- [ ] State in the task summary: documents read, decisions respected, tier of any new decision

**After writing:**
- [ ] Gates relevant to the deliverable pass (lint, typecheck, tests, build)
- [ ] Documentation updated in the same change (G6)
- [ ] ADR written when the decision tier requires it
- [ ] Completion criteria met or a follow-up recorded

## Appendix D: Decision Escalation Flow

```
Decision needed
   │
   ├─ T3 (code-level, within standards) → decide autonomously
   │
   ├─ T2 (domain-level) → Domain Lead decides
   │      └─ cross-module impact? → ADR
   │
   ├─ T1 (architectural) → Draft ADR → G2 + owner review
   │      └─ Accepted → binding; Rejected → record + alternatives
   │
   └─ T0 (strategic) → Product Owner / Leadership
   │
   └─ Conflict with an Active document or Accepted ADR?
          └─ New ADR superseding it (with citation), never silent deviation
```

## Appendix E: Completion Certificates

**Module Completion Certificate** (recorded in PROJECT_COMPLETION.md):

```
MODULE: {name}          PHASE: {phase}
OWNER: {owner}          DATE: {YYYY-MM-DD}
STATUS: Complete | Complete with tracked debt
DoD (§18.1): [ ] checklist complete        Gates G1–G7: [ ] evidence links
Coverage: {T0 paths 100% where applicable} Architecture (G2): [ ]
Docs updated: [ ] Changelog: [ ] ADRs: [ ] Registries: [ ]
Known debt: {none | items with owner + expiry}
Sign-off: Module owner ___  QA Lead ___  Architecture Authority ___
```

**Phase Completion Certificate:**

```
PHASE: {name}           MODULES: {list, each Module Complete}
Integration suite: [ ] green     Regression: [ ] green on develop
Acceptance criteria: [ ] met     No S0/S1: [ ]          Budgets (G4): [ ]
Docs complete (G6): [ ]          Sign-off: Phase Owner ___ QA ___ Architecture ___
```

## Appendix F: Governance Glossary

| Term | Definition |
|------|------------|
| **Active document** | A document with Status: Active that binds agents; the source of truth for its scope |
| **ADR** | Architecture Decision Record — a numbered, versioned decision record in `decisions/adr/` |
| **Architecture Authority** | The role (exercised via ARCHITECTURE.md, domain docs, and ADR approvals) that owns architectural decisions |
| **Breakdown vs breaking change** | A breaking change alters a consumer-visible contract (fields, types, URLs, auth); it requires an ADR, version bump, and deprecation cycle |
| **Completion Certificate** | The recorded, signed evidence that a module or phase meets completion criteria |
| **Gate** | A named review/check (G1–G8) with pass criteria; gates are recorded with evidence |
| **Module** | A self-contained, independently maintainable unit with ownership and documentation (feature, handler domain, service, library) |
| **Precedence chain** | Constitution > Architecture > Handbook > Domain docs > ADRs > prompt — the order that resolves conflicts |
| **T0–T3** | Decision tiers: Strategic / Architectural / Domain / Implementation (§1.4) |
| **T0 surface (security)** | Critical paths — auth, payments, checkout, orders — with zero-risk security tolerance |
| **Waiver / Exemption** | A recorded, time-boxed, owned exception to a gate or standard |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** November 03, 2026

*This document is the supreme governance authority for নবME (Nabome). Every AI agent, developer, reviewer, and contributor must follow this Constitution and the document family it governs. Architecture always takes precedence over implementation; previous approved decisions are binding; documentation is mandatory; and every module must remain independently maintainable.*


