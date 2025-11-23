"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

type Game = {
  id: string
  match_id: string | null
  week: number
  game_date: string
  game_time: string
  location: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  status: string
  home_team?: { id: string; name: string }
  away_team?: { id: string; name: string }
}

export default function ScoresPage() {
  const [completedGames, setCompletedGames] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const supabase = createClient()

        // Fetch completed games with scores (both home_score and away_score must be set)
        const { data: completed, error: completedError } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!games_home_team_id_fkey(id, name),
            away_team:teams!games_away_team_id_fkey(id, name)
          `)
          .eq('status', 'completed')
          .not('home_score', 'is', null)
          .not('away_score', 'is', null)
          .order('game_date', { ascending: false })
          .order('game_time', { ascending: false })
          .limit(20)

        if (completedError) throw completedError

        // Fetch upcoming games
        const { data: upcoming, error: upcomingError } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!games_home_team_id_fkey(id, name),
            away_team:teams!games_away_team_id_fkey(id, name)
          `)
          .in('status', ['scheduled', 'in_progress'])
          .order('game_date', { ascending: true })
          .order('game_time', { ascending: true })
          .limit(10)

        if (upcomingError) throw upcomingError

        setCompletedGames(completed || [])
        setUpcomingGames(upcoming || [])
      } catch (error) {
        console.error('Error fetching scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [])

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return time
    }
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return date
    }
  }

  // Group games by week
  const groupGamesByWeek = (games: Game[]) => {
    return games.reduce((acc, game) => {
      if (!acc[game.week]) {
        acc[game.week] = []
      }
      acc[game.week].push(game)
      return acc
    }, {} as Record<number, Game[]>)
  }

  const upcomingByWeek = groupGamesByWeek(upcomingGames)
  const completedByWeek = groupGamesByWeek(completedGames)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground">Loading scores...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Scores</h1>
          <p className="text-foreground/70 text-lg">Match Results & Upcoming Games</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Upcoming Games */}
          {Object.keys(upcomingByWeek).length > 0 && (
            <>
              {Object.entries(upcomingByWeek)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([week, weekGames]) => (
                  <Card key={week} className="border-2 border-primary/30 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Calendar className="h-6 w-6 text-primary" />
                        Upcoming - Week {week} - {weekGames[0]?.game_date ? formatDate(weekGames[0].game_date) : ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weekGames.map((game) => (
                          <div
                            key={game.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 border border-border gap-4 hover:bg-muted transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm text-foreground/70">{formatDate(game.game_date)}</span>
                                <Clock className="h-4 w-4 text-primary ml-2" />
                                <span className="font-semibold text-foreground">{formatTime(game.game_time)}</span>
                                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-semibold">
                                  {game.status === 'in_progress' ? 'LIVE' : 'Upcoming'}
                                </span>
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">{game.home_team?.name || 'TBD'}</span>
                                <span className="mx-2 text-foreground/50">vs</span>
                                <span className="font-medium">{game.away_team?.name || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-foreground/70 text-sm mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{game.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </>
          )}

          {/* Recent Scores */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Results</h2>
            {Object.keys(completedByWeek).length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-foreground/70 py-8">
                    No completed games yet
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(completedByWeek)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([week, weekGames]) => (
                    <Card key={week} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          Week {week} - {weekGames[0]?.game_date ? formatDate(weekGames[0].game_date) : ''}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {weekGames.map((game) => (
                            <div
                              key={game.id}
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-card/30 border border-border/30 gap-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-foreground/70">{formatDate(game.game_date)}</span>
                                  <Clock className="h-4 w-4 text-primary ml-2" />
                                  <span className="font-semibold text-foreground">{formatTime(game.game_time)}</span>
                                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-semibold">
                                    FT
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-foreground">
                                  <div className="flex-1 text-right">
                                    <span className="font-medium">{game.home_team?.name || 'TBD'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-bold text-xl">
                                    <span className={game.home_score > game.away_score ? "text-primary" : ""}>
                                      {game.home_score}
                                    </span>
                                    <span className="text-foreground/50">-</span>
                                    <span className={game.away_score > game.home_score ? "text-primary" : ""}>
                                      {game.away_score}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium">{game.away_team?.name || 'TBD'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/70 text-sm mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{game.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
