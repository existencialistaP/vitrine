import { Navbar } from '@/components/landing/navbar'
import { FaqSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="px-4 pt-20 pb-8 text-center sm:pt-28">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Perguntas frequentes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Tire suas dúvidas sobre o Vitrine.
          </p>
        </div>
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}