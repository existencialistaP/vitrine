import { Navbar } from '@/components/landing/navbar'
import { Pricing } from '@/components/landing/pricing'
import { FaqSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="px-4 pt-20 pb-8 text-center sm:pt-28">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Planos e preços
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Comece de graça e evolua conforme seu negócio cresce.
          </p>
        </div>
        <Pricing />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}