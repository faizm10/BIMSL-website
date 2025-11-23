import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

const standings = [
  { position: 1, team: "Masjid Al-Huda", played: 7, won: 6, drawn: 1, lost: 0, goalsFor: 24, goalsAgainst: 8, goalDiff: 16, points: 19, form: ["W", "W", "W", "D", "W"] },
  { position: 2, team: "Brampton Islamic Center", played: 7, won: 5, drawn: 1, lost: 1, goalsFor: 20, goalsAgainst: 12, goalDiff: 8, points: 16, form: ["W", "W", "L", "W", "W"] },
  { position: 3, team: "Masjid Al-Noor", played: 7, won: 4, drawn: 2, lost: 1, goalsFor: 18, goalsAgainst: 10, goalDiff: 8, points: 14, form: ["W", "D", "W", "W", "D"] },
  { position: 4, team: "Islamic Center", played: 7, won: 4, drawn: 1, lost: 2, goalsFor: 16, goalsAgainst: 14, goalDiff: 2, points: 13, form: ["W", "L", "W", "W", "L"] },
  { position: 5, team: "Islamic Society", played: 7, won: 2, drawn: 2, lost: 3, goalsFor: 12, goalsAgainst: 15, goalDiff: -3, points: 8, form: ["L", "D", "L", "W", "D"] },
  { position: 6, team: "Masjid Al-Falah", played: 7, won: 0, drawn: 1, lost: 6, goalsFor: 6, goalsAgainst: 31, goalDiff: -25, points: 1, form: ["L", "L", "L", "L", "D"] },
]

function FormIndicator({ form }: { form: string[] }) {
  return (
    <div className="flex gap-1">
      {form.map((result, idx) => {
        const colors = {
          W: "bg-green-500",
          D: "bg-yellow-500",
          L: "bg-red-500",
        }
        return (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full ${colors[result as keyof typeof colors]}`}
            title={result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"}
          />
        )
      })}
    </div>
  )
}

function PositionChange({ position, previousPosition }: { position: number; previousPosition?: number }) {
  if (!previousPosition) return <Minus className="h-4 w-4 text-foreground/30" />
  if (position < previousPosition) return <TrendingUp className="h-4 w-4 text-green-500" />
  if (position > previousPosition) return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-foreground/30" />
}

export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#1a1533] to-[#0a0e1a]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            Standings
          </h1>
          <p className="text-foreground/70 text-lg">Current League Table</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>League Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Pos</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">GF</TableHead>
                      <TableHead className="text-center">GA</TableHead>
                      <TableHead className="text-center">GD</TableHead>
                      <TableHead className="text-center">Pts</TableHead>
                      <TableHead className="text-center">Form</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((team) => (
                      <TableRow key={team.position} className={team.position <= 4 ? "bg-primary/5" : ""}>
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            {team.position}
                            {team.position <= 4 && <Trophy className="h-4 w-4 text-primary" />}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{team.team}</TableCell>
                        <TableCell className="text-center">{team.played}</TableCell>
                        <TableCell className="text-center">{team.won}</TableCell>
                        <TableCell className="text-center">{team.drawn}</TableCell>
                        <TableCell className="text-center">{team.lost}</TableCell>
                        <TableCell className="text-center">{team.goalsFor}</TableCell>
                        <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                        <TableCell className={`text-center font-semibold ${team.goalDiff > 0 ? "text-green-500" : team.goalDiff < 0 ? "text-red-500" : ""}`}>
                          {team.goalDiff > 0 ? "+" : ""}
                          {team.goalDiff}
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                        <TableCell>
                          <FormIndicator form={team.form} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Playoff Qualification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Top 4 teams qualify for playoffs</span>
                  </div>
                  <div className="text-sm text-foreground/70 mt-4">
                    <div className="font-semibold mb-2">Current Qualifiers:</div>
                    <ul className="space-y-1">
                      {standings.slice(0, 4).map((team) => (
                        <li key={team.position} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                            {team.position}
                          </span>
                          {team.team}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="text-foreground/70">Win</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span className="text-foreground/70">Draw</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-foreground/70">Loss</span>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <div className="text-foreground/70">
                      <span className="font-semibold">P:</span> Played | <span className="font-semibold">W:</span> Won | <span className="font-semibold">D:</span> Drawn | <span className="font-semibold">L:</span> Lost
                    </div>
                    <div className="text-foreground/70 mt-1">
                      <span className="font-semibold">GF:</span> Goals For | <span className="font-semibold">GA:</span> Goals Against | <span className="font-semibold">GD:</span> Goal Difference | <span className="font-semibold">Pts:</span> Points
                    </div>
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

