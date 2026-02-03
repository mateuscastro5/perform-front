#!/usr/bin/env bash
set -e

BRANCH=${1:-main}

git pull origin "$BRANCH"

git push gitlab "$BRANCH"
