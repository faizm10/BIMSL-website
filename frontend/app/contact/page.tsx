import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Phone, Instagram } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-foreground/70 text-lg">Get in touch with the Brampton Intra-Masjid Soccer League</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-bold text-foreground">Save Max Sports Centre</div>
                  <div className="text-foreground/70">1495 Sandalwood Pkwy E</div>
                  <div className="text-foreground/70">Brampton, ON L6R 0K2</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-foreground/70">For inquiries and information:</div>
                  <div className="text-foreground">
                    <a 
                      href="mailto:info@bimsl.ca" 
                      className="text-primary hover:underline font-medium"
                    >
                      info@bimsl.ca
                    </a>
                  </div>
                  <div className="text-sm text-foreground/50 mt-4">
                    More contact information will be available soon.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-foreground/70">Contact us by phone:</div>
                  <div className="text-foreground">
                    <a 
                      href="tel:+1234567890" 
                      className="text-primary hover:underline font-medium"
                    >
                      (123) 456-7890
                    </a>
                  </div>
                  <div className="text-sm text-foreground/50 mt-4">
                    Phone number will be updated soon.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-primary" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-foreground/70 mb-2">Follow us on Instagram:</div>
                    <a
                      href="https://www.instagram.com/bram.imsl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Instagram className="h-5 w-5" />
                      @bram.imsl
                    </a>
                  </div>
                  <div className="text-sm text-foreground/50">
                    Stay updated with the latest league news, scores, and highlights.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

