# Beehiiv Post Configuration Reference

This document captures confirmed settings for The Edge newsletter on Beehiiv.

---

## ⚠ Critical Discovery (Issue #002): Only the Basic Tab Drives Email Rendering

The Advanced tab does NOT control what subscribers receive in their email inbox. Despite appearing to configure colors for Canvas, Post, H1-H3, Links, and Buttons — none of those changes appear in sent emails.

**The ONLY tab that matters for email output is the Basic tab.**

Navigate to: **Style icon (paint brush) → Basic tab → Colors**

| Field | Value | Notes |
|---|---|---|
| Outside Background | `#0A0A09` | Black canvas |
| Post Background | `#161614` | Dark card |
| Text On Background | `#F5F0E8` | Ivory cream — was `#374151` by default |
| Primary | `#D4932A` | Amber — controls button color |
| Text on primary | `#0A0A09` | Dark text on amber button |
| Secondary | `#030712` | Leave as-is |
| Links | `#D4932A` | Amber |

These are confirmed as of Issue #002 (2026-04-13). The Advanced tab may still be used for web-hosted post view styling, but never rely on it for email color accuracy.

**How to set colors:** Click the color swatch → type hex in the picker popup → press Enter. This reliably saves. The fields also accept hex typed directly followed by Enter in the picker.

---

## Widgets

### Links

- Basic tab Links field: `#D4932A` (Amber) — this is authoritative for email rendering.

---

## Verification Checklist

> All color fields below are controlled by the Basic tab (not Advanced). Verify Basic tab values before sending.

- [ ] Outside Background: `#0A0A09`
- [ ] Post Background: `#161614`
- [ ] Text On Background: `#F5F0E8`
- [ ] Primary (button): `#D4932A`
- [ ] Text on primary: `#0A0A09`
- [ ] Links: `#D4932A`
- [ ] Preview send confirmed before broadcast
