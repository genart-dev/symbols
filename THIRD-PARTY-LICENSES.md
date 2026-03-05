# Third-Party Licenses — @genart-dev/symbols

Icons embedded in `.genart` sketch files via the `fetch_symbol` MCP tool are sourced
from third-party open-source icon libraries through the [Iconify API](https://iconify.design).
This document lists the approved source libraries, their licenses, and the obligations
that apply when distributing `.genart` files containing their content.

---

## How attribution works in .genart files

When `fetch_symbol` embeds an icon, it:

1. Stores the icon's SVG path data in `sketch.symbols[id]` as a `SketchSymbolDef`,
   with `iconifyId` (e.g. `"ph:cat"`) and `license` (e.g. `"MIT (Phosphor Icons)"`)
   fields recording provenance on the symbol itself.

2. Appends a `ThirdPartyNotice` entry to `sketch.thirdParty` — a top-level array
   that aggregates all upstream credits for the file, deduplicated by library name.
   This is the canonical place for exporters, display surfaces, and distribution
   tools to find and surface attribution.

A `.genart` file that includes Phosphor and Lucide icons will have a `thirdParty`
section like:

```json
"thirdParty": [
  {
    "name": "Phosphor Icons",
    "license": "MIT",
    "copyright": "Copyright (c) 2023 Phosphor Icons",
    "url": "https://github.com/phosphor-icons/core"
  },
  {
    "name": "Lucide",
    "license": "ISC",
    "copyright": "Copyright (c) 2022 Lucide Contributors",
    "url": "https://github.com/lucide-icons/lucide"
  }
]
```

Exporters and any tool that distributes or publishes `.genart` files **must** include
these notices wherever the sketch is shared. The minimum required form is a CREDITS or
LICENSES section listing each entry's `name`, `license`, `copyright`, and `url`.

---

## Approved icon libraries

Only the prefixes listed here may be embedded via `fetch_symbol`. The allowlist is
enforced in `symbols/src/iconify.ts` (`SAFE_PREFIXES`). All listed libraries permit
embedding their icons in application files and distributing those files commercially,
subject to the conditions below.

---

### `ph` — Phosphor Icons

| Field | Value |
|---|---|
| License | MIT |
| Copyright | Copyright (c) 2023 Phosphor Icons |
| URL | https://github.com/phosphor-icons/core |

**Obligation:** Include the copyright notice and MIT license text in any distribution
of the sketch file or any product built from it.

---

### `lucide` — Lucide

| Field | Value |
|---|---|
| License | ISC |
| Copyright | Copyright (c) 2022 Lucide Contributors (ISC portion); Copyright (c) 2013-2022 Cole Bemis (MIT/Feather portions) |
| URL | https://github.com/lucide-icons/lucide |

Lucide is dual-licensed: ISC for Lucide-original icons, MIT for icons derived from
Feather Icons. Both licenses permit embedding and distribution with attribution.

**Obligation:** Include the copyright notice and ISC license text in any distribution.

---

### `tabler` — Tabler Icons

| Field | Value |
|---|---|
| License | MIT |
| Copyright | Copyright (c) 2020-2024 Paweł Kuna |
| URL | https://github.com/tabler/tabler-icons |

**Obligation:** Include the copyright notice and MIT license text in any distribution.

---

### `heroicons` — Heroicons

| Field | Value |
|---|---|
| License | MIT |
| Copyright | Copyright (c) 2020 Tailwind Labs, Inc. |
| URL | https://github.com/tailwindlabs/heroicons |

**Obligation:** Include the copyright notice and MIT license text in any distribution.

---

### `bi` — Bootstrap Icons

| Field | Value |
|---|---|
| License | MIT |
| Copyright | Copyright (c) 2019-2024 The Bootstrap Authors |
| URL | https://github.com/twbs/icons |

**Obligation:** Include the copyright notice and MIT license text in any distribution.

---

### `mdi` — Material Design Icons

| Field | Value |
|---|---|
| License | Apache-2.0 |
| Copyright | Copyright (c) Google LLC |
| URL | https://github.com/google/material-design-icons |

**Obligation:** Include a copy of the Apache 2.0 license and retain the copyright notice.
Apache 2.0 also requires noting any modifications made to the original work.

---

### `ri` — Remix Icon

| Field | Value |
|---|---|
| License | Remix Icon License v1.0 (custom) |
| Copyright | Copyright (c) 2017-2024 Remix Design |
| URL | https://github.com/Remix-Design/RemixIcon |

> **Note:** Remix Icon uses a custom license — not MIT/Apache/ISC. Embedding individual
> icons as functional UI elements in a sketch file is explicitly permitted (§2.1, §2.3).
> However the license prohibits selling or redistributing the icons as a standalone icon
> product (§3.1) and using them as logos or trademarks (§3.3).
>
> If you are distributing a `.genart` file that contains Remix icons as part of a larger
> work where the icons are decorative or functional elements, you are within the permitted
> use. If you are building a product whose primary value is the icons themselves, do not
> use the `ri` prefix.

**Obligation:** When distributing the complete icon library or substantial portions,
include a copy of the Remix Icon License. For individual icon use within a larger work,
no notice is required per §5 of the license — but including a credit is appreciated.

---

### `carbon` — Carbon Icons (IBM)

| Field | Value |
|---|---|
| License | Apache-2.0 |
| Copyright | Copyright (c) 2015 IBM Corp. |
| URL | https://github.com/carbon-design-system/carbon |

**Obligation:** Include a copy of the Apache 2.0 license and retain the copyright notice.

---

### `fluent` — Fluent UI System Icons (Microsoft)

| Field | Value |
|---|---|
| License | MIT |
| Copyright | Copyright (c) 2020 Microsoft Corporation |
| URL | https://github.com/microsoft/fluentui-system-icons |

**Obligation:** Include the copyright notice and MIT license text in any distribution.

---

## Adding new prefixes

To add a new Iconify prefix to the allowlist:

1. Verify the license is MIT, ISC, Apache-2.0, or similarly permissive (no CC-BY-SA,
   GPL, or custom licenses with redistribution restrictions beyond Remix Icon's).
2. Add the prefix to `SAFE_PREFIXES` in `symbols/src/iconify.ts`.
3. Add a `ThirdPartyNotice` entry to `ICONIFY_NOTICES` in
   `mcp-server/src/tools/symbols.ts` with the correct copyright line from the
   upstream LICENSE file.
4. Add a section to this document with the library details and obligations.
