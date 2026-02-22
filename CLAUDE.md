# Claude Code Instructions

## Worktree Workflow

**Always make code changes in a git worktree, never directly on the checked-out branch.**

### Setup for each task

1. Create a new worktree inside the `worktrees/` directory:
   ```bash
   git worktree add worktrees/<branch-name> -b <branch-name>
   ```

2. Do all file edits and commits inside that worktree.

3. When the task is complete, push the branch and open a PR:
   ```bash
   git -C worktrees/<branch-name> push -u origin <branch-name>
   gh pr create --head <branch-name>
   ```

4. Remove the worktree after the PR is merged:
   ```bash
   git worktree remove worktrees/<branch-name>
   git branch -d <branch-name>
   ```

### Notes

- The `worktrees/` directory is gitignored and must never be committed.
- Branch names should be short and descriptive, e.g. `fix-opacity-default` or `add-pdf-export`.
- One worktree per task — don't reuse worktrees across unrelated changes.

## Approval Workflow (No PRs)

When the user approves the changes in a worktree branch, follow these steps:

1. **Squash** all commits on the worktree branch into a single commit:
   ```bash
   git -C worktrees/<branch-name> rebase -i --autosquash $(git -C worktrees/<branch-name> merge-base HEAD main)
   ```

2. **Rebase** the squashed commit on top of the latest main:
   ```bash
   git -C worktrees/<branch-name> fetch origin main
   git -C worktrees/<branch-name> rebase origin/main
   ```

3. If there are **conflicts**, stop and ask the user how to resolve them before continuing.

4. **Fast-forward merge** the squashed commit into main:
   ```bash
   git checkout main
   git merge --ff-only <branch-name>
   ```

5. **Ask the user for permission** before pushing to remote. Only push after explicit approval:
   ```bash
   git push origin main
   ```

6. Clean up the worktree and branch after pushing:
   ```bash
   git worktree remove worktrees/<branch-name>
   git branch -d <branch-name>
   ```

**Do not open PRs** — changes go directly to main after user approval.

## Testing Before Approval

When a feature is ready for testing, start the dev server in the worktree and report the URL and port to the user:

```bash
cd worktrees/<branch-name> && npx vite
```

Wait for Vite to print the local URL (e.g. `http://localhost:5173`) and tell the user the exact address before proceeding.

## Post-Push Checks

After pushing to remote `main`:

1. Wait for GitHub Actions to complete:
   ```bash
   gh run watch
   ```

2. Check the result:
   ```bash
   gh run list --branch main --limit 1
   ```

3. If any workflow **failed**, report it to the user with the run URL before doing anything else.

## Cleanup

After the push (and Actions check), always clean up:

```bash
git worktree remove worktrees/<branch-name>
git branch -d <branch-name>
```
