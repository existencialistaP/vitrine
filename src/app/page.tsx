import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const RECURSOS = [
  {
    titulo: "Vitrine personalizável",
    descricao: "Cores, fonte e logotipo com a cara do seu negócio — sem código.",
  },
  {
    titulo: "Pedidos pelo WhatsApp",
    descricao: "Checkout formatado e enviado direto para o seu número.",
  },
  {
    titulo: "Painel do lojista",
    descricao: "Cadastre produtos, preços e categorias em passos simples.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="secondary">Feito para pequenos negócios</Badge>
        <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          Sua loja online em minutos
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Crie uma vitrine digital com a identidade da sua marca e receba pedidos
          direto no WhatsApp. Autonomia total, por um custo acessível.
        </p>
        <div className="flex gap-3">
          <Button size="lg">Criar minha vitrine</Button>
          <Button size="lg" variant="outline">
            Ver exemplo
          </Button>
        </div>
      </div>

      <Separator className="max-w-3xl" />

      <div className="grid max-w-4xl gap-4 sm:grid-cols-3">
        {RECURSOS.map((recurso) => (
          <Card key={recurso.titulo}>
            <CardHeader>
              <CardTitle className="text-base">{recurso.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
