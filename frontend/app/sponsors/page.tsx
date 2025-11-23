import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SponsorsPage() {
  const sponsors = [
    {
      name: "Adhan",
      image: "/sponsors/adhan.png",
      alt: "Adhan Sponsor",
      href: "https://myadhanclock.com/" // Update with actual URL
    },
    {
      name: "Baba",
      image: "/sponsors/baba.jpeg",
      alt: "Baba Sponsor",
      href: "https://babaspizzaandwings.ca/" // Update with actual URL
    },
    {
      name: "Rahman",
      image: "/sponsors/rahman.jpg",
      alt: "Rahman Sponsor",
      href: "http://rahmanmotors.com/" // Update with actual URL
    },
    {
      name: "BIMSL",
      image: "/sponsors/mathabah.png",
      alt: "Mathabah Sponsor",
      href: "https://www.mathabah.org/" // Links back to homepage
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Our Sponsors</h1>
            <p className="text-foreground/70 text-lg">
              Thank you to our generous sponsors who make this league possible
            </p>
          </div>
        </div>

        {/* Sponsors Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {sponsors.map((sponsor, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 md:p-8">
                  <Link 
                    href={sponsor.href} 
                    target={sponsor.href.startsWith('http') ? '_blank' : '_self'}
                    rel={sponsor.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center justify-center min-h-[200px] hover:opacity-80 transition-opacity"
                  >
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={sponsor.image}
                        alt={sponsor.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mt-4">
                      {sponsor.name}
                    </h3>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Interested in Sponsoring?
              </h3>
              <p className="text-foreground/70 mb-6">
                Support the Brampton Intra-Masjid Soccer League and reach our community of players and fans.
              </p>
              <Link href="/contact">
                <Button size="lg">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


