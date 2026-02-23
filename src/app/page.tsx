// src/app/page.tsx
import Hero from "@/components/homepage/Hero"
import FeaturedProducts from "@/components/homepage/FeaturedProducts"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <FeaturedProducts />
    </main>
  )
}