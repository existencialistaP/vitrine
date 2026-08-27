'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

import { uploadImagemAction } from '@/app/actions/imagens'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function UploadImagem({
  value,
  onChange,
  tipo,
  label = 'Enviar imagem',
  descricao,
}: {
  value: string | null
  onChange: (url: string | null) => void
  tipo: 'produto' | 'logo'
  label?: string
  descricao?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function lidarComArquivo(arquivo: File | undefined) {
    if (!arquivo) return
    setError(null)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.set('tipo', tipo)
      formData.set('arquivo', arquivo)
      const resultado = await uploadImagemAction(formData)
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      onChange(resultado.url)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Prévia"
            className={
              tipo === 'logo'
                ? 'size-14 rounded-full border border-border object-cover'
                : 'h-16 w-20 rounded-lg border border-border object-cover'
            }
          />
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Spinner data-icon="inline-start" /> : <ImagePlus data-icon="inline-start" />}
              Trocar imagem
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X data-icon="inline-start" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Spinner data-icon="inline-start" /> : <ImagePlus data-icon="inline-start" />}
          {isUploading ? 'Enviando...' : label}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label={label}
        onChange={(evento) => evento.target.files?.[0] && lidarComArquivo(evento.target.files[0])}
      />
      {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
