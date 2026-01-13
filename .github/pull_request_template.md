### Description

<!-- Provide a clear and concise description of your changes -->

### What
<!-- What changes are you making? -->

### Why
<!-- Why are these changes needed? What problem does this solve? -->

- Resolves #issue-number

### How
<!-- How did you implement these changes? What approach did you take? -->

### Related Issues
<!-- Link to related issues. Use "Closes #123" or "Fixes #456" to automatically close issues when merged -->

---

## Type of Change

<!-- Check all that apply by replacing [ ] with [x] -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes, no API changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test coverage improvement
- [ ] 🔧 Chore/maintenance

---

## Packages Affected

<!-- Check all packages that are modified in this PR -->

- [ ] `@ohcnetwork/leaderboard-api`
- [ ] `@leaderboard/plugin-runner`
- [ ] `@leaderboard/plugin-dummy`
- [ ] `create-leaderboard-plugin`
- [ ] `create-leaderboard-data-repo`
- [ ] `leaderboard-web` (Next.js app)
- [ ] Documentation (`/docs`)
- [ ] Root configuration

---

## Quality Checklist

### Core Requirements (Mandatory)

<!-- These items are required for all PRs unless explicitly noted -->

#### Version Management

- [ ] **Changeset added**: I have run `pnpm changeset` for version-tracked packages
  - [ ] Changeset follows [semantic versioning](https://semver.org/) (patch/minor/major)
  - [ ] Changeset description is clear and user-facing
  - [ ] **OR** this PR only affects docs/config and doesn't need a changeset

> 📚 **Learn more**: Run `pnpm changeset` and follow the prompts. See [Changesets documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)

#### Testing

- [ ] **Tests added/updated**: All new code has corresponding tests
  - [ ] Unit tests for business logic
  - [ ] Integration tests where applicable  
  - [ ] Edge cases and error scenarios covered
- [ ] **All tests passing**: `pnpm test` runs successfully
- [ ] **Test coverage maintained or improved**: Run `pnpm test:coverage` to verify

> 📚 **Learn more**: See [Testing Guide](../docs/testing.mdx)

#### Build & Type Safety

- [ ] **Build succeeds**: `pnpm build:packages` completes without errors
- [ ] **TypeScript types correct**: No type errors (`pnpm --filter <package> typecheck`)
- [ ] **Linting passes**: `pnpm --filter leaderboard-web lint` (for web app changes)

### Documentation

- [ ] README updated if there are user-facing changes
- [ ] Code comments added for complex logic
- [ ] JSDoc/TSDoc added for public APIs and exported functions
- [ ] Documentation site (`/docs`) updated if needed
- [ ] Migration guide included if this introduces breaking changes

> 📚 **Learn more**: See [Architecture docs](../docs/architecture.mdx) for project structure

### Plugin-Specific Requirements

<!-- Only applicable if you're creating or modifying a plugin -->

- [ ] Plugin follows the API contract defined in [`packages/api/src/types.ts`](../packages/api/src/types.ts)
- [ ] Plugin includes comprehensive tests
- [ ] Plugin has README with clear usage examples
- [ ] Plugin configuration schema is documented
- [ ] Plugin is added to the plugin documentation

> 📚 **Learn more**: See [Creating Plugins Guide](../docs/plugins/creating-plugins.mdx)

---

## Screenshots / Videos

<!-- 
For UI changes: Include before/after screenshots
For new features: Demo video or GIF is highly encouraged
For bug fixes: Screenshot showing the fix in action
-->

### Before
<!-- Screenshot or description of the bug/old behavior -->

### After
<!-- Screenshot or description of the new behavior -->

---

<!-- 
Thank you for contributing to the Leaderboard project! 🎉

Before submitting:
1. Review this checklist carefully
2. Test your changes locally with `pnpm test` and `pnpm build`
3. Ensure all required checkboxes are checked
4. Request review from appropriate maintainers

Questions? Check out our documentation or ask in discussions!
-->
