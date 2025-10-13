# Git Workflow & Branching Strategy

## Current Branch Structure ✅

```
main (production)
├── develop (integration branch)
    └── feature/new-enhancements (current working branch)
```

## Branch Overview

### 🚀 main
- **Purpose:** Production-ready code
- **Status:** Protected branch
- **Merges from:** develop (via Pull Request)
- **Never commit directly** to this branch

### 🔧 develop
- **Purpose:** Integration branch for features
- **Status:** Active development
- **Merges from:** feature/* branches
- **Merges to:** main (when ready for release)

### ⭐ feature/new-enhancements (Current)
- **Purpose:** New features and enhancements
- **Based on:** develop
- **Will merge to:** develop (via Pull Request)

## Git Workflow Guide

### For New Features

#### 1. Start a New Feature
```bash
# Make sure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create new feature branch
git checkout -b feature/feature-name

# Examples:
# git checkout -b feature/email-notifications
# git checkout -b feature/advanced-search
# git checkout -b feature/reports-dashboard
```

#### 2. Work on Feature
```bash
# Make changes to your code
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add email notification system"

# Push to GitHub
git push -u origin feature/feature-name
```

#### 3. Keep Feature Branch Updated
```bash
# Fetch latest changes from develop
git fetch origin develop

# Rebase your feature on develop (recommended)
git rebase origin/develop

# Or merge develop into your feature (alternative)
git merge origin/develop
```

#### 4. Complete Feature
```bash
# Push final changes
git push origin feature/feature-name

# Create Pull Request on GitHub:
# Go to: https://github.com/DavidFlores79/help-desk-module/pulls
# Click "New Pull Request"
# Base: develop <- Compare: feature/feature-name
# Add description and create PR
```

#### 5. After PR is Merged
```bash
# Switch to develop
git checkout develop
git pull origin develop

# Delete local feature branch
git branch -d feature/feature-name

# Delete remote feature branch
git push origin --delete feature/feature-name
```

### For Bug Fixes

#### 1. Start a Bug Fix
```bash
# Create from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/bug-name

# Examples:
# git checkout -b bugfix/fix-login-error
# git checkout -b bugfix/attachment-download-issue
```

#### 2. Work and Merge
```bash
# Make fixes, commit, and push
git add .
git commit -m "fix: resolve login timeout issue"
git push -u origin bugfix/bug-name

# Create PR to develop
# After merge, delete branch
```

### For Hotfixes (Urgent Production Fixes)

#### 1. Start a Hotfix
```bash
# Create from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Example:
# git checkout -b hotfix/security-vulnerability
```

#### 2. Complete Hotfix
```bash
# Make fixes
git add .
git commit -m "fix: patch security vulnerability"
git push -u origin hotfix/critical-bug

# Create PR to main
# After merge to main, also merge to develop:
git checkout develop
git merge main
git push origin develop
```

## Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation only
- **style:** Formatting, missing semicolons, etc.
- **refactor:** Code restructuring
- **perf:** Performance improvement
- **test:** Adding tests
- **chore:** Build process or auxiliary tools

### Examples
```bash
# Feature
git commit -m "feat(tickets): add bulk ticket assignment"

# Bug Fix
git commit -m "fix(modal): resolve z-index click blocking issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(services): simplify ticket service methods"

# Multiple lines
git commit -m "feat(attachments): add file preview feature

- Implement image preview in modal
- Add PDF viewer integration
- Support for common document types

Closes #123"
```

## Current Status

### Active Branches
- ✅ **main** - Production (pushed to GitHub)
- ✅ **develop** - Integration (pushed to GitHub)
- ✅ **feature/new-enhancements** - Current working branch (local only)

### Ready for Development
You're currently on `feature/new-enhancements` and ready to:
1. Make new changes
2. Commit regularly
3. Push to GitHub when ready
4. Create PR to merge into develop

## Quick Commands Reference

### Check Status
```bash
# See current branch and changes
git status

# See all branches
git branch -a

# See commit history
git log --oneline --graph --all
```

### Switch Branches
```bash
# Switch to existing branch
git checkout branch-name

# Switch to develop
git checkout develop

# Switch back to feature
git checkout feature/new-enhancements
```

### Update from Remote
```bash
# Fetch all branches
git fetch origin

# Pull current branch
git pull

# Pull specific branch
git pull origin develop
```

### Push Changes
```bash
# Push current branch
git push

# Push new branch
git push -u origin branch-name

# Force push (use carefully!)
git push --force
```

### Clean Up
```bash
# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Remove merged branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

## Best Practices

### ✅ DO
- Commit often with meaningful messages
- Pull before starting new work
- Create feature branches for new work
- Write descriptive commit messages
- Test before pushing
- Keep commits focused and atomic
- Rebase feature branches on develop regularly

### ❌ DON'T
- Commit directly to main or develop
- Push broken code
- Use generic commit messages ("fix", "update", "changes")
- Mix multiple features in one branch
- Force push to shared branches
- Leave branches unmerged for too long

## Workflow Diagram

```
main (production)
  ↑
  │ PR (when ready for release)
  │
develop (integration)
  ↑
  │ PR (when feature complete)
  │
feature/new-enhancements (your work)
  │
  │ git add . && git commit
  │ git push
  ↓
GitHub (remote)
```

## Emergency Procedures

### Undo Last Commit (not pushed)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (pushed)
```bash
git revert HEAD
git push
```

### Discard All Local Changes
```bash
git reset --hard HEAD
git clean -fd
```

### Recover Deleted Branch
```bash
git reflog
git checkout -b recovered-branch <commit-hash>
```

## Next Steps

1. **Start working** on `feature/new-enhancements`
2. **Make changes** and commit regularly
3. **Push to GitHub** when ready
4. **Create PR** to merge into develop
5. **Repeat** for new features

---

**Repository:** https://github.com/DavidFlores79/help-desk-module  
**Current Branch:** feature/new-enhancements  
**Last Updated:** January 13, 2025
