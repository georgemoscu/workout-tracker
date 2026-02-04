<!--
SYNC IMPACT REPORT
==================
Version Change: N/A → 1.0.0 (Initial Constitution)
Modified Principles: N/A (Initial creation)
Added Sections:
  - Core Principles (3 principles defined)
  - Technology Stack
  - Development Standards
  - Governance
Templates Status:
  ✅ plan-template.md - Aligned with no-tests principle
  ✅ spec-template.md - Requirements match readability/maintainability focus
  ✅ tasks-template.md - Tests marked OPTIONAL (aligned with constitution)
Follow-up TODOs: None
-->

# Workout Tracker Constitution

## Core Principles

### I. Readability First

Code MUST prioritize clarity over cleverness. Every component, function, and variable name MUST clearly communicate its purpose without requiring additional context.

**Rationale**: In a mobile app where user experience and rapid iteration are critical, readable code enables faster debugging, easier onboarding, and more confident refactoring. Complex abstractions slow development velocity.

**Rules**:

- Descriptive naming required; abbreviations avoided unless universally recognized (e.g., `id`, `url`)
- Functions MUST do one thing; names MUST reflect that single responsibility
- Complex logic MUST be broken into smaller, self-documenting functions
- Comments used sparingly—only for "why" not "what"

### II. Maintainability & Simplicity

Solutions MUST be as simple as possible to meet requirements. Premature optimization and over-engineering are prohibited.

**Rationale**: Mobile apps require frequent updates and feature additions. Simple, maintainable code reduces technical debt and allows the team to move quickly without accumulating complexity.

**Rules**:

- YAGNI (You Aren't Gonna Need It) strictly enforced—only build what's required now
- Avoid introducing new dependencies unless absolutely necessary
- Keep component hierarchy shallow; avoid deep nesting
- State management MUST be straightforward and predictable
- Reuse components and patterns before creating new ones

### III. No Unit Testing

Unit tests MUST NOT be written for this project. Manual testing and user validation are the primary quality gates.

**Rationale**: For this mobile app, rapid iteration and user feedback cycles provide more value than automated test coverage. Development resources are focused on features rather than test infrastructure.

**Rules**:

- No test files or test frameworks installed
- Quality verified through manual testing on target devices
- User acceptance testing takes precedence
- Critical flows validated through hands-on testing before release

## Technology Stack

**Platform**: Expo (React Native)  
**UI Framework**: Tailwind CSS (NativeWind)  
**Language**: TypeScript  
**Navigation**: Expo Router (file-based routing)

**Constraints**:

- All UI components MUST use Tailwind classes for styling consistency
- TypeScript strict mode MUST be enabled
- Expo SDK compatibility MUST be maintained for all dependencies
- React Native version MUST align with Expo SDK requirements

## Development Standards

### Code Organization

- File-based routing in `app/` directory (Expo Router convention)
- Reusable components in `components/` directory
- Constants and shared data in `consts/` directory
- Assets organized by type in `assets/` directory

### Component Structure

- Functional components with hooks MUST be used exclusively
- Props MUST be typed with TypeScript interfaces
- Component files MUST export one primary component
- Keep components focused—split when exceeding 200 lines

### State Management

- Use React hooks (`useState`, `useReducer`) for local state
- Avoid global state unless absolutely necessary
- Props drilling acceptable for up to 2 levels; beyond that, consider context

### Performance

- Images MUST use `expo-image` for optimization
- Lists MUST use `FlatList` or `SectionList` for performance
- Avoid unnecessary re-renders; use `React.memo` judiciously
- Keep bundle size reasonable; monitor with Expo build analytics

## Governance

This constitution supersedes all other development practices and guidelines. All feature specifications, implementation plans, and code reviews MUST verify compliance with these principles.

**Amendment Process**:

1. Proposed changes MUST be documented with rationale
2. Team review and approval required
3. Constitution version MUST be incremented per semantic versioning
4. All templates and documentation MUST be updated to reflect changes

**Version Control**:

- MAJOR: Backward-incompatible principle changes (e.g., introducing unit tests)
- MINOR: New principles added or existing ones materially expanded
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Compliance Verification**:

- All specifications MUST reference relevant constitutional principles
- Implementation plans MUST include constitution check gates
- Code reviews MUST verify adherence to readability and simplicity standards

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
