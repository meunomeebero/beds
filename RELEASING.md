# Release workflow

Use when: shipping an authorized BEDS package or upgrading a consumer.
Do not use when: previewing locally or changing application business behavior.
Read next: [Artifact validation](docs/design/espaco-library/ARTIFACT-VALIDATION.md).

1. Update package version and matching canonical contracts; keep runtime/source changes explicit.
2. `npm ci --ignore-scripts` then `npm run verify`; run relevant browser checks for changed UI.
3. Pack from `packages/espaco-ui` into an external temporary directory: `npm pack --ignore-scripts --pack-destination <directory>`.
4. Inspect archive paths, secret scan and licenses; record SHA-256 outside the archive.
5. With authorization, commit source/docs/lockfile, push the named branch and a new version tag. Never replace an existing tag or release asset.
6. Attach the `.tgz` to a GitHub prerelease at that exact tag; include source SHA, artifact hash, actual gates and limits. No npm registry publication required.
7. Download the public release asset again, verify its hash and import in a fresh consumer. Update the app dependency/lockfile to the fixed release URL; no source alias.
8. Verify application build, scoped consumer roots and integration browser checks. Existing screens migrate separately with reviewed behavior.

Rollback: select the previous known release URL/integrity, reinstall and rerun app gates. Do not mutate the old release.

Initial extraction preserves RC13 runtime byte-for-byte. RC14 changes repository/
distribution metadata and repository setup only. Historical machine-specific reports
are excluded from publication; source screenshots/provenance remain historical.
