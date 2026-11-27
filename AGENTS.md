# Project Ground Rules

These rules apply to all work in this repository.

1. Do not add code comments.
2. Make changes in small, focused, independently reviewable chunks. Large changes or diffs are not allowed.
3. Follow the project's existing architecture patterns and code style. Read the relevant surrounding code before making changes.
4. Before implementing any feature, present a plan describing the approach, scope, and small implementation chunks. Plan before executing.
5. Leave changes uncommitted for user review. Commit only after the user approves the reviewed changes.

## Frontend design and loading conventions

- Use `packages/ui` as the design system and the relevant Figma design for feature layouts when one exists. Reuse comparable existing screens when no design exists.
- Use skeleton loaders that match the actual content being fetched: preserve its layout, component sizes, field groups, cards, and table columns. Load independent sections separately and keep their skeletons local to those sections.
- Gate data requests, navigation, visible actions, and mutation submissions by the applicable permissions.
- Use `EmptyState` from `@cariva/ui/components/empty-state/index.js` for empty data, no matching results (`kind="no-results"`), and request failures (`kind="error"`). Use the compact layout inside small cards and form sections, and the full layout for workspaces and tables. Offer permission-gated creation actions for empty data, secondary clear-filter actions for no results, and secondary retry actions for failed requests.
