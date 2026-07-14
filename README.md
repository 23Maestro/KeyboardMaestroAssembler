# Keyboard Maestro Assembler

Raycast tools for listing Keyboard Maestro macros and assembling import-safe
`.kmmacros` files from exported templates.

## Template Library

Templates live under:

```text
templates/action-groups/{group}/{raw,slotized}
```

Use this naming shape:

```text
{number}_{group-label}_{action-name}.kmmacros
```

Rules:

- `raw` contains untouched Keyboard Maestro exports.
- `slotized` contains exports with explicit `{{SLOT_NAME}}` placeholders.
- Assembly may only replace declared slots.
- Generated macro identity values must use fresh UUIDs through explicit UUID slots.

Current registry:

```text
templates/manifests/action-registry.json
```
