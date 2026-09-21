import QRCode from "qrcode"
import { Download, ExternalLink } from "lucide-react"

import { ErrorState } from "@/components/patterns/error-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/layout/page-header"
import { requireMinhaLoja } from "@/lib/loja"
import { getVitrineUrl } from "@/lib/vitrine-url"

const QR_SIZE = 1024
const QR_MARGIN = 3

export default async function QrCodePage() {
  const loja = await requireMinhaLoja()
  const slug = loja.getSlug().getValue()
  const url = await getVitrineUrl(slug)

  if (!url) {
    return (
      <ErrorState
        title="Não foi possível montar o endereço da vitrine"
        description="Não encontramos o host da requisição para gerar o QR Code. Tente recarregar a página."
      />
    )
  }

  const qrCode = await QRCode.toDataURL(url, {
    width: QR_SIZE,
    margin: QR_MARGIN,
  })

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>QR Code da vitrine</PageHeaderTitle>
          <PageHeaderDescription>
            Baixe a imagem, imprima e coloque no balcão. Clientes escaneiam e
            acessam sua loja na hora.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="items-center pb-4 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            QR Code para {loja.getNome().getValue()}
          </CardTitle>
          <CardDescription>
            Aponte a câmera do celular para acessar a vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* A imagem já inclui o fundo branco e a margem de leitura (quiet zone). */}
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL do QR, não otimizável pelo next/image */}
          <img
            src={qrCode}
            alt={`QR Code com o link da vitrine ${url}`}
            className="size-56 rounded-lg border sm:size-64"
          />

          <div className="flex min-w-0 flex-col items-center gap-4">
            <p className="w-full truncate rounded-lg border bg-muted/30 px-3 py-2 text-center font-mono text-sm text-muted-foreground">
              {url}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                render={
                  <a
                    href={qrCode}
                    download={`qr-code-${slug}.png`}
                  />
                }
              >
                <Download data-icon="inline-start" />
                Baixar imagem
              </Button>
              <Button
                variant="outline"
                render={
                  <a href={`/${slug}`} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink data-icon="inline-start" />
                Abrir vitrine
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
