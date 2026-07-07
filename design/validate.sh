#!/usr/bin/env bash
# design/ self-check: structure, caps, floors. Exit 0 = green.
set -u; cd "$(dirname "$0")"; fail=0
say(){ echo "FAIL: $1"; fail=1; }
# file:cap pairs (bash-3.2-safe: macOS default bash has no associative arrays)
for spec in INDEX.md:80 FOUNDATIONS.md:150 UI-KIT.md:250 VOICE.md:100 PATTERNS.md:150; do
  f=${spec%%:*}; cap=${spec##*:}
  [ -f "$f" ] || { say "$f missing"; continue; }
  n=$(wc -l < "$f"); [ "$n" -le "$cap" ] || say "$f $n lines > cap $cap"
done
[ -f DECISIONS.md ] || say "DECISIONS.md missing"
grep -q '^## Floors' INDEX.md 2>/dev/null || say "INDEX.md lacks §Floors"
grep -q '^## Brief'  INDEX.md 2>/dev/null || say "INDEX.md lacks §Brief"
grep -q 'last-challenged:' INDEX.md 2>/dev/null || say "INDEX.md lacks last-challenged stamp"
# tokens-only discipline: raw color values outside FOUNDATIONS are a leak.
# KNOWN FP: a hex-shaped word/ref (#cafe, #decaf, #123456 issue ref) also trips it —
# reword the prose or move the value into a FOUNDATIONS token.
leaks=$(grep -lE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' UI-KIT.md VOICE.md PATTERNS.md 2>/dev/null || true)
[ -z "$leaks" ] || say "raw color outside FOUNDATIONS: $leaks"
exit $fail
