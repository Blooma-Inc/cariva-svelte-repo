## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, mdsvex, mcp

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Frontend conventions

- Before adding frontend UI, inspect `packages/ui` and comparable tenant app screens. Reuse existing shared components, including `InputField`, `SelectField`, `CheckField`, `TextareaField`, and Tabs with their design-system styling; avoid raw replacements and unnecessary style overrides.
- Follow existing form patterns: Superforms with Zod, `FormField`, shared field components, and `use:enhance`. Keep API mutations, loading flags, and errors in the appropriate store. Do not replace `use:enhance` with `fromAction(enhance)` or attachment syntax solely because an analyzer suggests it.
- Create modals through the central modal system: add the enum and typed payload in `lib/store/app/modal-types.ts`, keep context and open state in `AppStore`, register a lazy import in `lib/components/modal-bank.svelte`, and wrap the modal in `DialogModal` or `SheetModal`. Launch and close through `AppStore.toggleModals`; keep triggers separate from modal content so the modal mounts only while open.
- Each API hook domain uses `fetch-key-factory.ts` for request paths, parameters, and query keys. Use the factory in hooks and corresponding cache invalidation instead of duplicating inline keys. Preserve tenant, branch, patient, and filter scope where applicable.
