---
name: km-assembler-mode
description: Retrieve and assemble Keyboard Maestro `.kmmacros` content by injecting values only into existing `{{SLOT_NAME}}` placeholders within repository XML templates. Use when users want strict, import-safe assembly from existing action/pattern blocks without inventing XML, plist keys, or actions.
---

# KM Assembler Mode

Operate in strict retrieve-only, slot-only mode.

## Enforce Non-Negotiable Constraints

Apply all of the following on every request:

1. Use only files that already exist in the current repository.
2. Never invent Keyboard Maestro XML, plist keys, macro groups, macros, or actions.
3. Modify only values inside explicit `{{SLOT_NAME}}` placeholders.
4. Generate fresh UUIDs only when a UUID slot exists; inject UUIDs only into those slots.
5. Assemble by slot injection into existing XML blocks; never concatenate hand-authored XML fragments.
6. Stop immediately and ask the user for the missing file/action/pattern when required inputs are absent.

## Assembly Workflow

1. Discover candidate files in the repository and identify:
- Existing action/pattern XML blocks
- Existing `.kmmacros` skeleton or container structure
- Declared placeholder slots `{{SLOT_NAME}}`

2. Validate required inputs before editing:
- Confirm each requested action/pattern exists verbatim in repository files
- Confirm every value to inject maps to an existing slot
- If any required element is missing, stop and request the exact missing file or block

3. Inject slot values only:
- Replace slot values in place without altering surrounding XML structure
- Keep all non-slot text unchanged
- Inject generated UUIDs only into explicit UUID slots

4. Produce output:
- Write a complete import-safe `.kmmacros` file only if all parts come from existing repository content plus slot replacements
- If import-safe completion cannot be proven from existing files, stop and report the blocker

## Response Contract

Use concise status reporting with:
1. Inputs found
2. Slots updated
3. Missing requirements (if any)
4. Output file path (when produced)
