import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Trophy } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0a0e1a] via-[#1a1533] to-[#0a0e1a]">
      {/* Stadium lights effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 opacity-40">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 2000}ms`,
                animationDuration: `${1000 + Math.random() * 2000}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Green field gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-b from-transparent via-[#0d4d2d]/40 to-[#1a7a4a]/30 pointer-events-none" />

      {/* Field lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10 pointer-events-none">
        <div className="absolute bottom-1/2 left-0 right-0 h-px bg-white" />
        <div className="absolute bottom-1/2 left-1/2 w-32 h-32 border border-white rounded-full -translate-x-1/2" />
      </div>

      {/* Player silhouette glow effect */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-[600px] opacity-10 pointer-events-none">
        <div className="w-full h-full bg-cyan-400 rounded-full blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
          {/* Soccer Ball Icon */}
          <div className="mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="white" stroke="none" />
                <g fill="black">
                  <polygon points="50,15 35,25 35,40 50,50 65,40 65,25" />
                  <polygon points="15,35 10,50 20,65 35,60 35,40 20,35" />
                  <polygon points="85,35 80,35 65,40 65,60 80,65 90,50" />
                  <polygon points="35,60 20,65 25,80 50,85 50,70 35,65" />
                  <polygon points="65,60 65,65 50,70 50,85 75,80 80,65" />
                </g>
              </svg>
            </div>
          </div>

          {/* INAUGURAL Badge */}
          <div className="mb-4 md:mb-6">
            <span className="text-foreground/90 text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              INAUGURAL
            </span>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12 md:mb-16 max-w-6xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-3 md:mb-4 leading-[0.9] tracking-tighter text-balance">
              <span className="block text-foreground drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">BRAMPTON</span>
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-3 md:mb-4 leading-[0.9] tracking-tighter text-balance">
              <span className="block text-foreground/95 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                INTRA-MASJID
              </span>
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter text-balance">
              <span className="block text-primary drop-shadow-[0_0_40px_rgba(125,211,252,0.5)]">SOCCER LEAGUE</span>
            </h1>
          </div>

          {/* League Format */}
          <div className="text-center mb-10 md:mb-12 space-y-2 z-10">
            <div className="text-foreground text-xl md:text-3xl font-bold uppercase tracking-wider">
              8 GAME ROUND ROBIN LEAGUE
            </div>
            <div className="text-primary text-xl md:text-3xl font-bold uppercase tracking-wider">WITH PLAYOFFS</div>
          </div>

          {/* CTA Button */}
          <div className="mb-16 md:mb-20 z-10">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base md:text-lg font-bold uppercase tracking-wide px-8 md:px-12 py-6 md:py-7 rounded-full transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Stay Updated
            </Button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl z-10 mb-12">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 p-6 md:p-8 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-primary mb-4" />
              <div className="text-foreground/60 text-xs md:text-sm uppercase tracking-wider mb-2 font-semibold">
                Season
              </div>
              <div className="text-foreground text-lg md:text-xl font-bold">Oct 12, 2025</div>
              <div className="text-foreground text-lg md:text-xl font-bold">Feb 15, 2026</div>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 p-6 md:p-8 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]">
              <Clock className="w-8 h-8 md:w-10 md:h-10 text-primary mb-4" />
              <div className="text-foreground/60 text-xs md:text-sm uppercase tracking-wider mb-2 font-semibold">
                Game Time
              </div>
              <div className="text-foreground text-lg md:text-xl font-bold">Sunday Nights</div>
              <div className="text-foreground text-lg md:text-xl font-bold">8:30 - 11PM</div>
              <div className="text-foreground/50 text-xs md:text-sm italic mt-2">(Some exceptions may apply)</div>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 p-6 md:p-8 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]">
              <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary mb-4" />
              <div className="text-foreground/60 text-xs md:text-sm uppercase tracking-wider mb-2 font-semibold">
                Location
              </div>
              <div className="text-foreground text-base md:text-lg font-bold mb-1">Save Max Sports Centre</div>
              <div className="text-foreground/70 text-sm md:text-base">1495 Sandalwood Pkwy E</div>
              <div className="text-foreground/70 text-sm md:text-base">Brampton, ON L6R 0K2</div>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center z-10">
            <div className="text-foreground/70 text-base md:text-lg font-medium uppercase tracking-wide">
              More Information To Follow
            </div>
          </div>
        </main>

        {/* Stats Section */}
        <section className="relative z-10 bg-black/30 backdrop-blur-sm border-t border-border/30 py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-6 md:gap-12 text-center">
              <div>
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                <div className="text-3xl md:text-5xl font-black text-foreground mb-2">8</div>
                <div className="text-xs md:text-sm uppercase tracking-wide text-foreground/60 font-semibold">
                  Games Per Team
                </div>
              </div>
              <div>
                <Calendar className="w-8 h-8 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                <div className="text-2xl md:text-4xl font-black text-foreground mb-2">Sundays</div>
                <div className="text-xs md:text-sm uppercase tracking-wide text-foreground/60 font-semibold">
                  Game Nights
                </div>
              </div>
              <div>
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                <div className="text-2xl md:text-4xl font-black text-foreground mb-2">2025-26</div>
                <div className="text-xs md:text-sm uppercase tracking-wide text-foreground/60 font-semibold">
                  Season
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-black/40 backdrop-blur-sm border-t border-border/20 py-6 md:py-8 px-4 text-center">
          <div className="text-foreground/50 text-xs md:text-sm">
            © 2025 Brampton Intra-Masjid Soccer League. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
