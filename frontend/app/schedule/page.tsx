import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

const schedule = [
  {
    week: 1,
    date: "Oct 12, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", away: "Islamic Center", field: "Field 1" },
      { time: "9:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Noor", field: "Field 2" },
      { time: "10:30 PM", home: "Islamic Society", away: "Masjid Al-Falah", field: "Field 1" },
    ],
  },
  {
    week: 2,
    date: "Oct 19, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Noor", away: "Masjid Al-Huda", field: "Field 1" },
      { time: "9:30 PM", home: "Islamic Center", away: "Islamic Society", field: "Field 2" },
      { time: "10:30 PM", home: "Masjid Al-Falah", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 3,
    date: "Oct 26, 2025",
    games: [
      { time: "8:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Huda", field: "Field 1" },
      { time: "9:30 PM", home: "Masjid Al-Falah", away: "Masjid Al-Noor", field: "Field 2" },
      { time: "10:30 PM", home: "Islamic Society", away: "Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 4,
    date: "Nov 2, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", away: "Masjid Al-Falah", field: "Field 1" },
      { time: "9:30 PM", home: "Masjid Al-Noor", away: "Islamic Society", field: "Field 2" },
      { time: "10:30 PM", home: "Islamic Center", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 5,
    date: "Nov 9, 2025",
    games: [
      { time: "8:30 PM", home: "Islamic Society", away: "Masjid Al-Huda", field: "Field 1" },
      { time: "9:30 PM", home: "Masjid Al-Falah", away: "Islamic Center", field: "Field 2" },
      { time: "10:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Noor", field: "Field 1" },
    ],
  },
  {
    week: 6,
    date: "Nov 16, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", away: "Brampton Islamic Center", field: "Field 1" },
      { time: "9:30 PM", home: "Masjid Al-Noor", away: "Masjid Al-Falah", field: "Field 2" },
      { time: "10:30 PM", home: "Islamic Center", away: "Islamic Society", field: "Field 1" },
    ],
  },
  {
    week: 7,
    date: "Nov 23, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Falah", away: "Masjid Al-Huda", field: "Field 1" },
      { time: "9:30 PM", home: "Islamic Society", away: "Masjid Al-Noor", field: "Field 2" },
      { time: "10:30 PM", home: "Brampton Islamic Center", away: "Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 8,
    date: "Nov 30, 2025",
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", away: "Islamic Society", field: "Field 1" },
      { time: "9:30 PM", home: "Islamic Center", away: "Masjid Al-Falah", field: "Field 2" },
      { time: "10:30 PM", home: "Masjid Al-Noor", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
]

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Schedule</h1>
          <p className="text-foreground/70 text-lg">Season: Oct 12, 2025 - Feb 15, 2026</p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {schedule.map((week) => (
            <Card key={week.week} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  Week {week.week} - {week.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {week.games.map((game, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 border border-border gap-4 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{game.time}</span>
                        </div>
                        <div className="text-foreground">
                          <span className="font-medium">{game.home}</span>
                          <span className="mx-2 text-foreground/50">vs</span>
                          <span className="font-medium">{game.away}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/70">
                        <MapPin className="h-4 w-4" />
                        <span>{game.field}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-foreground/70">
                <MapPin className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold text-foreground">Save Max Sports Centre</div>
                  <div className="text-sm">1495 Sandalwood Pkwy E, Brampton, ON L6R 0K2</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

