# Release workflow

Use when: shipping an authorized BEDS package or upgrading a consumer.
Do not use when: previewing locally or changing application business behavior.
Read next: [Artifact validation](docs/design/espaco-library/ARTIFACT-VALIDATION.md).

1. Update package version and matching canonical contracts; keep runtime/source changes explicit.
2. `npm ci --ignore-scripts` then `npm run verify`; run relevant browser checks for changed UI.
3. Pack from `packages/beds` into an external temporary directory: `npm pack --ignore-scripts --pack-destination <directory>`.
4. Inspect archive paths, secret scan and licenses; record SHA-256 outside the archive.
5. With authorization, commit source/docs/lockfile, push the named branch and a new version tag. Never replace an existing tag or release asset.
6. Attach the `.tgz` to a GitHub prerelease at that exact tag; include source SHA, artifact hash, actual gates and limits. No npm registry publication required.
7. Download the public release asset again, verify its hash and import in a fresh consumer. Update the app dependency/lockfile to the fixed release URL; no source alias.
8. Verify application build, scoped consumer roots and integration browser checks. Existing screens migrate separately with reviewed behavior.

Rollback: select the previous known release URL/integrity, reinstall and rerun app gates. Do not mutate the old release.

Initial extraction preserves RC13 runtime byte-for-byte. RC14 changes repository/
distribution metadata and repository setup only. Historical machine-specific reports
are excluded from publication; source screenshots/provenance remain historical.

RC15 renames the actual package/import to `beds` and source folder to `packages/beds`.
RC14 remains immutable under its original name. Upgrade consumers by replacing
the dependency and imports, not by adding an alias. Public components, CSS classes,
tokens and fonts are unchanged. Historical document/catalog directory names remain
stable; package paths in canonical docs follow the current repository layout.

RC16 consolidates the catalog additions since RC15:113 public components and92
tokens. New shared control-boundary/error-text roles intentionally strengthen
functional contrast without changing decorative card borders. Toast errors,
warnings and actions now persist until dismissed;informational notices have a
5s minimum. AppShell adds a default Portuguese keyboard bypass label,overridable
through `skipToContentLabel`. Existing consumer product behavior remains owned
by each host. See the current validation record and six-domain consolidation
review before adoption;motion proposals are not implemented or approved.
