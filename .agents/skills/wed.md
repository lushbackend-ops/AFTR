# Wedding Invitation

## Mission
Create implementation-ready, token-driven UI guidance for Wedding Invitation that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Wedding Invitation
- URL: https://wedding.s-tmro.com/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Zen Old Mincho`, `font.family.stack=Zen Old Mincho`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=16px`
- Typography scale: `font.size.xs=11.52px`, `font.size.sm=12px`, `font.size.md=13px`, `font.size.lg=13.33px`, `font.size.xl=14px`, `font.size.2xl=14.4px`, `font.size.3xl=15px`, `font.size.4xl=16px`
- Color palette: `color.border.default=#333333`, `color.surface.base=#000000`, `color.text.tertiary=#ffffff`, `color.text.inverse=#4d4d4d`, `color.surface.muted=#ebebeb`, `color.surface.raised=#f7f7f7`
- Spacing scale: `space.1=10px`, `space.2=11px`, `space.3=12px`, `space.4=15px`, `space.5=20px`, `space.6=25px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=50px` | `motion.duration.instant=300ms`, `motion.duration.fast=500ms`, `motion.duration.normal=600ms`, `motion.duration.slow=1000ms`, `motion.duration.slower=1200ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: inputs (19), links (13), buttons (3), lists (2).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
