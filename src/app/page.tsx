import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { CtaSection } from '@/components/landing/cta-section'
import { FaqSection } from '@/components/landing/faq-section'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}