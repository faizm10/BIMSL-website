"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

type Team = {
  id: string
  name: string
  points: number
  games_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
}

type Game = {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  status: string
  game_date: string
}

type Standing = {
  position: number
  team: string
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
  form: string[]
}

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
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const supabase = createClient()

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('points', { ascending: false })
          .order('goal_difference', { ascending: false })
          .order('goals_for', { ascending: false })

        if (teamsError) throw teamsError

        // Fetch completed games
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .eq('status', 'completed')
          .order('game_date', { ascending: false })
          .order('game_time', { ascending: false })

        if (gamesError) throw gamesError

        // Calculate form for each team (last 5 games)
        const standingsWithForm: Standing[] = (teamsData || []).map((team, index) => {
          const teamGames = (gamesData || [])
            .filter(game => 
              (game.home_team_id === team.id || game.away_team_id === team.id)
            )
            .slice(0, 5) // Last 5 games
            .reverse() // Reverse to show most recent first

          const form = teamGames.map(game => {
            const isHome = game.home_team_id === team.id
            const teamScore = isHome ? game.home_score : game.away_score
            const opponentScore = isHome ? game.away_score : game.home_score

            if (teamScore > opponentScore) return 'W'
            if (teamScore < opponentScore) return 'L'
            return 'D'
          })

          return {
            position: index + 1,
            team: team.name,
            teamId: team.id,
            played: team.games_played,
            won: team.wins,
            drawn: team.draws,
            lost: team.losses,
            goalsFor: team.goals_for,
            goalsAgainst: team.goals_against,
            goalDiff: team.goal_difference,
            points: team.points,
            form: form.length > 0 ? form : []
          }
        })

        setStandings(standingsWithForm)
      } catch (error) {
        console.error('Error fetching standings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground">Loading standings...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            Standings
          </h1>
          <p className="text-foreground/70 text-lg">Current League Table</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">League Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 sm:w-12 text-xs sm:text-sm">Pos</TableHead>
                        <TableHead className="text-xs sm:text-sm min-w-[120px]">Team</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">P</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">W</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">D</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">L</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">GF</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">GA</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">GD</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm font-bold">Pts</TableHead>
                        <TableHead className="text-center text-xs sm:text-sm">Form</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center text-foreground/70 py-8 text-sm">
                            No standings data available yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        standings.map((team) => (
                          <TableRow key={team.teamId} className={team.position <= 4 ? "bg-primary/5" : ""}>
                            <TableCell className="font-bold text-xs sm:text-sm">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {team.position}
                                {team.position <= 4 && <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-xs sm:text-sm">{team.team}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.played}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.won}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.drawn}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.lost}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.goalsFor}</TableCell>
                            <TableCell className="text-center text-xs sm:text-sm">{team.goalsAgainst}</TableCell>
                            <TableCell className={`text-center font-semibold text-xs sm:text-sm ${team.goalDiff > 0 ? "text-green-500" : team.goalDiff < 0 ? "text-red-500" : ""}`}>
                              {team.goalDiff > 0 ? "+" : ""}
                              {team.goalDiff}
                            </TableCell>
                            <TableCell className="text-center font-bold text-sm sm:text-lg">{team.points}</TableCell>
                            <TableCell>
                              <FormIndicator form={team.form} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
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
                    {standings.length === 0 ? (
                      <p className="text-foreground/50">No teams qualified yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {standings.slice(0, 4).map((team) => (
                          <li key={team.teamId} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {team.position}
                            </span>
                            {team.team}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
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
