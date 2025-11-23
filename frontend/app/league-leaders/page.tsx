"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Trophy, Users, AlertTriangle } from "lucide-react"

type Player = {
  id: string
  full_name: string
  jersey_number: number | null
  goals: number
  yellow_cards: number
  red_cards: number
  team_id: string
  team?: {
    id: string
    name: string
  }
}

type Team = {
  id: string
  name: string
}

export default function LeagueLeadersPage() {
  const [roster, setRoster] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('name', { ascending: true })

        if (teamsError) throw teamsError
        setTeams(teamsData || [])

        // Fetch roster with team info
        const { data: rosterData, error: rosterError } = await supabase
          .from('roster')
          .select(`
            *,
            team:teams(id, name)
          `)
          .order('goals', { ascending: false })

        if (rosterError) throw rosterError
        setRoster(rosterData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground">Loading league leaders...</div>
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
            <Award className="h-10 w-10 text-primary" />
            League Leaders
          </h1>
          <p className="text-foreground/70 text-lg">Top Scorers and Statistics</p>
        </div>

        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Overall Top Scorers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Overall Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Goals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster
                      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                      .slice(0, 20)
                      .map((player, index) => {
                        const team = teams.find(t => t.id === player.team_id)
                        return (
                          <TableRow key={player.id} className={index < 3 ? "bg-primary/5" : ""}>
                            <TableCell className="font-bold">
                              <div className="flex items-center gap-2">
                                {index + 1}
                                {index < 3 && <Trophy className="h-4 w-4 text-primary" />}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {player.full_name}
                              {player.jersey_number && <span className="text-foreground/50 ml-2">#{player.jersey_number}</span>}
                            </TableCell>
                            <TableCell>{team?.name || player.team?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-center font-bold text-lg">{player.goals || 0}</TableCell>
                          </TableRow>
                        )
                      })}
                    {roster.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-foreground/50 py-4">
                          No scorers data available yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Scorers Per Team */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamPlayers = roster
                .filter(p => p.team_id === team.id)
                .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                .slice(0, 5)

              if (teamPlayers.length === 0) return null

              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      {team.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teamPlayers.map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-bold text-primary w-6">{index + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {player.full_name}
                                {player.jersey_number && <span className="text-foreground/50 ml-1">#{player.jersey_number}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-2">
                            <div className="text-center">
                              <div className="text-xs text-foreground/50">Goals</div>
                              <div className="font-bold text-primary">{player.goals || 0}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Discipline Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Discipline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Yellow Cards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-yellow-500"></span>
                    Yellow Cards
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Cards</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roster
                          .filter(p => (p.yellow_cards || 0) > 0)
                          .sort((a, b) => (b.yellow_cards || 0) - (a.yellow_cards || 0))
                          .slice(0, 10)
                          .map((player) => {
                            const team = teams.find(t => t.id === player.team_id)
                            return (
                              <TableRow key={player.id}>
                                <TableCell className="font-semibold">
                                  {player.full_name}
                                  {player.jersey_number && <span className="text-foreground/50 ml-2">#{player.jersey_number}</span>}
                                </TableCell>
                                <TableCell>{team?.name || player.team?.name || 'Unknown'}</TableCell>
                                <TableCell className="text-center font-bold text-yellow-600">
                                  {player.yellow_cards || 0}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        {roster.filter(p => (p.yellow_cards || 0) > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-foreground/50 py-4">
                              No yellow cards recorded
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Red Cards */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-red-500"></span>
                    Red Cards
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Cards</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roster
                          .filter(p => (p.red_cards || 0) > 0)
                          .sort((a, b) => (b.red_cards || 0) - (a.red_cards || 0))
                          .slice(0, 10)
                          .map((player) => {
                            const team = teams.find(t => t.id === player.team_id)
                            return (
                              <TableRow key={player.id}>
                                <TableCell className="font-semibold">
                                  {player.full_name}
                                  {player.jersey_number && <span className="text-foreground/50 ml-2">#{player.jersey_number}</span>}
                                </TableCell>
                                <TableCell>{team?.name || player.team?.name || 'Unknown'}</TableCell>
                                <TableCell className="text-center font-bold text-red-600">
                                  {player.red_cards || 0}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        {roster.filter(p => (p.red_cards || 0) > 0).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-foreground/50 py-4">
                              No red cards recorded
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
