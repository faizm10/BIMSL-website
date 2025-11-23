import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

const recentScores = [
  {
    date: "Nov 23, 2025",
    week: 7,
    games: [
      { time: "8:30 PM", home: "Masjid Al-Falah", homeScore: 0, away: "Masjid Al-Huda", awayScore: 4, status: "FT" },
      { time: "9:30 PM", home: "Islamic Society", homeScore: 2, away: "Masjid Al-Noor", awayScore: 2, status: "FT" },
      { time: "10:30 PM", home: "Brampton Islamic Center", homeScore: 3, away: "Islamic Center", awayScore: 1, status: "FT" },
    ],
  },
  {
    date: "Nov 16, 2025",
    week: 6,
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", homeScore: 3, away: "Brampton Islamic Center", awayScore: 1, status: "FT" },
      { time: "9:30 PM", home: "Masjid Al-Noor", homeScore: 2, away: "Masjid Al-Falah", awayScore: 0, status: "FT" },
      { time: "10:30 PM", home: "Islamic Center", homeScore: 1, away: "Islamic Society", awayScore: 1, status: "FT" },
    ],
  },
  {
    date: "Nov 9, 2025",
    week: 5,
    games: [
      { time: "8:30 PM", home: "Islamic Society", homeScore: 1, away: "Masjid Al-Huda", awayScore: 3, status: "FT" },
      { time: "9:30 PM", home: "Masjid Al-Falah", homeScore: 0, away: "Islamic Center", awayScore: 2, status: "FT" },
      { time: "10:30 PM", home: "Brampton Islamic Center", homeScore: 2, away: "Masjid Al-Noor", awayScore: 2, status: "FT" },
    ],
  },
  {
    date: "Nov 2, 2025",
    week: 4,
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", homeScore: 2, away: "Masjid Al-Falah", awayScore: 0, status: "FT" },
      { time: "9:30 PM", home: "Masjid Al-Noor", homeScore: 3, away: "Islamic Society", awayScore: 1, status: "FT" },
      { time: "10:30 PM", home: "Islamic Center", homeScore: 2, away: "Brampton Islamic Center", awayScore: 3, status: "FT" },
    ],
  },
]

const upcomingGames = [
  {
    date: "Nov 30, 2025",
    week: 8,
    games: [
      { time: "8:30 PM", home: "Masjid Al-Huda", away: "Islamic Society", status: "Upcoming" },
      { time: "9:30 PM", home: "Islamic Center", away: "Masjid Al-Falah", status: "Upcoming" },
      { time: "10:30 PM", home: "Masjid Al-Noor", away: "Brampton Islamic Center", status: "Upcoming" },
    ],
  },
]

export default function ScoresPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Scores</h1>
          <p className="text-foreground/70 text-lg">Match Results & Upcoming Games</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Upcoming Games */}
          {upcomingGames.map((week) => (
            <Card key={week.week} className="border-2 border-primary/30 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="h-6 w-6 text-primary" />
                  Upcoming - Week {week.week} - {week.date}
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
                          <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-semibold">
                            {game.status}
                          </span>
                        </div>
                        <div className="text-foreground">
                          <span className="font-medium">{game.home}</span>
                          <span className="mx-2 text-foreground/50">vs</span>
                          <span className="font-medium">{game.away}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Recent Scores */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Results</h2>
            <div className="space-y-6">
              {recentScores.map((week) => (
                <Card key={week.week} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Week {week.week} - {week.date}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {week.games.map((game, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-card/30 border border-border/30 gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-foreground">{game.time}</span>
                              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-semibold">
                                {game.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-foreground">
                              <div className="flex-1 text-right">
                                <span className="font-medium">{game.home}</span>
                              </div>
                              <div className="flex items-center gap-2 font-bold text-xl">
                                <span className={game.homeScore > game.awayScore ? "text-primary" : ""}>
                                  {game.homeScore}
                                </span>
                                <span className="text-foreground/50">-</span>
                                <span className={game.awayScore > game.homeScore ? "text-primary" : ""}>
                                  {game.awayScore}
                                </span>
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{game.away}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

