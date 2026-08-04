# নবME (Nabome) — Quality Assurance, Testing & Release Management Architecture

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for quality assurance, testing, and release management across the entire Nabome platform
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), ENGINEERING_HANDBOOK.md (v1.0), TECH_STACK.md (v1.0), SECURITY_ARCHITECTURE.md (v1.0), PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE.md (v1.0), AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md (v1.0), DATA_LIFECYCLE_ENGINE_ARCHITECTURE.md (v1.0), FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Quality Foundation](#1-quality-foundation)
2. [Testing Architecture](#2-testing-architecture)
3. [Module Testing](#3-module-testing)
4. [Test Data](#4-test-data)
5. [Bug Management](#5-bug-management)
6. [Release Management](#6-release-management)
7. [Quality Gates](#7-quality-gates)
8. [CI/CD Readiness](#8-cicd-readiness)
9. [Monitoring](#9-monitoring)
10. [Permissions](#10-permissions)
11. [Security](#11-security)
12. [Performance](#12-performance)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Quality Foundation

### 1.1 Quality Philosophy

**What:** The core belief system that governs every quality decision on the Nabome platform.

**Why:**
- Quality cannot be inspected into a product — it must be designed and built into every layer.
- Enterprise customers, payment processors, and regulators require demonstrable quality evidence.
- A platform that grows to 1M+ users cannot be maintained without systematic quality.

**Where:** Every file, every function, every API endpoint, every database query, every UI component, every deployment.

**Philosophy statements:**

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Quality is built-in** | Quality is designed in during development, never bolted on after | Prevention is cheaper than detection |
| **Shift-left** | Test as early as possible; find defects at the cheapest point | Reduces rework cost dramatically |
| **Testable by default** | Every feature ships with a defined test strategy | Nothing ships untested |
| **Evidence over opinion** | Releases are approved on measurable evidence, not confidence | Objectivity and auditability |
| **Risk-based prioritization** | Test effort is allocated proportional to business risk | Money and time focused where failures hurt most |
| **Automation over repetition** | Anything repeated more than twice is automated | Scales without growing headcount |
| **Determinism** | Tests are reliable, repeatable, and never flaky | A flaky suite destroys trust |
| **Customer impact is truth** | Quality is measured by real-user experience, not test counts | SLOs beat vanity metrics |
| **Fail fast, fail loudly** | Failures surface at the earliest gate and block progression | Prevents defect leakage downstream |
| **Continuous quality** | Quality gates run on every change, not just before releases | Finds regressions the day they are introduced |

### 1.2 Quality Lifecycle

**What:** The end-to-end sequence of quality activities from idea to production and beyond.

**Why:**
- Defines when each quality activity happens so nothing is skipped.
- Establishes ownership and entry/exit criteria at every stage.
- Makes the process repeatable and auditable for enterprise compliance.

**Where:** Every feature, every PR, every release.

**Lifecycle stages:**

```
Idea → Requirements → Design → Development → Verification → Approval → Release → Monitoring → Learning
  │        │            │           │            │            │          │           │          │
  │        ▼            ▼           ▼            ▼            ▼          ▼           ▼          ▼
Define   Testable     Architecture  TDD +     Unit/Integration/  Quality    Staging     Release     Retrospective +
Test     acceptance   test          typecheck  E2E + reviews     gates      validation  monitoring  regression
strategy criteria     review        + lint     + security         block      + smoke     + rollback  prevention
```

| Stage | Quality Activity | Owner | Exit Evidence |
|-------|------------------|-------|---------------|
| **Idea** | Quality risk triage; define test strategy | QA Engineer + Product Owner | Risk tier + test plan |
| **Requirements** | Acceptance criteria written as Given/When/Then | Product Owner | Reviewed acceptance criteria |
| **Design** | Architecture & testability review | Tech Lead + QA Engineer | Design approval |
| **Development** | TDD, unit tests alongside code, self-review | Developer | Code + unit tests pass |
| **Verification** | Integration, E2E, security, performance, a11y | QA Engineer | Verified test report |
| **Approval** | Formal quality gate review | Release Manager | Signed quality checklist |
| **Release** | Staging validation, smoke, controlled rollout | Release Manager | Green smoke + monitoring |
| **Monitoring** | Post-release watch, error/perf/UX monitoring | Release Manager + DevOps | 48-hour release report |
| **Learning** | Blameless retro, defect analysis, prevention | QA Engineer | Improvement backlog |

### 1.3 Test Strategy

**What:** The master plan that maps test types to risk, timing, and responsibility.

**Why:**
- Prevents both over-testing (waste) and under-testing (risk).
- Aligns test effort with the platform's revenue-critical and compliance-critical paths.
- Provides the baseline every future AI agent follows.

**Where:** All Nabome modules, features, and releases.

**Test strategy principles:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test pyramid** | Many unit tests, fewer integration tests, fewest E2E tests | Fast feedback at the base, coverage at the top |
| **Coverage targets** | Utilities ≥ 90%, handlers ≥ 80%, critical paths = 100% | Consistent with ENGINEERING_HANDBOOK §14 |
| **Fast feedback** | Unit < 100ms each, full E2E suite < 5 minutes | Developer productivity |
| **Every feature testable** | No feature merges without a defined test approach | "Testable by default" |
| **Risk tiers** | T0/T1/T2/T3 tiers determine test depth (see §1.4) | Effort proportional to risk |
| **Quadrant balance** | Cover all four Agile Testing Quadrants (unit/component, functional/acceptance, exploratory/a11y/usability, perf/security/chaos) | Complete risk coverage |
| **CI enforced** | All automated gates run on every PR and merge | No test skipping |
| **Environment parity** | Staging mirrors production configuration and data shape | Test what you ship |

### 1.4 Risk-Based Testing

**What:** Test effort and gate strictness are allocated according to the probability and impact of failure.

**Why:**
- Finite QA capacity must protect revenue-critical and compliance-critical paths first.
- A risk matrix turns test planning from opinion into a documented decision.

**Where:** Every module, feature, and release plan.

**Risk tiers:**

| Tier | Definition | Examples | Required Coverage | Release Behavior |
|------|------------|----------|-------------------|------------------|
| **T0 — Critical** | Revenue, compliance, money movement, identity | Payments, Orders, Checkout, Inventory, Authentication | 100% critical paths; all test types | Any failing test blocks production |
| **T1 — High** | Core commerce, customer-facing, integrations | Products, Shipping, Finance, Notifications, APIs, Workflows | ≥ 90% critical paths; full regression | Failing critical path blocks |
| **T2 — Medium** | Store management, content tooling | CMS, Homepage Builder, Documents, Reports | ≥ 80%; functional + smoke | Coverage regressions flagged |
| **T3 — Low** | Informational, cosmetic, non-user-facing | Static content, presentational UI | Smoke only | Not release-blocking alone |

**Risk calculation:**

```
Risk Score = Impact (1–5) × Probability (1–5)

 4–8   → T3 (smoke)         9–15  → T2 (functional)
16–24  → T1 (full regression)  25+   → T0 (100% coverage, all gates)
```

**Where failures hurt most:**
- Money movement: Payments, Orders, Finance (PCI, reconciliation).
- Identity and trust: Authentication, Customer accounts.
- Data integrity: Inventory, Variant engine, Database migrations.
- External contracts: Payments, Shipping, Email, Cloudinary/R2 integrations.

### 1.5 Shift-Left Testing

**What:** Move testing activities to the earliest possible point in the delivery pipeline.

**Why:**
- A defect found at requirements costs a fraction of one found in production.
- Early feedback shortens the development loop and reduces rework.
- Automated static and unit checks catch the majority of defects before human review.

**Where:** IDE, pre-commit, PR, and CI stages.

| Shift-Left Activity | When | Owner |
|---------------------|------|-------|
| **Static analysis** | On save / pre-commit | Developer |
| **Lint + format** | Pre-commit, CI | Developer |
| **Type checking** | Pre-commit, CI | Developer |
| **Unit tests** | Alongside code (TDD) | Developer |
| **Contract tests** | When API schemas change | Developer + QA |
| **Code review** | PR | Reviewer |
| **Security scan** | PR + CI | Automated |
| **Test coverage check** | PR + CI | Automated |

**Shift-left rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **TDD on logic** | Write failing test before implementation for new logic | Prove the behavior, not the code |
| **Pre-commit hooks** | Lint, format, typecheck run locally before commit | Catch before CI, not in CI |
| **Test alongside** | Tests ship in the same PR as code | Coverage is never retrofitted |
| **No test-only PRs for new features** | Tests are part of the feature PR | Atomic change + verification |
| **Contract-first APIs** | Schema (Zod) changes update contract tests in the same PR | API drift is caught immediately |

### 1.6 Continuous Quality

**What:** Quality gates execute automatically on every code change, not only at release time.

**Why:**
- Regressions are detected on the day they are introduced, when the change is small and understood.
- Continuous evidence makes release approval a summary, not a fresh investigation.
- Defect leakage to later stages drops because gates never sleep.

**Where:** CI/CD pipeline on every push and PR (see §8), plus scheduled full-suite runs.

| Quality Signal | Frequency | Blocking |
|----------------|-----------|----------|
| Lint + typecheck + format | Every push | Yes — CI red |
| Unit tests | Every push | Yes |
| Integration tests | Every PR | Yes |
| E2E critical paths | Every PR + nightly full suite | Yes (PR) |
| Security/dependency scan | Every PR + daily | Yes |
| Performance budgets | Preview deploy + nightly | Yes |
| Accessibility scan | Every PR | Yes |
| Visual regression | Nightly + on design-system changes | Flagged |
| Full regression | Nightly on `develop` | Yes — blocks staging |
| Load validation | Weekly + before major release | Yes — release blocking |

### 1.7 Release Confidence

**What:** The measurable, evidence-based assurance that a build is safe to ship to production.

**Why:**
- Enterprises cannot approve releases on "it looks fine" — they need a documented confidence score.
- A confidence model catches gaps before they reach customers.

**Where:** Every release decision, formalized at the Release Approval gate (§7.8).

**Confidence score model:**

```
Release Confidence = Σ(gate scores) / total gates × 100%

Gate scores:
  Test coverage met ......... 20 points
  All tests green (T0/T1) ... 20 points
  Security scan clean ....... 15 points
  Performance budgets met ... 15 points
  Accessibility scan clean .. 10 points
  Code review complete ...... 10 points
  Staging validation passed . 10 points
  ───────────────────────────────
  Total .................... 100 points

Release Policy:
  ≥ 90  → APPROVED (normal release)
  80–89 → APPROVED with documented waivers (Release Manager)
  < 80  → BLOCKED — no production release
```

| Principle | Standard | Rationale |
|-----------|----------|-----------|
| **No blind approvals** | Every release shows its confidence score | Auditable decisions |
| **T0 must be perfect** | Any T0 critical-path failure = block | Money and trust at stake |
| **Waivers are visible** | Waived gates are logged with owner + date + expiry | Accountability |
| **Evidence retained** | CI reports archived per release | Enterprise audit trail |

---

## 2. Testing Architecture

### 2.1 Test Pyramid

**What:** The distribution of automated tests across layers, with the majority at the fast, cheap unit layer.

**Why:**
- Unit tests run in milliseconds and pinpoint failures; E2E tests run in minutes and are brittle.
- Over-investing in E2E creates slow, flaky, hard-to-maintain suites.

**Where:** All automated testing across the platform.

```
                 ▲  E2E            Few, critical user journeys
                / \   ~5%          slow (minutes), high confidence
               /   \               Auth, Checkout, Payments
              /     \
             /───────\
            /  E2E    \   Smoke: post-deploy health
           /───────────\
          / Integration \  ~20%   cross-module, API contracts
         /───────────────\       DB + services, deterministic
        /─────────────────\
       /   Unit / Component  \  ~75%   utilities, handlers, hooks
      /───────────────────────\       ms-level, pure and isolated
```

**Pyramid rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Proportions** | ≈75% unit, ≈20% integration, ≈5% E2E | Speed + confidence balance |
| **E2E is precious** | E2E only for T0/T1 end-to-end journeys | Expensive to run and maintain |
| **Test at the right layer** | Logic in unit tests, contracts in integration, journeys in E2E | Fastest layer that covers the risk |
| **No E2E-only coverage** | E2E never substitutes unit coverage | Coverage must be at the cheapest layer |
| **Shared fixtures** | Layer-appropriate fixtures for each tier | Determinism without duplication |

### 2.2 Unit Testing

**What:** Testing an individual function, component, hook, or module in isolation with its dependencies mocked.

**Why:**
- Fastest feedback; catches logic errors at the point of introduction.
- Pure business logic (pricing, discounts, inventory math, currency formatting) must be proven directly.

**Where:** All utilities in `lib/utils`, shared validators, feature logic, Zustand stores, API client functions, hooks, and React components.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Coverage** | Utilities ≥ 90%, handlers ≥ 80%, T0 paths 100% | ENGINEERING_HANDBOOK §14.1 |
| **Determinism** | No network, no real clock, no random data | Reliability |
| **Isolation** | Dependencies mocked/stubbed at boundaries | Test one unit only |
| **Naming** | `describe(unit)` → `it(behavior)` | Readable failure reports |
| **Speed** | Individual test < 100ms | Fast iteration |
| **One assertion per behavior** | Focus each test on one expectation | Clear failure diagnosis |

**Best practices:**
- Test behavior (input → output), not implementation details.
- Cover edge cases: empty input, max boundaries, decimals, currency rounding, negative stock, malformed payloads.
- Use a fixed base currency (INR) with deterministic formatting expectations.
- Fuzz obvious boundaries (price 0, 0.01, maximum allowed, null).

**Common mistakes:**
- Testing through the UI what should be a unit test (slow, brittle).
- Mocking the code under test itself (tests that prove nothing).
- Asserting implementation details, so any refactor breaks the test.
- Sharing mutable state between tests (order-dependent results).
- 100% coverage obsession on trivial code while critical logic is untested.

### 2.3 Integration Testing

**What:** Testing that multiple units work together: API handlers with database, services with external providers, feature modules with shared infrastructure.

**Why:**
- Defects live in the seams between modules — contracts, schemas, transaction boundaries.
- Catches ORM/schema drift, validation failures, and mis-wired dependencies that unit tests miss.

**Where:** API handlers with database access, service layers, middleware chains (auth → validation → handler → response), external integration adapters (payments, shipping, email, storage).

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Real database** | Test against the same database engine as production | No "works on SQLite, fails on PostgreSQL" surprises |
| **Transaction rollback** | Wrap each test in a rolled-back transaction or fresh schema | Isolation + speed |
| **Deterministic data** | Explicitly seeded state per test | Reproducibility |
| **External mocks** | Provider integrations mocked at the HTTP boundary | Speed + stability |
| **Coverage** | All T0/T1 API contracts covered | ENGINEERING_HANDBOOK §14.1 |
| **Schema changes** | Every migration has integration coverage | Migration safety |

**Best practices:**
- Test the full request lifecycle: authentication → authorization → validation → handler → persistence → response.
- Include negative paths: unauthorized, forbidden, invalid input, insufficient stock, idempotency retries.
- Verify database constraints (unique, FK, cascade/restrict) through the API, not just in schema.
- Assert on response shape AND persisted state.

**Common mistakes:**
- Using production-like data that depends on network (CI-only passing).
- Testing against a different database engine than production.
- Sharing one global database state across tests (test pollution).
- Forgetting transaction rollback, leaving residue that breaks later runs.
- Mocking the database and thus testing only the mock.

### 2.4 System Testing

**What:** Testing the complete integrated system — frontend + edge API + database + external services — as a whole, against functional requirements.

**Why:**
- Only the full system proves the feature works in its real deployment shape.
- Validates configuration, environment variables, caching, and wiring that no lower layer can.

**Where:** On the staging environment against the assembled system; covers feature end-to-end through the UI/API combination.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Staging parity** | Staging config mirrors production | Validate what will ship |
| **Real dependencies** | Test against real (sandboxed) external providers where possible | True integration truth |
| **Requirement traceability** | Each test maps to an acceptance criterion | Proof of requirement |
| **Feature flags** | Test with target flags enabled/disabled | Confirms configuration |
| **DB migrations** | Run against migration-set that will deploy | Migration + code compatibility |

**Best practices:**
- Execute system tests on the deployed artifact, not the dev server.
- Cover multi-step business journeys (browse → cart → checkout → payment → order → ship).
- Verify the system under realistic cache states (cold and warm).

**Common mistakes:**
- Testing system behavior on a developer machine with different settings.
- Skipping system tests because E2E "covers it" — they verify different things.
- Not testing with the release's actual configuration and feature flags.

### 2.5 End-to-End (E2E) Testing

**What:** Simulating real user journeys through the browser and network, from entry point to outcome, across all layers.

**Why:**
- Proves user-facing value in the exact environment a customer experiences.
- Covers the union of UI logic, API behavior, persistence, and external integrations.

**Where:** T0/T1 user journeys: auth, browse, cart, checkout, payment, order management, admin CRUD. Runs on preview and staging, plus nightly full suite.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Critical journeys only** | Keep the E2E suite small and precious | Maintenance cost |
| **Suite budget** | Full critical suite < 5 minutes | ENGINEERING_HANDBOOK §14.2 |
| **Data isolation** | Each run seeds/cleans its own data | Parallel-safe |
| **Selectors** | Query by role/label/test id, never by CSS position | Stability |
| **Mobile-first** | Default viewport is mobile; desktop journeys separate | 70%+ mobile traffic |
| **Deterministic** | No sleeps; explicit waits on expected states | Anti-flake |
| **Idempotent** | Re-runnable on the same environment | Reliability |

**Best practices:**
- Use seeded, well-known test users and test payment cards.
- Verify the happy path plus the two most damaging failure paths (payment decline, stock exhaustion).
- Include a post-deployment smoke subset that runs in seconds.
- Assert the business outcome (order created), not just UI text.

**Common mistakes:**
- E2E testing everything (slow, flaky, expensive).
- Depending on real third-party responses (network variance → flakes).
- Relying on sleep/waits instead of state-aware waits.
- Reusing production data or accounts.
- Fixing flakes by retrying instead of removing the root cause.

### 2.6 Acceptance Testing

**What:** Verifying the feature satisfies business requirements and acceptance criteria as defined by the Product Owner.

**Why:**
- Bridges the gap between "code works" and "business need is met."
- Provides the formal evidence the Product Owner approves.

**Where:** Each feature's acceptance criteria; written as Given/When/Then; automated where feasible and confirmed manually otherwise.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Acceptance criteria** | Every feature has testable criteria before development | Testable by default |
| **Given/When/Then** | Criteria written in behavior format | Unambiguous requirements |
| **Definition of Done** | Feature not done until acceptance criteria pass | ENGINEERING_HANDBOOK §18 |
| **User-story mapping** | Acceptance tests trace to the story | Auditability |
| **Automated when repeatable** | Acceptance tests automated in the E2E/API layer | Regression reuse |

**Best practices:**
- Product Owner writes criteria; QA translates to tests; Developer implements.
- Include negative criteria ("system must NOT allow X").
- Demo acceptance to the Product Owner on staging before sign-off.

**Common mistakes:**
- Vague criteria ("works correctly") that cannot be tested.
- Skipping acceptance because unit tests pass.
- Product Owner reviewing only screenshots instead of the live system.

### 2.7 Regression Testing

**What:** Re-running existing tests to confirm new changes did not break previously working functionality.

**Why:**
- Commerce platforms evolve continuously; regressions are the most common production defect class.
- Continuous regression protects the 1M+ user promise.

**Where:** Every PR (targeted), nightly full suite, and pre-release full regression.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Every merge** | Automated regression suite runs on each PR | ENGINEERING_HANDBOOK §14.2 |
| **Nightly full suite** | Full unit + integration + E2E on `develop` | Deep coverage without blocking |
| **Targeted regression** | PRs run impacted-module tests + critical paths | Fast + safe |
| **Regression baseline** | Reference state captured per release | Compare against known-good |
| **Defect-driven** | Every fixed bug adds a regression test | Prevent recurrence |

**Best practices:**
- A regression test accompanies every bug fix (see §5.8).
- Use a regression selection matrix mapping modules to affected tests.
- Keep the full suite green nightly so regressions surface within 24 hours.

**Common mistakes:**
- Running only new tests on a PR, ignoring impacted modules.
- Removing failing tests instead of fixing the code.
- No nightly full suite — regressions discovered at release time.

### 2.8 Smoke Testing

**What:** A minimal, fast set of checks that the core system is up and functioning after a deployment.

**Why:**
- Deploys fail; smoke tests catch a broken release in seconds before users do.
- The difference between a 2-minute rollback and a 2-hour outage.

**Where:** Immediately after every deployment to preview, staging, and production.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Post-deploy trigger** | Runs automatically after deploy | Zero human dependency |
| **5-minute budget** | Complete in under 5 minutes | Fast rollback decision |
| **Core coverage** | App loads, API healthy, DB reachable, auth works, checkout path reachable | Highest-risk seams |
| **Blocking** | Smoke failure triggers automatic rollback decision | Protect production |

**Minimum smoke checklist:**
1. Homepage renders for mobile and desktop.
2. Public API health endpoint returns success.
3. Database connectivity verified (health endpoint).
4. Login works with a seeded user.
5. Product listing returns data.
6. Cart + checkout entry path loads.
7. Payment sandbox endpoint responds.

**Common mistakes:**
- Smoke testing only the login page (misses the rest of the system).
- Running smoke on staging but skipping production.
- No rollback trigger tied to smoke failure.

### 2.9 Sanity Testing

**What:** A narrow, quick verification that a specific change works, performed after a fix or small change, without running the full suite.

**Why:**
- Confirms a targeted fix actually resolves the issue before investing in full regression.
- Provides fast go/no-go for builds where full regression isn't yet warranted.

**Where:** After hotfix builds, targeted bug fixes, and emergency releases.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Scope** | Test only the changed area + immediate dependencies | Speed |
| **Precedes regression** | Full regression follows once sanity passes | Logical ordering |
| **Documented** | Sanity result recorded on the build | Evidence trail |
| **Hotfix required** | Mandatory before any hotfix is deployed | Emergency path safety |

**Best practices:**
- Re-run the exact failing scenario from the bug report plus one adjacent scenario.
- Run on the environment matching where the fix will land.

**Common mistakes:**
- Treating sanity as a substitute for regression (unverified side effects).
- Running sanity without the original reproduction steps.

### 2.10 Exploratory Testing

**What:** Unscripted, session-based testing where the QA Engineer explores the system to discover defects that scripted tests miss.

**Why:**
- Scripted tests only find what was imagined; exploratory testing finds the unexpected.
- Real users behave unpredictably; exploratory testing mimics that.

**Where:** New features (T0/T1), major releases, checkout/payment/admin surfaces, and before final release approval.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Session-based** | Time-boxed (60–90 min) with a charter | Focused, documented |
| **Charter** | Document the mission, scope, and notes | Reusable and reviewable |
| **Targeted** | Prioritize T0/T1 and recent-change areas | Effort where risk is |
| **Bug feed** | Findings become tracked bugs with repro steps | Value is captured |
| **Pre-release** | Mandatory for major and minor releases | Final human scrutiny |

**Best practices:**
- Vary data: unusual characters, long values, rapid taps, offline behavior, refresh mid-transaction.
- Test on real devices plus emulators; test weak network conditions.
- Pair exploratory testing with the developer of the feature.

**Common mistakes:**
- Exploratory testing without a charter (undirected wandering).
- Not recording findings, so knowledge is lost.
- Using it as the only test method (inconsistent coverage).

### 2.11 Security Testing

**What:** Verifying the platform's security posture through a defined program of automated scans, manual reviews, and adversarial testing.

**Why:**
- Nabome moves money and holds personal data; security failure is existential.
- Compliance (PCI, data protection) requires demonstrable security testing.

**Where:** Every module, every API endpoint, every release (see §11 for release security).

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **OWASP Top 10** | Coverage of the current OWASP Top 10 | Baseline industry coverage |
| **Automated + manual** | Automated scans continuously; manual reviews at release | Depth + breadth |
| **Threat modeling** | New T0/T1 features threat-modeled in design | Shift-left security |
| **Zero-trust tests** | Every endpoint tested unauthenticated/unauthorized | SECURITY_ARCHITECTURE zero-trust |
| **Secrets testing** | Secret scanning on every commit and release | Never leak credentials |
| **Dependency scanning** | Continuous on lockfile changes | Vulnerability review (§11.3) |
| **Penetration** | Scheduled pen tests + post-major-release | Independent validation |

**Common test scenarios:**
- Authentication bypass, privilege escalation, IDOR across tenants.
- Injection (SQL, XSS, command), CSRF, open redirects.
- Payment manipulation (price tampering, order tampering), coupon abuse.
- Rate-limit bypass, brute-force protection, session fixation.

**Common mistakes:**
- Security testing only at release time (defects found too late).
- Ignoring authorization tests ("logged-in user can do it" ≠ "can do it legitimately").
- Treating a scan report as security assurance without triage.

### 2.12 Performance Testing

**What:** Measuring the platform's speed, capacity, stability, and resource efficiency under expected and extreme load.

**Why:**
- Commerce conversion drops sharply with latency; Core Web Vitals are ranking signals.
- Launch-day traffic spikes must not degrade the storefront.

**Where:** Pre-release for major/minor releases, on CI performance budgets, and weekly capacity validation. Aligned with PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE §1.

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **Budgets in CI** | LCP < 2.5s, INP < 200ms, CLS < 0.1 enforced | PERFORMANCE_SCALABILITY §1.3 |
| **Load types** | Baseline, load, stress, soak, spike | Full behavior picture |
| **Realistic models** | Traffic mix based on RUM data | Meaningful results |
| **Production-like env** | Staging with production topology | Representative numbers |
| **SLO alignment** | 99.9% uptime; p95 targets per endpoint | Consistent with TECH_STACK §18 |
| **Regression detection** | Baselines compared per release (§12.4) | Catch slowdowns early |

**Common mistakes:**
- Load testing staging with a fraction of production capacity (misleading).
- Measuring on a warm cache only (masks cold-start problems).
- No baseline → cannot detect regressions.
- Treating performance as a release-time activity only.

### 2.13 Accessibility Testing

**What:** Verifying the platform is usable by people with disabilities, including automated scanning, manual keyboard testing, and screen-reader verification.

**Why:**
- Accessibility is a legal requirement and a core product value.
- WCAG AA conformance is required by the Definition of Done (ENGINEERING_HANDBOOK §18).

**Where:** All UI surfaces, with depth on the storefront, checkout, and admin (see §13).

**Standards:**

| Standard | Requirement | Rationale |
|----------|-------------|-----------|
| **WCAG 2.2 AA** | Conformance target for the whole platform | Industry + legal baseline |
| **Automated + manual** | Automated scans in CI; manual verification for complex flows | Both are required |
| **Keyboard-only** | Every flow operable without a mouse | Core WCAG requirement |
| **Screen readers** | Major flows verified with a screen reader | Non-visual users |
| **Contrast** | 4.5:1 (normal text), 3:1 (large/UI) verified | DESIGN_SYSTEM tokens |
| **Reduced motion** | `prefers-reduced-motion` honored | Vestibular safety |
| **Mobile accessibility** | Touch targets, viewport, pinch-zoom honored | Mobile-first product |

**Common mistakes:**
- Relying on automated scans alone (they catch ~30–50% of issues).
- Testing accessibility only on desktop.
- Ignoring focus management in modals and navigation.
- Using color alone to convey meaning.

---

## 3. Module Testing

### 3.1 Module Risk Register

**What:** The per-module testing strategy derived from business risk, data sensitivity, and integration surface.

**Why:**
- Every module gets a defined, proportionate testing approach.
- New AI agents and QA engineers know exactly what to test per module.

**Where:** Applies to all Nabome modules. Integration with the module architecture documents referenced.

**Module testing matrix:**

| Module | Risk Tier | Test Focus | Automation Level |
|--------|-----------|------------|------------------|
| **Authentication** | T0 | Identity, sessions, RBAC, rate limits, account recovery | Full (unit + integration + E2E) |
| **Products** | T1 | CRUD, validation, media, search, variants, price logic | Full |
| **Inventory** | T0 | Stock math, reservations, concurrency, oversell prevention | Full |
| **Orders** | T0 | State machine, totals, tax, discounts, cancellation, refunds | Full |
| **Shipping** | T1 | Rate calculation, address validation, provider integration, tracking | Full |
| **Payments** | T0 | Capture, decline, retry, idempotency, webhooks, reconciliation | Full + security |
| **Finance** | T1 | Ledger entries, settlements, reconciliation, exports | Full |
| **CMS** | T2 | Content CRUD, publishing, scheduled changes, media | Functional + smoke |
| **Homepage Builder** | T2 | Drag/drop state, persistence, preview, publish, responsive render | Functional + E2E critical |
| **Notifications** | T1 | Email/template rendering, delivery, failures, suppression, preferences | Full |
| **Documents** | T2 | Invoice/order doc generation, template correctness, download | Functional |
| **Reports** | T2 | Query correctness, aggregation math, exports, large datasets | Functional + perf |
| **APIs** | T0 | Contracts, auth/validation, rate limits, versioning, error codes | Full + contract |
| **Workflows** | T1 | State transitions, automation rules, timers, failure retry, audit | Full |

### 3.2 Authentication

**What:** Verify identity lifecycle, session security, and authorization enforcement end-to-end.

**Why:** Identity is the gate to all commerce; a breach or lockout is catastrophic and compliance-relevant.

**Where:** Registration, login, logout, password reset, email verification, MFA, sessions, RBAC permissions, admin access.

**Must-test scenarios:**
- Register → verify email → login → logout → re-login.
- Wrong password, locked account, brute-force rate limiting.
- Session expiry, rotation on sensitive ops, max sessions (5 per user).
- Authorization: Customer vs Shop Owner vs Admin boundaries; IDOR attempts across tenants.
- Password reset flow incl. token expiry and reuse.

**Best practices:** Test all rate-limit thresholds; test timing-safe comparison behavior indirectly; verify tokens are httpOnly and never in localStorage.
**Common mistakes:** Only testing happy-path login; ignoring session invalidation and RBAC matrix holes.

### 3.3 Products

**What:** Verify product CRUD, validation, media handling, search, variants, and pricing.

**Why:** The catalog is the storefront; bad data damages trust and revenue.

**Where:** Product create/edit/delete, categories, collections, brands, variants, images (Cloudinary), search (pg_trgm), price/discount math.

**Must-test scenarios:**
- CRUD with full validation (slug uniqueness, price bounds, required fields).
- Variant combination create/update; stock aggregation per variant.
- Media upload, format conversion, alt text, deletion cleanup (R2/Cloudinary).
- Search by name, category, partial terms; pagination and sort.
- Discount/coupon math incl. stacking rules.
- Soft-delete behavior and visibility rules (isActive).

**Best practices:** Shared Zod schemas tested once and reused; fixture catalogs covering all product shapes.
**Common mistakes:** Testing prices as floating point; forgetting variant stock aggregation; untested soft-delete visibility.

### 3.4 Inventory

**What:** Verify stock accounting accuracy, concurrency safety, and oversell prevention.

**Why:** Overselling causes chargebacks and customer rage; under-selling loses revenue. Money + trust tier.

**Where:** Stock levels, reservations, decrement on order, increment on cancel/refund, variant inventory, backorder rules.

**Must-test scenarios:**
- Concurrent checkout of last unit → exactly one succeeds.
- Stock decrement exactly once per order (idempotency).
- Cancel/refund restores stock exactly once.
- Insufficient stock → 422 `INSUFFICIENT_STOCK` (ENGINEERING_HANDBOOK Appendix C).
- Reservation expiry and release.
- Zero/negative stock visibility and backorder behavior.

**Best practices:** Use database-level atomic operations; test with simulated concurrency; assert final stock invariants after every flow.
**Common mistakes:** Testing stock in a single-threaded unit test only; double-decrement on retry; untested reservation expiry.

### 3.5 Orders

**What:** Verify the order state machine, totals, tax, discounts, and money-affecting transitions.

**Why:** Orders are the money core; every transition touches revenue and customer trust.

**Where:** Order creation, confirmation, fulfillment, shipment, delivery, cancellation, refund; cart-to-order conversion; totals and taxes.

**Must-test scenarios:**
- Cart → order conversion preserves totals exactly.
- State machine: every legal transition; every illegal transition rejected.
- Discount + tax applied in correct order (pre-tax discount vs post-tax).
- Cancellation windows and stock release.
- Refund flow and partial refunds.
- Idempotent order creation (no duplicate orders on retry).
- Order history, tracking, return/refund requests.

**Best practices:** Model the state machine as a tested table; assert exact money using decimal-safe representation (DECIMAL(10,2)).
**Common mistakes:** Floating-point totals; untested illegal transitions; duplicate-order bugs on retry.

### 3.6 Shipping

**What:** Verify rate calculation, address validation, provider integration, and tracking.

**Why:** Delivery is the physical promise of commerce; provider failures surface directly to customers.

**Where:** Rate calculation, delivery options, address validation, label creation, tracking sync, provider failures.

**Must-test scenarios:**
- Rate computation for standard/express/same-day options.
- Address validation pass/fail paths (India PIN codes, state mapping).
- Provider sandbox integration; label creation success and failure.
- Tracking status sync and customer notifications.
- Graceful degradation when provider is down.

**Best practices:** Contract-test provider adapters; simulate provider outages; cache rate quotes with TTL.
**Common mistakes:** Testing against live provider APIs in CI; ignoring address edge cases (missing PIN, union territories).

### 3.7 Payments

**What:** Verify money capture, decline handling, idempotency, webhooks, and reconciliation.

**Why:** Payments is the most regulated, most sensitive surface. Any defect is immediate revenue + compliance impact.

**Must-test scenarios:**
- Successful payment capture via sandbox.
- Card decline, insufficient funds, auth failure, retry handling.
- Idempotency: same order cannot be charged twice.
- Webhook signature validation; duplicate webhook delivery.
- Payment success/failure async transitions and order state.
- Refund and partial refund via provider.
- Reconciliation: provider records match internal ledger.
- Security: price/order tampering, coupon abuse.

**Best practices:** Use provider sandbox with fixed test cards; verify webhook signatures; treat every webhook as potentially forged and duplicated.
**Common mistakes:** Trusting client-side success; missing webhook signature checks; non-idempotent charge handlers; untested refund edge cases.

### 3.8 Finance

**What:** Verify ledger accuracy, settlements, reconciliation, and reporting outputs.

**Why:** Finance defects are compliance and audit failures; they cannot be silently ignored.

**Where:** Ledger entries, settlements, fees, taxes, reconciliation, payouts, exports.

**Must-test scenarios:**
- Every order/payment/refund produces correct double-entry ledger entries.
- Settlement math: gross − fees − taxes = net.
- Reconciliation between provider and internal records.
- Payout scheduling and status.
- Export correctness (CSV/XLSX) and large-dataset handling.
- Currency precision across all money fields.

**Best practices:** Test with exact decimal expectations; keep money math in one audited place; sample-verify exports.
**Common mistakes:** Rounding drift across entries; untested fee math; exports that truncate or corrupt large datasets.

### 3.9 CMS

**What:** Verify content management, publishing, scheduling, and media handling.

**Why:** Store owners run their business on the CMS; broken publishing breaks the storefront.

**Where:** Pages, sections, media, publishing workflow, scheduled changes, content preview.

**Must-test scenarios:**
- CRUD on pages/sections; draft → published workflow.
- Scheduled publish/unpublish; timezone correctness.
- Content preview accuracy.
- Media insertion and reordering.
- Publishing does not break the storefront render.

**Best practices:** Test publish-state visibility (draft invisible publicly); schedule tests with controlled clocks.
**Common mistakes:** Untested timezone handling; draft content leaking publicly; preview diverging from published output.

### 3.10 Homepage Builder

**What:** Verify builder interactions, persistence, preview, and responsive rendering.

**Why:** It is a flagship feature (HOMEPAGE_BUILDER_ARCHITECTURE); broken layouts destroy brand pages.

**Where:** Section add/reorder/remove, drag-and-drop state, settings, save/publish, preview, mobile render.

**Must-test scenarios:**
- Every section type renders correctly on mobile/tablet/desktop.
- Drag/reorder persistence across reload.
- Save → preview → publish accuracy.
- Concurrent edits (last-write-wins policy documented and tested).
- Published homepage renders from stored config with no CLS.

**Best practices:** E2E the critical builder flows; integration-test the config persistence layer; visual-regression the rendered sections.
**Common mistakes:** Untested drag-state persistence; preview using different data than publish; CLS from unknown media dimensions.

### 3.11 Notifications

**What:** Verify template rendering, delivery channels, failure handling, and preferences.

**Why:** Notifications drive recovery of abandoned carts and order updates; silent failures erode trust.

**Where:** Email (Resend + React Email), template rendering, delivery retries, suppression, unsubscribe, in-app notifications, preferences.

**Must-test scenarios:**
- Template rendering with all variable shapes (long/special characters).
- Delivery success/failure; retry with backoff; permanent failure handling.
- Unsubscribe/suppression respected.
- Order/abandoned-cart triggers fire exactly once.
- Preference toggles honored across channels.
- No secret/leak in notification payloads.

**Best practices:** Contract-test the email adapter; render-test every template with fixtures; assert no PII in logs.
**Common mistakes:** Testing only template happy path; sending duplicate emails on retry; ignoring suppression lists.

### 3.12 Documents

**What:** Verify invoice, order, and receipt document generation correctness.

**Why:** Documents are legal records; wrong figures are customer and compliance problems.

**Where:** Invoice generation, order confirmations, receipts, PDF generation, download/print.

**Must-test scenarios:**
- Document content matches order/payment truth exactly.
- PDF generation for all currency/format variants.
- Download, print, and re-generation after refund/partial state.
- Long/unicode content rendering (Bengali text, INR formatting).
- Document access control (only owner can download).

**Best practices:** Golden-file compare generated documents against approved templates; assert exact totals.
**Common mistakes:** Document totals differing from order totals; broken unicode rendering; insecure document access.

### 3.13 Reports

**What:** Verify reporting query correctness, aggregation math, and export integrity.

**Why:** Store owners make business decisions on these numbers; wrong numbers erode confidence.

**Where:** Sales, inventory, customer, traffic analytics; aggregation, filters, date ranges, exports.

**Must-test scenarios:**
- Aggregation math (sums, averages, counts) against seeded fixtures.
- Date-range and timezone correctness.
- Filter combinations (category, status, channel).
- Export large datasets without truncation.
- Performance on seeded large datasets.

**Best practices:** Validate report output against independently computed expected values; performance-test export of max-size datasets.
**Common mistakes:** Timezone drift in day-boundary reports; rounding differences vs transactional truth; memory blowups on export.

### 3.14 APIs

**What:** Verify API contracts, security, rate limits, and error behavior.

**Why:** The API is the contract all modules and future integrations depend on.

**Must-test scenarios:**
- Contract: request/response schemas (Zod) for every endpoint.
- Error codes match ENGINEERING_HANDBOOK Appendix C.
- Authentication/authorization on every endpoint.
- Rate limiting and 429 behavior.
- Pagination, filtering, sorting correctness.
- Idempotency and optimistic concurrency.
- Versioning and backward compatibility.

**Best practices:** Contract tests generated from shared schemas; run on every schema change; maintain a public API changelog.
**Common mistakes:** Endpoints drifting from documented schemas; untested edge error codes; rate-limit behavior untested.

### 3.15 Workflows

**What:** Verify automation workflows, state transitions, timers, retries, and audit.

**Why:** AUTOMATION_WORKFLOW_ENGINE orchestrates business processes; silent workflow failure = silent business failure.

**Where:** Workflow definitions, triggers, steps, timers, retry/backoff, approvals, audit trails.

**Must-test scenarios:**
- Every workflow state transition legal/illegal.
- Timer-triggered steps fire at correct time (controlled clock).
- Step failure → retry with backoff → terminal failure handling.
- Approval steps and actor permissions.
- Concurrent runs of the same workflow (no double-execution).
- Audit log records every execution.

**Best practices:** Test workflows with injected clocks and fake triggers; assert audit entries exist per run.
**Common mistakes:** Untested retry/backoff; double-execution on retry; timers untested for timezone/leap boundaries.

---

## 4. Test Data

### 4.1 Test Data Standards

**What:** The rules governing creation, shape, and governance of all data used in testing.

**Why:**
- Deterministic tests require deterministic data.
- Production data is never acceptable in non-production environments (SECURITY_ARCHITECTURE §X, DATA_LIFECYCLE §X).

**Standards:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Deterministic** | Same seed → same data → same results | Reproducibility |
| **Versioned** | Fixtures versioned with the code that consumes them | No drift |
| **Documented** | Every fixture has a clear purpose and owner | Maintainability |
| **Never production** | Anonymized, generated, or curated fixtures only | Compliance + security |
| **Realistic shape** | Mirrors production schema, constraints, and cardinality | Representative tests |
| **Small by default** | Small for unit/integration; scaled only where required | Speed |
| **Sensitive-free** | No real PII, real card numbers, or real addresses | Security |

### 4.2 Sample Data

**What:** Curated, human-readable representative datasets used for demos, development, and manual verification.

**Why:** Developers, QA, and Product Owners need believable data to work and demo against.

**Where:** `prisma/seed`, demo storefronts, staging catalogs.

**Standards:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Domain coverage** | Every domain seeded (products, customers, orders, CMS, docs) | Unblock all features |
| **Realistic Indian commerce** | INR prices, Bengali/English content, Indian addresses/PIN codes | Product relevance |
| **Golden fixtures** | Known, documented expected values | Assertion reference |
| **One-command seed** | Reproducible from a single command | ENGINEERING_HANDBOOK §3 |
| **Explicit, not random** | Where correctness matters, hard-code; randomize only irrelevant fields | Determinism |

### 4.3 Data Isolation

**What:** Ensuring tests never share, pollute, or observe another test's or environment's data.

**Why:** Shared mutable data is the #1 cause of flaky and order-dependent tests.

**Where:** Across parallel test runs, environments, tenants, and CI workers.

**Isolation layers:**

| Layer | Standard | Rationale |
|-------|----------|-----------|
| **Per-run** | Each run seeds its own data; cleans up on exit | Parallel-safe |
| **Per-test** | Transaction rollback or fresh schema per integration test | No cross-test leakage |
| **Per-environment** | Separate databases for dev/preview/staging/prod | No contamination |
| **Per-tenant** | Shop Owner data isolated by tenant id in tests | Tenant-boundary proof |
| **Per-worker** | CI parallel workers use isolated databases or unique tenant ids | Concurrency-safe |

**Best practices:**
- Use unique identifiers per run (run id suffix) for records visible to E2E.
- Never let a test depend on data created by another test.

### 4.4 Mock Data

**What:** Controlled substitutes for external services and unstable dependencies.

**Why:** External providers (payments, shipping, email, media) are slow, rate-limited, paid, and non-deterministic.

**Where:** Unit/integration boundaries with external providers; webhook simulations; failed-state simulation.

**Standards:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mock at boundaries** | Only mock what you don't own | Test real internal logic |
| **Behavioral stubs** | Mocks return realistic success/failure/error responses | Covers real paths |
| **Contract alignment** | Mock responses match the provider's real contract | No false confidence |
| **Webhook fixtures** | Realistic signed webhook payloads incl. duplicates and forgeries | Security + idempotency |
| **Failure injection** | Every external call has a simulated failure path | Graceful degradation proof |

**Common mistakes:**
- Mocking the code under test (empty tests).
- Mocks diverging from the real provider contract.
- No failure simulation, so error paths are never executed.

### 4.5 Production-like Data

**What:** Data that approximates production volume, shape, and distribution for realistic verification.

**Why:** Performance, scale, and realistic behavior can only be validated with realistic data.

**Where:** Staging, load testing, nightly performance runs, capacity validation.

**Standards:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Synthesized, never copied** | Generated data approximating production distribution | Compliance safe |
| **Anonymization** | If any real data is used, fully anonymize (PII, cards, addresses) | SECURITY_ARCHITECTURE §X |
| **Cardinality** | Volume scaled to production order of magnitude | Meaningful perf |
| **Distribution** | Realistic product/order/user mix, seasonality included | Representative load |
| **Data generation scripts** | Deterministic generators versioned in repo | Reproducibility |

### 4.6 Data Cleanup

**What:** The guaranteed removal of test artifacts so environments stay clean, fast, and compliant.

**Why:** Leftover test data bloats databases, breaks fixtures, pollutes analytics, and risks leaking into production-adjacent systems.

**Where:** After each test run, nightly on non-prod environments, and before/after releases.

**Standards:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always clean up** | Tests clean data they created, even on failure | No residue |
| **Transactional** | Rollback-based integration tests leave nothing behind | Speed + safety |
| **Scheduled sweeps** | Nightly job removes stale test artifacts (age > 7 days) | Hygiene |
| **Environment reset** | Non-prod databases rebuildable from seed on demand | Always known state |
| **No prod cleanup** | Cleanup never runs against production | Safety |
| **Anonymize before delete** | Nothing test-related remains that resembles real data | Compliance |

**Common mistakes:**
- Cleanup only in the success path (failures leak data).
- Tests depending on leftover data from previous runs.
- Test data reaching production databases.

---

## 5. Bug Management

### 5.1 Bug Lifecycle

**What:** The defined state machine every defect passes through from discovery to closure.

**Why:** Unambiguous states give every team member a shared understanding of where each bug is and who owns it.

**Where:** The issue tracker (GitHub Issues/Projects), all modules.

```
                ┌──────────────────────────────────────────────────┐
                │                                                     │
  Discovered → New → Triaged → Assigned → In Progress → Fixed ───────┼──┐
                │                  │            │            │        │  │
                │                  │            │            ▼        │  │
                │                  │            │       In Verification│  │
                │                  │            │            │        │  │
                │                  │            │     Pass?  │        │  │
                │                  │            │   ┌────────┼────────┼──┼────────┐
                │                  │            │   ▼        ▼        ▼  │        │
                │                  │            │ Closed  Deferred  Reopened ──────┘
                │                  │            │                   (→ In Progress)
                │                  │            │
                │                  ▼            ▼
                │           Needs Info   Won't Fix / Duplicate
                ▼
             Rejected
```

| State | Owner | Meaning |
|-------|-------|---------|
| **New** | Reporter | Defect filed with reproduction evidence |
| **Triaged** | QA Engineer | Classified: severity, priority, module, risk tier |
| **Assigned** | Release Manager | Handed to a Developer owner |
| **In Progress** | Developer | Being fixed |
| **Fixed** | Developer | Fix + regression test submitted |
| **In Verification** | QA Engineer | Re-test on appropriate environment |
| **Reopened** | QA Engineer | Verification failed; back to In Progress |
| **Closed** | QA Engineer | Verified fixed; regression test green |
| **Deferred** | Release Manager | Accepted risk; scheduled for a later release |
| **Won't Fix** | Product Owner | By-design or not a defect |
| **Duplicate** | QA Engineer | Merged into an existing issue |
| **Needs Info** | Reporter | More reproduction detail required |
| **Rejected** | QA Engineer | Not a defect (environment/user error) |

### 5.2 Bug Reporting

**What:** The mandatory content and quality bar for every filed defect.

**Why:** A bug without reproduction steps is an investigation, not an actionable report. Poor reports waste the most expensive resource: time.

**Where:** Every defect filed against any module or release.

**Mandatory report template:**

| Field | Requirement |
|-------|-------------|
| **Title** | Concise, module-prefixed (`payments: duplicate charge on webhook retry`) |
| **Environment** | Prod / staging / preview + device + browser + version |
| **Preconditions** | Account, data, flags, state required |
| **Steps** | Numbered reproduction steps from a known-good state |
| **Expected** | What should happen |
| **Actual** | What actually happened |
| **Evidence** | Screenshot/video, console errors, network trace, request/response |
| **Frequency** | Always / intermittent (rate) |
| **Impact** | User-facing consequence + affected users |
| **Severity & Priority** | §5.4 / §5.5 |
| **Proposed tier** | T0–T3 suggestion |

**Best practices:**
- File one defect per issue (no compound reports).
- Verify against the current staging before filing (may already be fixed).
- Include the exact test data used.

### 5.3 Bug Classification

**What:** Categorizing defects by type, module, root cause, and phase of introduction.

**Why:** Classification powers trend analysis, prevention investment, and release-risk scoring.

**Categories:**

| Category | Examples | Prevention Target |
|----------|----------|-------------------|
| **Functional** | Wrong behavior, missing feature path | Acceptance criteria quality |
| **Data/Integrity** | Wrong totals, lost stock, duplicate records | Constraint + contract tests |
| **Integration** | Provider failures, schema drift | Contract tests |
| **Security** | Auth bypass, IDOR, injection | Security reviews + scans |
| **Performance** | Slow endpoints, memory, TTI regression | Perf budgets + load tests |
| **Accessibility** | Keyboard trap, contrast, SR misreads | A11y scans + manual |
| **Usability** | Confusing flow, poor mobile UX | Exploratory testing |
| **Visual** | Layout, responsive, styling defects | Visual regression |
| **Config/Release** | Wrong env vars, flags, deployment issue | Release checklist |
| **Compatibility** | Browser/device-specific breakage | Cross-browser matrix |

### 5.4 Severity

**What:** The business impact of a defect if it reaches users — how bad the damage is.

**Why:** Severity is the primary input to whether a release can proceed.

| Level | Name | Definition | Examples | Release Rule |
|-------|------|-----------|----------|--------------|
| **S0** | Critical | System down, money loss, data loss, security breach | Checkout broken, payment double-charge, auth bypass | Blocks release & triggers hotfix/rollback |
| **S1** | High | Major feature unusable for most users | Cannot add to cart, orders stuck, login fails | Blocks release |
| **S2** | Medium | Feature partially broken; workaround exists | Wrong sort order, notification delay, admin report off-by-one | Non-blocking with waiver |
| **S3** | Low | Minor cosmetic/edge defect | Typo, spacing, rare edge case | Tracked, not blocking |
| **S4** | Trivial | Cosmetic polish, non-functional | Icon alignment, copy suggestions | Backlog |

### 5.5 Priority

**What:** How urgently the defect must be fixed — the scheduling urgency given available resources.

**Why:** Priority sequences work; severity says how bad, priority says how fast.

| Priority | Name | Definition |
|----------|------|-----------|
| **P0** | Immediate | Fix now; work stops on other tasks; hotfix path |
| **P1** | High | Fix in current sprint/release |
| **P2** | Medium | Fix in an upcoming sprint |
| **P3** | Low | Fix when convenient / backlog |

**Severity × Priority matrix:**

| | P0 | P1 | P2 | P3 |
|---|----|----|----|-----|
| **S0** | Release blocked; hotfix | Release blocked | Release blocked (waiver) | — |
| **S1** | Immediate fix | Release blocked | Planned | — |
| **S2** | — | Fast-track | Sprint | Backlog |
| **S3** | — | — | Sprint | Backlog |
| **S4** | — | — | — | Backlog |

### 5.6 Assignment

**What:** Rules for routing defects to owners.

**Why:** Clear ownership prevents lost bugs and duplicate effort.

| Rule | Standard |
|------|----------|
| **Triage SLA** | Every defect triaged within 1 business day |
| **Module owner** | Assign by module owner (feature team) |
| **P0/S0 routing** | Auto-notify on-call + Release Manager immediately |
| **Single owner** | One responsible Developer per issue |
| **Needs Info SLA** | 3 business days to respond or auto-closes with guidance |
| **Escalation** | Unassigned after 2 days → Release Manager reassigns |

### 5.7 Verification & Closure

**What:** The acceptance bar for confirming a fix is correct and complete.

**Why:** An unverified fix is a rumor; verification closes the loop with evidence.

| Rule | Standard |
|------|----------|
| **QA verifies** | Only QA Engineer verifies and closes (never the fixer) |
| **Environment** | Verify on staging; production-only fixes verified on production |
| **Reproduce first** | Re-run the original steps exactly |
| **Adjacent check** | Verify one adjacent scenario for side effects |
| **Regression test** | Automated regression test must be in the PR (§5.8) |
| **Close criteria** | Fixed + verified + regression test green + release included |
| **Deferred clarity** | Deferred bugs carry a documented reason + target release |

### 5.8 Regression Prevention

**What:** The mechanism that guarantees every fixed bug stays fixed forever.

**Why:** "Fixed once, broken again" is the most common quality failure; prevention is systematic, not hopeful.

| Rule | Standard |
|------|----------|
| **Fix ships with test** | No bug fix without a regression test — a gate, not a suggestion |
| **Test at the right layer** | Regression test at the cheapest layer that reproduces the bug |
| **Root-cause analysis** | S0/S1 fixes include RCA in the issue |
| **Test-creation rule** | The regression test must fail on the pre-fix code |
| **Cluster prevention** | Recurring bugs in one area trigger module test expansion |
| **Coverage mapping** | Bug modules tracked against test coverage monthly |

**Common mistakes:**
- Closing bugs without regression tests (guaranteed recurrence).
- Regression tests that would pass on the old code (prove nothing).
- Fixing symptoms instead of root cause.

---

## 6. Release Management

### 6.1 Release Workflow

**What:** The defined, gated path a build follows from feature completion to production.

**Why:** Predictability and reproducibility require a documented, enforced progression — no shortcuts, no blind approvals.

**Where:** All releases: patch, minor, major, and hotfix.

```
Feature Complete → QA Ready → Testing → Approval → Staging → Production
      │               │           │         │          │         │
    Acceptance    Entry         Full     Quality   Staging    Controlled
    criteria      criteria      test     gate      validation rollout +
    met           met           execution review    + smoke    monitoring
```

| Stage | Entry Criteria | Activities | Exit Evidence |
|-------|---------------|-----------|---------------|
| **1. Feature Complete** | All stories merged; Definition of Done met | Code complete; unit/integration green; docs updated | Green CI; merged PRs |
| **2. QA Ready** | Build deployed to staging; release notes draft | QA entry checklist signed; exploratory testing | QA-ready sign-off |
| **3. Testing** | QA ready | Full regression, security, performance, a11y (§7) | Test report |
| **4. Approval** | Tests complete; confidence score computed | Release gate review; waivers documented | Approval decision |
| **5. Staging** | Approved | Staging deployment + validation + smoke | Staging smoke green |
| **6. Production** | Staging green | Controlled rollout, canary, production smoke | Production release verified |

### 6.2 Feature Complete

**What:** The point where development is functionally complete and merged.

**Why:** A stable feature-complete baseline prevents release churn.

**Standards:**

| Rule | Standard |
|------|----------|
| **DoD met** | ENGINEERING_HANDBOOK §18 checklist fully satisfied |
| **No TODOs/placeholders** | Production-ready code only |
| **Merged to develop** | Feature on `develop` and CI green |
| **Docs updated** | API/error-code/architecture docs current |
| **Flagged** | Feature flags set as required by plan |

### 6.3 QA Ready

**What:** Formal entry into the QA phase with defined entry criteria.

**Why:** QA's time is protected — unverifiable or incomplete builds are rejected at the door.

**Entry criteria checklist:**
1. Feature-complete build deployed to staging.
2. All automated tests green on the target build.
3. Release notes draft with known changes.
4. Test data/fixtures available.
5. No known blocking defects in the build.
6. Environment parity confirmed.

**Failure behavior:** Build rejected back to Feature Complete with reasons; no partial QA.

### 6.4 Testing

**What:** The full verification phase per the risk register (§3) and test architecture (§2).

**Standards:**

| Rule | Standard |
|------|----------|
| **Full regression** | Unit + integration + E2E complete |
| **Risk-tier depth** | T0/T1 full; T2 functional; T3 smoke |
| **Security checks** | Scans + manual review per §11 |
| **Performance checks** | Budgets + load validation per §12 |
| **Accessibility checks** | Scans + manual per §13 |
| **Exploratory** | Session-based on T0/T1 and changed areas |
| **Bugs triaged** | All discovered defects triaged before approval |

### 6.5 Approval

**What:** The formal decision point where the Release Manager (and Product Owner for scope) approve the release based on evidence.

**Why:** Enterprise releases require an accountable approver and an audit trail.

**Approval requirements:**
- Confidence score ≥ 90 (or documented waivers, §1.7).
- No open S0/S1 defects.
- Security scan clean; dependencies reviewed.
- Performance budgets met.
- Staging validation complete.
- Rollback plan verified.
- Release notes approved.

### 6.6 Staging

**What:** The final pre-production validation environment that mirrors production.

**Why:** Staging is the last place to catch environment-specific failures before real customers.

**Standards:**

| Rule | Standard |
|------|----------|
| **Parity** | Config, schema, feature flags match production |
| **Fresh migrations** | Migrations run in staging exactly as they will in production |
| **Staging smoke** | Full smoke suite (§2.8) passes on the deployed artifact |
| **Data validation** | Production-like synthetic data for realistic checks |
| **Sign-off** | QA Engineer signs staging validation |

### 6.7 Production

**What:** The controlled rollout of the approved build to real users.

**Why:** Controlled rollout limits blast radius and enables fast, safe rollback.

**Standards:**

| Rule | Standard |
|------|----------|
| **Rollout plan** | Scheduled, with a named owner and comms |
| **Canary-first** | Release to a small % of traffic, verify, then full rollout (where platform supports) |
| **Migrations first** | Backward-compatible DB migrations applied before/with deploy |
| **Production smoke** | Smoke suite runs immediately post-deploy |
| **Freeze rules** | No production deployments during peak sales windows unless approved |
| **Rollback ready** | Previous artifact retained and one-click rollback verified |
| **Post-release window** | 48-hour heightened monitoring (§9.1) |

### 6.8 Hotfix

**What:** The expedited emergency path for S0/S1 production defects that cannot wait for the normal release cycle.

**Why:** Money and trust are burning; process must compress without dropping safety.

**Hotfix process:**

```
1. Detect (monitoring alert / support) → confirm S0/S1
2. Create hotfix branch from main (fix/<critical-description>)
3. Fix + regression test
4. Targeted CI: lint, typecheck, unit, impacted integration, smoke
5. Peer review (required, at least 1 reviewer)
6. Deploy to staging → sanity test (§2.9) on the exact failing scenario
7. Deploy to production (post-smoke trigger)
8. Production smoke + 24h heightened monitoring
9. Cherry-pick fix into develop (ENGINEERING_HANDBOOK §16.6)
10. Post-mortem within 48h → regression prevention
```

**Rules:**
- No code freezes during hotfix window except for the fix.
- Only the minimal fix ships; scope creep is rejected.
- Full regression follows after the emergency is contained.

### 6.9 Rollback

**What:** The defined, rehearsed procedure to restore service when a release degrades production.

**Why:** Fast rollback is the difference between a blip and an outage.

**Standards:**

| Rule | Standard |
|------|----------|
| **One-click** | Rollback to previous known-good version available | 
| **Artifact retention** | Previous release artifacts retained (minimum last 10) |
| **Migration-aware** | Schema rollback procedure documented per release |
| **Trigger rules** | Error rate / p95 breach / smoke failure / critical alert |
| **Rehearsed** | Rollback drill quarterly |
| **Communications** | Rollback initiated = automatic incident + status update |

**Rollback decision triggers:**
- Production smoke failure.
- Error rate SLO burn (2x budget for the hour).
- p95 latency breach sustained.
- Any S0 customer-impacting defect confirmed in the release.

### 6.10 Release Notes

**What:** The authoritative, user-appropriate record of what changed in a release.

**Why:** Customers, support, and operators all need to know what to expect and what changed.

**Release notes structure:**

| Section | Audience | Content |
|---------|----------|---------|
| **Version + date** | All | Semantic version, build number, deployed date |
| **Highlights** | Users | New features in user language |
| **Fixes** | Users/Support | Customer-visible bug fixes |
| **Performance** | Users/Operators | Speed/reliability improvements |
| **Breaking changes** | Developers/Integrations | API/schema/behavior changes with migration guidance |
| **Security** | All | Security fixes (after disclosure policy) |
| **Known issues** | Support/Users | Known limitations with workarounds |
| **Rollback info** | Operators | Previous version + rollback procedure |
| **Internal changelog** | Team | Generated from conventional commits |

**Rules:**
- Conventional commits drive the changelog (ENGINEERING_HANDBOOK §15.4).
- Breaking changes require 6-month deprecation notice where applicable.
- Draft release notes at QA Ready; finalize at Approval.

---

## 7. Quality Gates

### 7.1 Quality Gate Model

**What:** The fixed set of checkpoints that every change and every release must pass.

**Why:** Consistent gates make quality predictable, auditable, and non-negotiable.

**Where:** Two enforcement levels — PR gates (per change) and release gates (per release).

| Gate | When | Owner | Pass Criteria | Blocks |
|------|------|-------|---------------|--------|
| **G1 Code Review** | Every PR | Reviewer (Developer) | Reviewed, resolved comments | Merge |
| **G2 Architecture Review** | New modules/architectural change | Tech Lead | Conforms to module boundaries | Merge |
| **G3 Security Review** | Every PR + release | Security reviewer | Scans clean + manual review | Merge/Release |
| **G4 Performance Review** | Preview + release | Perf reviewer | Budgets met (§12) | Release |
| **G5 Accessibility Review** | Every PR + release | A11y reviewer | WCAG AA scan + manual | Release |
| **G6 Documentation Review** | Every PR | Reviewer | Docs/error codes updated | Release |
| **G7 Test Coverage** | Every PR + release | Automated | Coverage targets met | Merge/Release |
| **G8 Release Approval** | Release | Release Manager | Confidence score + sign-off | Production |

### 7.2 Code Review

**What:** Human review of every change for correctness, style, security, and maintainability.

**Why:** The highest-value defect filter; catches what automation cannot.

**Standards:**
- Small PRs (< 500 lines, one responsibility) — ENGINEERING_HANDBOOK §16.4.
- At least 1 approving reviewer; T0 modules require a second reviewer.
- Reviewer checks: logic correctness, edge cases, security, test quality, conventions.
- All review comments resolved before merge.
- No draft PRs submitted for review.

**Common mistakes:**
- Rubber-stamping reviews (no real scrutiny).
- Reviewing huge PRs where detail is impossible.
- Treating comments as optional.

### 7.3 Architecture Review

**What:** Verifying architectural compliance before significant work is merged.

**Why:** Architecture drift is expensive; module-boundary violations accumulate debt.

**Standards:**
- Required for: new modules, module boundary changes, new dependencies, API contract changes, DB schema changes.
- Verified against ARCHITECTURE.md dependency rules (§3).
- Testability review: is the change testable at the right layer?
- Decision documented in the PR description.

### 7.4 Security Review

**What:** Formal security verification of changes and releases.

**Why:** Security defects found after release are incidents; found before, they are fixes.

**Standards:**
- Automated: secret scan, dependency scan, static analysis on every PR.
- Manual: code-level review for auth/authz, injection, IDOR, payment logic on T0/T1 changes.
- Threat modeling for new T0/T1 features.
- No known high/critical vulnerabilities open at release.

### 7.5 Performance Review

**What:** Confirmation that the change/release meets performance budgets.

**Why:** Performance is a release requirement, not a hope (PERFORMANCE_SCALABILITY §1).

**Standards:**
- CI bundle size budgets on every preview build.
- Core Web Vitals budgets (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- API latency budgets per endpoint tier.
- Load validation before major/minor releases.
- No performance regression vs baseline (§12.4).

### 7.6 Accessibility Review

**What:** Confirmation of WCAG 2.2 AA compliance.

**Why:** Legal requirement, product value, Definition of Done.

**Standards:**
- Automated a11y scan in CI on every PR.
- Manual keyboard + screen-reader verification for changed flows.
- Contrast checked against DESIGN_SYSTEM tokens.
- Reduced-motion honored.
- Touch targets on mobile.

### 7.7 Documentation Review

**What:** Confirmation that knowledge ships with code.

**Why:** Undocumented APIs and error codes become support incidents and integration bugs.

**Standards:**
- API endpoints documented; error codes documented (ENGINEERING_HANDBOOK §15).
- Changelog/release notes updated.
- Environment variables documented.
- Architecture docs updated when behavior changes.
- READMEs/onboarding current.

### 7.8 Test Coverage

**What:** Automated enforcement of coverage targets.

**Why:** Coverage is the quantitative proof that change is verified.

**Standards:**
- Utilities ≥ 90%, handlers ≥ 80%, T0 critical paths 100%.
- Coverage measured per PR; new code must meet targets (not just total).
- Branches, not just lines, counted for T0 logic (money math, stock, auth).
- Coverage regressions block merge; improvements encouraged.

### 7.9 Release Approval

**What:** The final consolidated gate (see §6.5, §1.7).

**Standards:**
- Confidence score documented.
- All release gates G1–G7 evidence attached.
- No open S0/S1.
- Waivers (if any) listed with owners and expiry.
- Release Manager + Product Owner (scope) approval recorded.

---

## 8. CI/CD Readiness

### 8.1 Pipeline Architecture

**What:** The defined CI/CD pipeline stages that every change and release traverses (GitHub Actions per ENGINEERING_HANDBOOK §18, TECH_STACK §14).

**Why:** Automation makes quality gates consistent, fast, and auditable — no human-forgotten steps.

**Where:** The repository CI configuration, all environments.

```
Push/PR
  │
  ▼
[Build Validation] ──► lint, format, typecheck, build, bundle budgets
  │
  ▼
[Automated Testing] ─► unit → integration → E2E critical → coverage check
  │
  ▼
[Quality Gates] ──────► G3 security scan, G4 perf budgets, G5 a11y scan, G7 coverage
  │
  ▼
[Deploy Preview] ─────► PR → preview environment (merge-blocking if gates fail)
  │
  ▼
[Deploy Staging] ─────► develop → staging + staging validation + smoke
  │
  ▼
[Release Approval] ───► manual gate (confidence score, approvals)
  │
  ▼
[Deploy Production] ──► main → production, canary, production smoke
  │
  ▼
[Rollback Readiness] ──► artifact retention, one-click rollback, monitors
```

### 8.2 Build Validation

**What:** Verify the change compiles, conforms to style, and builds within budget — before any testing.

**Why:** Fastest, cheapest failures; blocks invalid changes at the door.

**Standards:**

| Stage | Pass Criteria |
|-------|---------------|
| Lint | 0 errors, 0 warnings (ESLint) |
| Format | Prettier clean |
| Type check | 0 type errors (TypeScript strict) |
| Build | Production build succeeds |
| Bundle budget | Within defined size budgets |
| Secrets | No secrets in diff (scan) |
| Dependencies | Lockfile audit clean |

### 8.3 Automated Testing

**What:** The test tiers executed automatically per change.

**Why:** Continuous verification catches regressions the day they appear.

**Pipeline test mapping:**

| Tier | Scope | Runs On | Blocks |
|------|-------|---------|--------|
| Unit | All changed modules + full suite | Every push/PR | Merge |
| Integration | Impacted contracts + critical paths | Every PR | Merge |
| E2E critical | T0/T1 journeys | Every PR + nightly full | Merge (PR) |
| Full suite | Everything | Nightly on `develop` | Staging promotion |
| Visual regression | Changed UI + design system | Nightly + DS changes | Flagged |
| Load/soak | Representative scenarios | Weekly + pre-release | Release |
| Security | Scans | Every PR + daily | Merge/Release |

### 8.4 Deployment Validation

**What:** Confirming the deployed artifact is healthy in its target environment immediately after deploy.

**Why:** A build that passes CI can still fail in its environment; deployment must be verified, not assumed.

**Standards:**
- Post-deploy smoke suite runs automatically (§2.8).
- Health checks: app, API, database, cache, external providers.
- Config/flag verification (deployed configuration is the expected one).
- Migrations verified applied and backward compatible.
- Rollback triggered automatically on smoke failure (staging) or per runbook (production).

### 8.5 Rollback Readiness

**What:** The persistent state that makes any release reversible in minutes.

**Why:** Every release must be a bet you can undo.

**Standards:**
- Previous N (≥ 10) artifacts retained.
- One-click rollback path exists for all environments.
- DB migration rollback documented per migration.
- Canary/feature-flag kill switch where applicable.
- Rollback drill quarterly (§6.9).
- Rollback runbook current and reviewed.

### 8.6 Environment Promotion

**What:** The disciplined movement of builds through environments.

**Why:** Identical promotion prevents "works on staging" production surprises.

**Promotion rules:**
- Same artifact/commit promoted — never rebuild for promotion.
- Staging mirrors production config/schema/flags.
- No direct prod promotion without staging validation.
- Environment matrix (ENGINEERING_HANDBOOK §33.4):

| Environment | Branch | Deploys | Gates |
|-------------|--------|---------|-------|
| Development | `feature/*` | Local | None |
| Preview | PR | Every PR | G1–G7 |
| Staging | `develop` | Merge | G1–G7 + staging validation + smoke |
| Production | `main` | Approval | G1–G8 + canary + prod smoke |

---

## 9. Monitoring

### 9.1 Release Monitoring

**What:** Heightened observation of the system immediately after a release to catch regressions fast.

**Why:** Post-release is the highest-risk window; early detection = fast rollback = small blast radius.

**Standards:**
- **48-hour window:** intensified monitoring after every production release.
- **Compare to baseline:** release metrics vs previous version (errors, latency, conversions).
- **Watch list:** changed modules, dependencies, providers, and their SLOs.
- **Burn alerts:** error budget burn triggers rollback evaluation.
- **Release dashboard:** version, metrics delta, alert status visible to the team.

### 9.2 Error Monitoring

**What:** Capturing, grouping, and triaging application errors.

**Why:** Errors users hit silently are quality debt that becomes churn.

**Standards:**
- Every unhandled exception captured with stack trace, user context, and trace id.
- Errors grouped by signature; duplicates merged.
- Triage SLA: new critical errors triaged within 1 business day.
- Alert on new error signatures after release (regression signal).
- No secrets/PII in captured error context.

### 9.3 Crash Monitoring

**What:** Tracking client-side crashes and session interruptions.

**Why:** Mobile-first products die by the crash; crash rate is a retention metric.

**Standards:**
- Client-side errors and render crashes captured with device/OS/version.
- Crash-free session rate tracked and trended per release.
- Release-level crash delta reported in the 48-hour report.
- Screen/view associated with crash for fast reproduction.

### 9.4 Performance Monitoring

**What:** Continuous measurement of production performance, real and synthetic.

**Why:** Performance regressions are only real when measured on real traffic.

**Standards:**
- RUM: Core Web Vitals (LCP, INP, CLS) + FCP, TTFB from real sessions.
- Synthetic probes: critical journeys probed from key regions on a schedule.
- SLO-based alerting: p95 breach, error rate burn (§PERFORMANCE_SCALABILITY §8.5).
- Per-endpoint latency and error dashboards.
- Capacity signals for every new integration/endpoint (§PERFORMANCE §10.8).

### 9.5 User Experience Monitoring

**What:** Watching the user-facing quality signals that raw metrics miss.

**Why:** "It works" and "users are happy" are different claims.

**Standards:**
- Conversion/checkout funnel tracking per release.
- Session/UX error rates (dead ends, rage clicks where measurable).
- Search abandonment and zero-result rates.
- Feedback/ratings signals (CUSTOMER_FEEDBACK module).
- Release-level UX delta reported alongside error/perf deltas.

---

## 10. Permissions

### 10.1 Team Responsibility Matrix

**What:** The clear division of quality and release responsibilities across roles.

**Why:** Ambiguity causes both dropped tasks and duplicated tasks; ownership must be explicit.

**Where:** All quality and release activities.

| Responsibility | Developer | QA Engineer | Product Owner | Admin | Release Manager |
|----------------|-----------|-------------|---------------|-------|-----------------|
| Write unit/integration tests | **Owner** | Supports | — | — | Reviews |
| Write/maintain E2E + system tests | Supports | **Owner** | Reviews | — | Reviews |
| Acceptance criteria (testable) | — | Reviews | **Owner** | — | — |
| Bug triage (severity/priority) | — | **Owner** | Reviews | — | Approves |
| Bug fix + regression test | **Owner** | Verifies | — | — | Escalates |
| Test data/fixtures | Contributes | **Owner** | Reviews | — | — |
| Security testing/scans | Contributes | Reviews | — | **Owner** | Reviews |
| Performance testing | Contributes | Reviews | — | **Owner** | Reviews |
| Accessibility testing | Contributes | **Owner** | Reviews | Reviews | Reviews |
| Staging validation + smoke | Contributes | **Owner** | Reviews | — | Reviews |
| Release notes | Contributes | Reviews | Reviews | — | **Owner** |
| Release approval | — | Verifies | Approves (scope) | Reviews | **Owner** |
| Production rollout | Contributes | Verifies | — | **Owner** | Reviews |
| Rollback execution | — | Verifies | — | **Owner** | Decides |
| Post-release monitoring | Contributes | Reviews | — | **Owner** | Reviews |
| Audit log review | — | — | — | **Owner** | Reviews |
| Defect prevention backlog | Contributes | **Owner** | Approves | Reviews | Reviews |

### 10.2 Role Responsibilities

**Developer:**
- Writes quality code with tests alongside (TDD on logic).
- Self-checks against Definition of Done (ENGINEERING_HANDBOOK §18).
- Responds to assigned bugs within SLA; fixes with regression tests.
- Runs local gates (lint, typecheck, tests) before push.

**QA Engineer:**
- Owns the test strategy, test data, and test automation quality.
- Triages all defects; owns severity/priority classification.
- Verifies fixes and closes bugs; runs exploratory, a11y, and acceptance testing.
- Maintains the regression suite and defect-prevention backlog.

**Product Owner:**
- Owns testable acceptance criteria for every feature.
- Approves scope and acceptance sign-off.
- Decides Won't Fix; prioritizes the defect backlog.
- Approves release scope.

**Admin (Platform/Infrastructure/DevOps):**
- Owns environments, CI/CD, security scanning, and monitoring tooling.
- Owns deployments and rollback execution.
- Reviews security findings; owns audit log review.
- Owns load/performance validation infrastructure.

**Release Manager:**
- Owns the release calendar, workflow, and gate enforcement.
- Approves releases with the confidence score; grants/records waivers.
- Leads incident/rollback decisions; owns the post-mortem process.
- Owns release notes and environment promotion discipline.

---

## 11. Security

### 11.1 Secure Releases

**What:** The security requirements a release must satisfy before production.

**Why:** A release is a promise of safety; security verification is non-negotiable.

**Standards:**

| Requirement | Standard |
|-------------|----------|
| **No open critical/high vulnerabilities** | Verified before release |
| **Secrets verified absent** | Release artifact contains no secrets |
| **Permissions verified** | RBAC for the release path is least-privilege |
| **Deploy access controlled** | Only authorized roles trigger production deploys |
| **Audit trail** | Every release action logged with actor + timestamp |
| **Immutable artifacts** | Deployed artifact is the verified artifact |
| **Signed/checksummed** | Artifact integrity verifiable |

### 11.2 Secret Validation

**What:** Guaranteeing secrets never enter code, artifacts, logs, or test data.

**Why:** A leaked payment/API key is an incident, not a bug.

**Standards:**
- Secret scanning on every commit, PR, and release artifact.
- `.env.example` placeholders only; secrets via environment/secret store (Cloudflare secrets).
- Environment variable schema (Zod) validated at startup (ENGINEERING_HANDBOOK §12.5).
- No secrets in logs, error context, or test fixtures.
- Rotation policy; credentials rotated on suspicion.
- Secrets never in screenshots, bug reports, or release notes.

### 11.3 Dependency Validation

**What:** Continuous verification of the supply chain.

**Why:** Dependency compromise is a top enterprise threat vector.

**Standards:**
- Lockfile-pinned dependencies; no floating versions.
- Vulnerability scan on every PR and daily.
- Known critical/high advisories block release.
- Dependency review: new dependencies assessed for maintenance, security, and license.
- Update policy: security patches applied promptly; verified in CI.
- Deprecated/abandoned packages flagged for replacement.

### 11.4 Vulnerability Review

**What:** Human triage of automated findings into release decisions.

**Why:** Scans produce noise; humans decide what matters.

**Standards:**
- Findings triaged by severity, exploitability, and affected surface.
- Critical/high findings require a remediation plan or formal risk acceptance by Admin + Release Manager.
- T0 surfaces (auth, payments, orders) get zero-risk tolerance for known-exploitable findings.
- Scan reports archived per release.
- Penetration tests scheduled and findings tracked to closure.

### 11.5 Audit Logging

**What:** The immutable record of quality and release actions for forensics and compliance.

**Why:** Enterprises must prove what happened, when, and by whom (AUDIT_COMPLIANCE_ENGINE).

**Audit events that must be logged:**

| Event | Data |
|-------|------|
| Release created/approved/rejected | Version, evidence, approver, timestamp |
| Production deploy/rollback | Artifact, environment, actor, reason |
| Secret/role changes | Actor, target, timestamp |
| Waiver granted | Gate, owner, reason, expiry |
| Quality gate failure/override | Gate, build, resolution |
| Bug state changes | Issue, actor, old→new state |
| Dependency risk acceptance | Package, finding, owner |

---

## 12. Performance

### 12.1 Performance Validation Model

**What:** The performance verification framework aligned with PERFORMANCE_SCALABILITY_INFRASTRUCTURE_ARCHITECTURE §1.

**Why:** Commerce performance is revenue; it must be enforced, not hoped for.

**Standards:**
- Core Web Vitals budgets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Availability SLO: 99.9% uptime (TECH_STACK §18).
- Per-endpoint latency budgets defined by tier (storefront < admin < reporting).
- Performance validated in CI, staging, and production RUM.

### 12.2 Load Validation

**What:** Verifying the system handles expected and peak traffic.

**Why:** Launch spikes and sale events are predictable; they must not degrade the storefront.

**Standards:**
- Load tests modeled on RUM-derived traffic mix.
- Scenarios: baseline, load (expected peak), stress (2–3×), soak (sustained), spike (sudden).
- Run against staging with production-like topology and synthetic data.
- Success criteria: latency budgets met at load; no errors; graceful behavior at stress.

### 12.3 Scalability Validation

**What:** Confirming the platform scales out/in predictably.

**Why:** From 0 to 1M+ users without redesign is a core priority.

**Standards:**
- Capacity signals for every new integration/endpoint (PERFORMANCE §10.8).
- Horizontal scaling behavior verified (edge functions, database connections).
- No single-module bottleneck that caps global growth.
- Scaling limits documented and load-tested.

### 12.4 Resource Usage

**What:** Monitoring CPU, memory, storage, DB connections, and bandwidth efficiency.

**Why:** Wasteful resources are cost and stability problems.

**Standards:**
- Bundle size budgets enforced in CI (PERFORMANCE §13.1).
- Database query efficiency verified (no N+1, index usage) via integration perf tests.
- Memory/CPU profiles for long-running workflows and exports.
- Storage growth tracked (media, docs, logs).
- Edge function duration/time limits respected.

### 12.5 Performance Regression Detection

**What:** Systematic comparison of performance over time to catch degradation at introduction.

**Why:** Gradual slowdowns are invisible without baselines.

**Standards:**
- Baselines captured per release for CWV, endpoint latency, and load results.
- Regression threshold: any budget violation vs baseline triggers review.
- RUM trends compared across versions in the 48-hour release report.
- CI perf budgets fail the build on budget regression.
- Alert on p95/error-rate SLO burn (PERFORMANCE §8.5).

---

## 13. Accessibility

### 13.1 Accessibility Standard

**What:** The platform-wide conformance and testing standard for accessibility.

**Why:** Accessibility is a legal requirement, a product value, and part of Definition of Done.

**Standards:**
- Conformance target: WCAG 2.2 Level AA across all surfaces.
- Automated scans in CI + manual verification per release.
- Accessibility defects follow the normal bug lifecycle with release rules.
- Design system tokens tested for contrast (DESIGN_SYSTEM_ARCHITECTURE).

### 13.2 Keyboard Navigation

**What:** Verifying every feature is fully operable by keyboard alone.

**Why:** Many users (and power users) never touch a mouse; WCAG 2.1.1 requires it.

**Standards:**
- Logical tab order; visible focus states at all times.
- Modals/dialogs: focus trapped, escaped correctly, focus restored.
- All interactive controls reachable and operable via keyboard.
- No keyboard traps in navigation, forms, or builders.

**Test approach:** Manual keyboard walkthrough of every T0/T1 flow + automated focus checks.

### 13.3 Screen Readers

**What:** Verifying content is correctly read and announced to assistive technology.

**Why:** Non-visual users depend entirely on correct semantics.

**Standards:**
- Semantic HTML: landmarks, headings, lists, buttons vs divs.
- Correct labels on every form control; error messages announced.
- Alternative text on meaningful images; empty alt on decorative.
- Live regions for dynamic updates (cart count, notifications, toasts).
- Verify with a screen reader (VoiceOver on macOS/iOS; at least one more across the matrix).

### 13.4 Mobile Accessibility

**What:** Ensuring accessibility on the mobile-first experience.

**Why:** Mobile is the primary surface (70%+ traffic).

**Standards:**
- Touch targets ≥ 44×44 px (or 24×24 minimum with adequate spacing).
- Text scaling: layouts survive browser font-size increase.
- No viewport pinch-zoom blocking.
- Orientation changes do not lose state.
- Off-screen content reachable (bottom nav, modals, menus).

### 13.5 Color Contrast

**What:** Verifying text and UI meet contrast requirements.

**Why:** Low contrast is the most common accessibility failure and an automated-testable one.

**Standards:**
- Normal text ≥ 4.5:1; large text/UI components ≥ 3:1.
- Contrast computed against the actual rendered colors (design tokens).
- States (hover, focus, disabled, error) checked, not just default.
- Color never the only differentiator (error icons + text, not red alone).

### 13.6 Reduced Motion

**What:** Respecting users who request reduced motion.

**Why:** Animations can trigger vestibular disorders; WCAG 2.3.3 (AAA) and best practice.

**Standards:**
- `prefers-reduced-motion` honored platform-wide.
- Essential motion (spinners) remains; decorative/parallax motion removed.
- No motion that causes disorientation regardless of setting.
- Framer Motion usage respects the media query (DESIGN_SYSTEM_ARCHITECTURE).

---

## 14. Future Readiness

### 14.1 AI Test Generation

**What:** The architecture for using AI to generate and maintain test coverage.

**Why:** Manual test authoring does not scale to a 1M-user platform; AI closes the gap while humans review.

**Standards:**
- AI generates candidate tests from behavior contracts (acceptance criteria, Zod schemas, API docs).
- All AI-generated tests pass human/QA review before merging — AI is a copilot, not an approver.
- Generated tests must match the deterministic, fast, layered standards (§2).
- Coverage gaps identified by tooling feed AI generation targets.
- Prompt discipline: generation grounded in schemas and fixtures, never hallucinated data.

### 14.2 AI Bug Detection

**What:** Using AI to find defects before users do.

**Why:** Some defects are invisible to scripted tests; AI pattern analysis adds a detection layer.

**Standards:**
- Anomaly detection on production errors/logs to surface novel failures early.
- Code-review AI assistance for common defect classes (null handling, race conditions, boundary bugs).
- Duplicate-bug clustering to consolidate reports.
- AI findings always triaged by humans (QA) before action.

### 14.3 Visual Regression Testing

**What:** Pixel-level comparison of rendered UI against a known-good baseline.

**Why:** Commerce UI regressions are often visual and invisible to functional tests.

**Standards:**
- Baselines captured from the design system and key pages on the standard matrix (mobile/tablet/desktop).
- Run nightly and on design-system changes; reviewable diffs with thresholds.
- Meaningful images excluded via masks (dynamic data, ads).
- Visual defects enter the normal bug lifecycle.

### 14.4 Chaos Testing

**What:** Deliberately injecting failures to prove the system degrades gracefully.

**Why:** Resilience cannot be assumed; it must be demonstrated.

**Standards:**
- Start in staging: provider outages (payments, email, shipping), DB latency, cache misses, rate-limit saturation.
- Verify graceful degradation paths for T0/T1 modules.
- Chaos results feed the rollback and incident runbooks.
- Production chaos only with explicit, gated, and reversible experiments.
- Aligned with failure-path tests (§2.10, §4.4).

### 14.5 Continuous Verification

**What:** Testing continuously in production-adjacent flows, not just pre-release.

**Why:** The gap between staged and live behavior only shrinks by verifying live.

**Standards:**
- Synthetic user journeys against production on a schedule (SLA probes).
- Canary analysis: metrics from canary cohort vs control before full rollout.
- Progressive delivery: feature flags + gradual rollout verified at each step.
- Continuous deployment of PATCH level changes after automated gates.
- Every verification step logged to the audit trail.

### 14.6 Predictive Quality Analytics

**What:** Using historical quality data to predict and prevent defects.

**Why:** Reacting to failures is expensive; predicting them is the enterprise maturity goal.

**Standards:**
- Defect data (module, phase of introduction, severity) trended and analyzed.
- High-risk modules (frequent S0/S1) get weighted test investment (§3 risk register updates).
- Release-risk scoring informed by defect density and regression history.
- Flaky-test telemetry drives suite hygiene.
- Metrics: defect escape rate, MTTR, coverage drift, suite time, release cadence — reviewed monthly.

---

## 15. Mandatory Rules for AI Agents

### 15.1 Mandatory Rules

Every future AI agent working on Nabome MUST follow:

| Rule | Description | Rationale |
|------|-------------|-----------|
| **This document governs QA** | This is the single source of truth for quality and release | Authority |
| **Every feature is testable** | No feature merges without a defined, executed test approach | Testable by default |
| **Test at the cheapest layer** | Follow the pyramid (§2.1); never E2E what a unit test covers | Speed and maintainability |
| **Tests ship with code** | Tests live in the same PR as the code they verify | Atomic verification |
| **Determinism always** | No flaky, time-dependent, order-dependent, or network-dependent tests | Trust |
| **T0 is sacred** | Auth, Payments, Orders, Inventory, APIs: 100% critical-path coverage, any failure blocks | Money and trust |
| **Never use production data** | Anonymized/synthetic fixtures only, everywhere | Compliance |
| **Bug fixes include regression tests** | A fix without a regression test is not done | Prevent recurrence |
| **Quality gates are not optional** | G1–G8 apply; no skipping, no silent overrides | Consistent quality |
| **Releases are reproducible** | Same commit → same artifact → same environment → same result | Auditability |
| **Critical bugs block production** | S0/S1 open = no release, no exception | Customer protection |
| **Rollback is always ready** | Every release is reversible in minutes | Blast-radius control |
| **Evidence is recorded** | Approvals, waivers, and test results are logged | Enterprise audit |
| **Respect module boundaries** | Test architecture independent from implementation (§ARCHITECTURE §3) | Stability |
| **Respect other standards** | ENGINEERING_HANDBOOK, SECURITY_ARCHITECTURE, PERFORMANCE_SCALABILITY apply | Consistency |
| **Do not choose tools silently** | Tool selection follows ENGINEERING_HANDBOOK §14; architecture stays tool-agnostic | Future-proofing |

### 15.2 Before Writing Tests

1. Read this document (§3 module strategy for your module).
2. Read the module's architecture document.
3. Check existing fixtures and test conventions (FOLDER_ARCHITECTURE §fixtures).
4. Identify the risk tier and test at the correct layer.
5. Ensure fixtures are deterministic and isolated.

### 15.3 While Writing Tests

1. Follow naming and structure conventions (§2.2).
2. Cover boundary, negative, and failure paths, not just happy paths.
3. Keep tests deterministic, fast, and isolated.
4. Add regression tests for any bug being fixed.
5. Never skip coverage targets for critical paths.

### 15.4 Before Releasing

1. Verify all quality gates G1–G8 are satisfied.
2. Compute and record the release confidence score (§1.7).
3. Confirm no open S0/S1 defects.
4. Confirm rollback readiness and release notes.
5. Follow the release workflow stages (§6) in order.

---

*Last updated: August 03, 2026*
*This document is the single source of truth for Nabome quality assurance, testing, and release management standards.*
