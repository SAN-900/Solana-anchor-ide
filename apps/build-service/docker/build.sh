#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="${BUILDER_IMAGE:-solana-web-ide-builder:latest}"

docker build -t "$IMAGE" -f "$ROOT/docker/Dockerfile" "$ROOT/docker"

echo "Built $IMAGE (based on solanafoundation/anchor)"