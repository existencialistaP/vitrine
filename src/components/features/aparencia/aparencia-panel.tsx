'use client'

import { useState, type ReactNode } from 'react'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { UploadImagem } from '@/components/patterns/upload-imagem'
import {
  ESTILOS,
  FONTES,
  FORMATOS_CARD,
  LAYOUTS,
  PALETAS,
  obterEstilo,
  obterFonte,
  obterFormatoCard,
  obterLayout,
  obterPaleta,
} from '@/lib/visual'
import { cn } from '@/lib/utils'
import type { TemaView } from '@/app/actions/tema'

import {
  PRESETS_APARENCIA,
  encontrarPreset,
  presetParaTema,
  type TemaSelecao,
} from './aparencia-presets'
import { OptionCard } from './option-card'

function Grupo({
  titulo,
  aberto,
  onAlternar,
  children,
}: {
  titulo: string
  aberto: boolean
  onAlternar: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 rounded-lg p-3 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {titulo}
        <span aria-hidden="true">{aberto ? '−' : '+'}</span>
      </button>
      {aberto && <div className="border-t p-3">{children}</div>}
    </div>
  )
}

export function AparenciaPanel({
  tema,
  onChange,
  modoAvancado,
  onModoAvancadoChange,
}: {
  tema: TemaView
  onChange: (patch: Partial<TemaView>) => void
  modoAvancado: boolean
  onModoAvancadoChange: (ativo: boolean) => void
}) {
  const [aberto, setAberto] = useState<string | null>('cores')

  // Normaliza os ids da view (strings) para as uniões do domínio via catálogos.
  const selecao: TemaSelecao = {
    paleta: obterPaleta(tema.paleta).id,
    estilo: obterEstilo(tema.estilo).id,
    formatoCard: obterFormatoCard(tema.formatoCard).id,
    layout: obterLayout(tema.layout).id,
    fonte: obterFonte(tema.fonte).id,
  }
  const presetAtivo = encontrarPreset(selecao)

  function alternarGrupo(id: string) {
    setAberto((atual) => (atual === id ? null : id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="modo-avancado">Modo avançado</FieldLabel>
        <Switch
          id="modo-avancado"
          checked={modoAvancado}
          onCheckedChange={onModoAvancadoChange}
        />
      </Field>

      {!modoAvancado ? (
        <div className="grid grid-cols-2 gap-3">
          {PRESETS_APARENCIA.map((preset) => {
            const paleta = obterPaleta(preset.tema.paleta)
            return (
              <OptionCard
                key={preset.id}
                selecionado={presetAtivo?.id === preset.id}
                aoSelecionar={() => onChange(presetParaTema(preset) as Partial<TemaView>)}
                label={`Usar tema ${preset.nome}`}
                titulo={preset.nome}
              >
                <span
                  className="h-6 w-full rounded-md border"
                  style={{
                    background: `linear-gradient(135deg, ${paleta.corPrimaria}, ${paleta.corSecundaria})`,
                  }}
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">{preset.descricao}</span>
              </OptionCard>
            )
          })}
        </div>
      ) : (
        <FieldGroup className="gap-3">
          <Grupo
            titulo="Cores"
            aberto={aberto === 'cores'}
            onAlternar={() => alternarGrupo('cores')}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PALETAS.map((p) => (
                <OptionCard
                  key={p.id}
                  selecionado={tema.paleta === p.id}
                  aoSelecionar={() => onChange({ paleta: p.id })}
                  label={`Paleta ${p.nome}`}
                  titulo={p.nome}
                >
                  <span
                    className="flex size-8 items-center rounded-full border"
                    style={{ backgroundColor: p.corFundo }}
                    aria-hidden="true"
                  >
                    <span
                      className="ml-1 size-3.5 rounded-full"
                      style={{ backgroundColor: p.corPrimaria }}
                    />
                    <span
                      className="ml-0.5 size-3.5 rounded-full"
                      style={{ backgroundColor: p.corSecundaria }}
                    />
                  </span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo
            titulo="Estilo dos cards"
            aberto={aberto === 'estilo'}
            onAlternar={() => alternarGrupo('estilo')}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ESTILOS.map((e) => (
                <OptionCard
                  key={e.id}
                  selecionado={tema.estilo === e.id}
                  aoSelecionar={() => onChange({ estilo: e.id })}
                  label={`Estilo ${e.nome}`}
                  titulo={e.nome}
                >
                  <span className="text-xs text-muted-foreground">{e.descricao}</span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo
            titulo="Layout da grade"
            aberto={aberto === 'layout'}
            onAlternar={() => alternarGrupo('layout')}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LAYOUTS.map((l) => (
                <OptionCard
                  key={l.id}
                  selecionado={tema.layout === l.id}
                  aoSelecionar={() => onChange({ layout: l.id })}
                  label={`Layout ${l.nome}`}
                  titulo={l.nome}
                >
                  <span className="text-xs text-muted-foreground">{l.descricao}</span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo
            titulo="Formato do card"
            aberto={aberto === 'formato'}
            onAlternar={() => alternarGrupo('formato')}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FORMATOS_CARD.map((f) => (
                <OptionCard
                  key={f.id}
                  selecionado={tema.formatoCard === f.id}
                  aoSelecionar={() => onChange({ formatoCard: f.id })}
                  label={`Formato ${f.nome}`}
                  titulo={f.nome}
                >
                  <span className={cn('w-10 rounded-md border bg-muted', f.aspecto)} aria-hidden="true" />
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo
            titulo="Tipografia"
            aberto={aberto === 'fonte'}
            onAlternar={() => alternarGrupo('fonte')}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FONTES.map((f) => (
                <OptionCard
                  key={f.id}
                  selecionado={tema.fonte === f.id}
                  aoSelecionar={() => onChange({ fonte: f.id })}
                  label={`Fonte ${f.nome}`}
                  titulo={f.nome}
                >
                  <span className="text-base leading-tight" style={{ fontFamily: f.css }}>
                    Aa
                  </span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo
            titulo="Marca e logo"
            aberto={aberto === 'logo'}
            onAlternar={() => alternarGrupo('logo')}
          >
            <Field>
              <FieldLabel htmlFor="logo-url">Logo</FieldLabel>
              <UploadImagem
                tipo="logo"
                value={tema.logoUrl}
                onChange={(url) => onChange({ logoUrl: url })}
                descricao="Use uma imagem quadrada (ex.: 512x512), até 5 MB."
              />
            </Field>
          </Grupo>
        </FieldGroup>
      )}
    </div>
  )
}
