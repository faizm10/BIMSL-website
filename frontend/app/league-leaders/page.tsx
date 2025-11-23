import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award, Target, Zap } from "lucide-react"

const topScorers = [
  { rank: 1, name: "Ahmed Hassan", team: "Masjid Al-Huda", goals: 12, assists: 4 },
  { rank: 2, name: "Mohammed Ali", team: "Brampton Islamic Center", goals: 10, assists: 6 },
  { rank: 3, name: "Omar Khan", team: "Masjid Al-Noor", goals: 9, assists: 3 },
  { rank: 4, name: "Yusuf Ahmed", team: "Islamic Center", goals: 8, assists: 5 },
  { rank: 5, name: "Ibrahim Malik", team: "Masjid Al-Huda", goals: 7, assists: 4 },
]

const topAssists = [
  { rank: 1, name: "Mohammed Ali", team: "Brampton Islamic Center", assists: 6, goals: 10 },
  { rank: 2, name: "Yusuf Ahmed", team: "Islamic Center", assists: 5, goals: 8 },
  { rank: 3, name: "Ahmed Hassan", team: "Masjid Al-Huda", assists: 4, goals: 12 },
  { rank: 4, name: "Ibrahim Malik", team: "Masjid Al-Huda", assists: 4, goals: 7 },
  { rank: 5, name: "Hassan Rahman", team: "Masjid Al-Noor", assists: 3, goals: 5 },
]

const cleanSheets = [
  { rank: 1, name: "Ali Raza", team: "Masjid Al-Huda", cleanSheets: 5 },
  { rank: 2, name: "Mohammed Shah", team: "Brampton Islamic Center", cleanSheets: 4 },
  { rank: 3, name: "Ahmed Khan", team: "Masjid Al-Noor", cleanSheets: 3 },
  { rank: 4, name: "Omar Ali", team: "Islamic Center", cleanSheets: 2 },
  { rank: 5, name: "Hassan Malik", team: "Islamic Society", cleanSheets: 2 },
]

const mostValuable = [
  { rank: 1, name: "Ahmed Hassan", team: "Masjid Al-Huda", points: 16, goals: 12, assists: 4 },
  { rank: 2, name: "Mohammed Ali", team: "Brampton Islamic Center", points: 16, goals: 10, assists: 6 },
  { rank: 3, name: "Omar Khan", team: "Masjid Al-Noor", points: 12, goals: 9, assists: 3 },
  { rank: 4, name: "Yusuf Ahmed", team: "Islamic Center", points: 13, goals: 8, assists: 5 },
  { rank: 5, name: "Ibrahim Malik", team: "Masjid Al-Huda", points: 11, goals: 7, assists: 4 },
]

export default function LeagueLeadersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1533] to-[#0a0e1a]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2 flex items-center justify-center gap-3">
            <Award className="h-10 w-10 text-primary" />
            League Leaders
          </h1>
          <p className="text-foreground/70 text-lg">Top Performers This Season</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Top Scorers */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topScorers.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank === 1
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card/30 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-primary text-primary-foreground"
                            : player.rank === 2
                            ? "bg-foreground/20 text-foreground"
                            : player.rank === 3
                            ? "bg-foreground/10 text-foreground"
                            : "bg-card text-foreground/70"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-foreground/70">{player.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.goals}</div>
                      <div className="text-xs text-foreground/50">goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Assists */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Top Assists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAssists.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank === 1
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card/30 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-primary text-primary-foreground"
                            : player.rank === 2
                            ? "bg-foreground/20 text-foreground"
                            : player.rank === 3
                            ? "bg-foreground/10 text-foreground"
                            : "bg-card text-foreground/70"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-foreground/70">{player.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.assists}</div>
                      <div className="text-xs text-foreground/50">assists</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clean Sheets */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Clean Sheets (Goalkeepers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cleanSheets.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank === 1
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card/30 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-primary text-primary-foreground"
                            : player.rank === 2
                            ? "bg-foreground/20 text-foreground"
                            : player.rank === 3
                            ? "bg-foreground/10 text-foreground"
                            : "bg-card text-foreground/70"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-foreground/70">{player.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.cleanSheets}</div>
                      <div className="text-xs text-foreground/50">clean sheets</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Valuable Players */}
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Most Valuable Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostValuable.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      player.rank === 1
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-card/30 border border-border/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-primary text-primary-foreground"
                            : player.rank === 2
                            ? "bg-foreground/20 text-foreground"
                            : player.rank === 3
                            ? "bg-foreground/10 text-foreground"
                            : "bg-card text-foreground/70"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-foreground/70">{player.team}</div>
                        <div className="text-xs text-foreground/50 mt-1">
                          {player.goals}G {player.assists}A
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.points}</div>
                      <div className="text-xs text-foreground/50">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

