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
