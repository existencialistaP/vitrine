# SDD — Preview redesign + unified save report

Branch: `feat/editor-vitrine-unificado`
Scope: editor only.

## Summary

Replaced the multi-surface preview (persistent `lg+` column, mobile `Sheet`,
centered fullscreen `Dialog`, editor-owned resize handle) with a single
top-anchored dropdown panel opened from a "Prévia" trigger in the editor bar.
Unified the two save actions (`salvarConteudo` + `salvarAparencia`) into one
`salvar()` ("Publicar") and removed the mode-switch draft discard entirely.

## Files changed

### `src/components/features/aparencia/preview-panel.tsx` (rewritten)

- Props reduced to `vitrine`, `prefs`, `onAtualizar`, `paginaId`,
  `onTrocarPagina`.
- Trigger: `Button variant="outline" size="sm"` labelled "Prévia" with
  `aria-haspopup="dialog"` / `aria-expanded={!prefs.oculta}`; click toggles
  `onAtualizar({ oculta: !prefs.oculta })`.
- Panel: single base-ui `Dialog` (`open={!prefs.oculta}`,
  `onOpenChange` closes via `fechar()` → `{ oculta: true, telaCheia: false }`).
  `DialogContent` is a top dropdown with `showCloseButton={false}`,
  `fixed top-20 left-1/2 w-[min(1100px,95vw)] -translate-x-1/2 p-0`, and
  `h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] top-4` when `prefs.telaCheia`.
  Normal state height `min(calc(100dvh - 7rem), 70svh)` (functional viewport
  value). `DialogTitle sr-only`.
- Bar: device presets (`DISPOSITIVOS`, `role="group"`, `aria-pressed`),
  expand toggle (`Maximize2`/`Minimize2`; expanding also sends
  `{ telaCheia: true, largura: null }`), close (`EyeOff`) → `oculta: true`,
  `telaCheia: false`.
- Frame is now a real scroll container: `overflow-hidden` body + inner
  `h-full overflow-y-auto` wrapper, so the `min-h-svh` Storefront scrolls
  inside the frame instead of being clipped.
- Resize moved here: vertical `role="separator"` handle on the frame's right
  edge, `cursor-col-resize`, `w-2` hit area; drag computes
  `resolverLargura(larguraInicial + (clientX - inicio))` (right = wider),
  `larguraInicial = prefs.largura ?? 640`. Hidden while `telaCheia`.
- `useDeferredValue(vitrine)` kept; `paginaId`/`onTrocarPagina` passed to
  `Storefront` (controlled page, no own tabs).
- Removed `useMediaQuery`, `Sheet`/`SheetContent`/`SheetTitle`, `Eye` imports.
  `resolverLargura` and `DISPOSITIVOS` kept.

### `src/components/features/aparencia/vitrine-editor.tsx`

- One `salvar()`: snapshots `revisaoEnviada`, `paginasEnviadas`, `temaEnviado`;
  saves content when `sujeira.conteudo` (returns after setting `erro` on
  failure), then appearance when `sujeira.aparencia`; clears each domain only
  if `revisao.current === revisaoEnviada`; success toast
  `{ title: 'Vitrine publicada', type: 'success' }`. A failure in one domain
  leaves it dirty (the other may have saved).
- Removed `trocarModo`, `restaurarRascunho`, mode-switch `window.confirm`.
  `Tabs onValueChange` simply `setModo(v)`. Drafts for both domains stay alive.
- Removed now-dead `ultimoSalvo` state (was only read by `restaurarRascunho`
  and written by the save functions) to avoid an unused-variable warning.
- Internal-link leave guard kept, confirmation text changed to
  `'Há alterações não salvas. Sair e descartar?'`; on confirm clears dirty
  state (`setSujeira(sujeiraInicial())`). `beforeunload` effect kept.
- `BarraEditor`: single `onSalvar`; new `acoes: ReactNode` slot rendered before
  the publish button; button always labelled "Publicar" (`Spinner` while
  `isSaving`, `disabled`); "Alterações não salvas" badge kept; `modo` prop
  removed.
- Removed the right preview column, `lg:flex-row` row and vertical resize
  handle; the tabbed content panel now fills the width inside the outer height
  container.
- `PreviewPanel` is rendered in the `acoes` slot; it portals to body, so it
  overlays content and reserves no layout space.
- Imports: dropped `ReactPointerEvent` + `resolverLargura`, added `ReactNode`.

### `src/components/features/aparencia/use-editor-preferencias.ts`

- `PADRAO.oculta` set to `true` (preview starts closed). Other fields unchanged.

### `src/components/features/aparencia/use-media-query.ts` — DELETED

Grep confirmed the only consumers were `preview-panel.tsx` (now removed); no
remaining references. File deleted.

## Commands + output

```
npm run typecheck   → exit 0
npm run lint        → 13 problems (0 errors, 13 warnings); all pre-existing
                      (block-form incompat-library + unused vars in produtos/
                      landing/layout). Zero warnings in touched files.
npm test            → 14 files, 98 tests passed
npm run build       → exit 0, all routes compiled
```

## Concerns

- Visual/manual QA was not performed in-browser: `/dashboard/aparencia`
  redirects (307) without auth and no credentials were available. Verified by
  typecheck/lint/tests/build and code review only.
- `ultimoSalvo` was removed as dead code. Behavior is unaffected because the
  editor no longer discards drafts; semantic "last server-confirmed state" is
  no longer needed.
- Panel height uses functional viewport values (`calc(100dvh-2rem)`,
  `min(1100px,95vw)`, `min(calc(100dvh - 7rem), 70svh)`) as permitted for
  overlays.

No files outside the editor scope were touched (`conteudo-panel.tsx`,
`aparencia-panel.tsx`, `block-form.tsx`, `Storefront` public path,
`prisma/schema.prisma`, VOs, QR code) — no prop-type change was forced.
