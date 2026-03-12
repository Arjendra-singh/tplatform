#!/usr/bin/env bash
set -euo pipefail

TARGET_REMOTE="${1:-origin}"
TARGET_BRANCH="${2:-main}"

current_branch="$(git branch --show-current)"

echo "[info] current branch: ${current_branch}"

echo "[step] fetch latest ${TARGET_REMOTE}/${TARGET_BRANCH}"
if git fetch "${TARGET_REMOTE}" "${TARGET_BRANCH}"; then
  echo "[step] rebase on ${TARGET_REMOTE}/${TARGET_BRANCH}"
  git rebase "${TARGET_REMOTE}/${TARGET_BRANCH}"
else
  echo "[warn] could not fetch ${TARGET_REMOTE}/${TARGET_BRANCH}; skipping rebase"
fi

echo "[step] run mandatory checks"
node scripts/ci-preflight.mjs
npm run validate:json
npm test

echo "[step] conflict-marker scan"
node scripts/check-no-conflict-markers.mjs

echo "[ok] branch is ready for PR"
