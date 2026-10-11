# Git Workflow & Branching Strategy

This repo uses git flow. `develop` is the default branch on GitHub and the base for all day-to-day work. `main` is production: every push to `main` builds and deploys the app to Hostinger (`.github/workflows/main.yml`). There is no staging environment yet, so code reaches users only through a release or a hotfix.

```
hotfix/*  ──PR──►  main (production)  ◄──PR──  release/x.y.z
                     │                              ▲
                     │ mergeback PR (automatic)     │ cut from develop
                     ▼                              │
feat/* fix/* ──PR──►  develop (integration, default) ┘
```

## Branches

| Branch | Cut from | PR into | Purpose |
|---|---|---|---|
| `feat/*`, `fix/*`, `refactor/*`, `chore/*` | `develop` | `develop` | Day-to-day work |
| `release/x.y.z` | `develop` | `main` | Ship what has collected on `develop` |
| `hotfix/*` | `main` | `main` | Urgent production fix that can't wait for a release |
| `develop` | — | — | Integration branch; never commit to it directly |
| `main` | — | — | Production; only release and hotfix PRs merge here |

## Day-to-day work

```bash
git checkout develop
git pull origin develop
git checkout -b feat/email-notifications

# ...commit...
git push -u origin feat/email-notifications
gh pr create --base develop
```

Keep a long-running branch current with `git rebase origin/develop` (or `git merge origin/develop` if the branch is shared).

## Releasing

1. Pick the next version from what landed on `develop` since the last release (semver: `fix` → patch, `feat` → minor, breaking → major).
2. Cut the release branch, bump `package.json` to that version, and open the PR into `main`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.1.0
   npm version 1.1.0 --no-git-tag-version
   git commit -am "chore(release): 1.1.0"
   git push -u origin release/1.1.0
   gh pr create --base main --title "release: 1.1.0"
   ```

3. Merge it with a **merge commit**. Merging deploys to production, and the release workflow tags the merge as `v1.1.0`.
4. The mergeback workflow opens a `main` → `develop` PR; merge it with a merge commit too. It carries the version bump back to `develop`.

To see what has landed since the last release: `git log --oneline v1.0.1..develop` (use the latest tag).

## Hotfixes

```bash
git checkout main
git pull origin main
git checkout -b hotfix/login-loop

# ...fix, commit...
npm version patch --no-git-tag-version
git commit -am "chore(release): 1.1.1"
git push -u origin hotfix/login-loop
gh pr create --base main
```

Merging deploys the fix and tags it (`v1.1.1`). `.github/workflows/mergeback.yml` then opens the `main` → `develop` PR automatically. Merge it promptly: until it lands, `develop` doesn't have the fix, and the next release would either bring the bug back or conflict.

## Versions and tags

Every `release/` and `hotfix/` PR into `main` must raise the version in `package.json`; `.github/workflows/release-version.yml` fails the PR check if it doesn't, or if a `release/x.y.z` branch name doesn't match the version. After the merge, the same workflow tags the merge commit as `v<version>`. Nothing else reacts to tags; they mark what went to production.

## Merge methods

- Feature PRs into `develop`: any method.
- Release PRs into `main` and mergeback PRs into `develop`: **merge commit only**. Squash or rebase rewrites the commits, so `main` and `develop` stop sharing history and every later release or mergeback conflicts.

## Commit messages

One conventional-commit subject line, no body:

```
feat(tickets): add bulk ticket assignment
fix(auth): stop redirect loop after login
chore(ci): open mergeback PR after hotfixes
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `chore`. The reasoning goes in the PR description. To reference another PR or issue, paste its full URL; a bare `#123` auto-links to whatever has that number in this repo.

## Cleaning up

```bash
git branch -d feat/email-notifications
git push origin --delete feat/email-notifications
git fetch --prune
```

## Undoing mistakes

- **Last commit, not pushed:** `git reset --soft HEAD~1`
- **Last commit, pushed:** `git revert HEAD && git push`
- **Deleted branch:** find the commit with `git reflog`, then `git checkout -b recovered <hash>`
- **PR merged into `main` by mistake:** if `main` and `develop` were level beforehand, a revert would try to undo far more than the PR. Reset `main` to the commit before the merge and force-push it instead, after checking with the team.
