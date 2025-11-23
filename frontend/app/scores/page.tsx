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

type GameEvent = {
  game_id: string
  player_id: string
  event_type: 'goal' | 'yellow_card' | 'red_card'
  player?: {
    id: string
    full_name: string
    team_id: string
  }
}

export default function ScoresPage() {
  const [completedGames, setCompletedGames] = useState<Game[]>([])
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const supabase = createClient()

        // Fetch completed games with scores (both home_score and away_score must be set)
        // Exclude playoff games unless they're published
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
          .limit(50)

        if (completedError) throw completedError

        // Filter out unpublished playoff games client-side (works even if columns don't exist yet)
        const filteredGames = (completed || []).filter(game => {
          // If is_playoff doesn't exist or is false, include the game
          if (!game.is_playoff || game.is_playoff === false) return true
          // If is_playoff is true, only include if is_published is true
          return game.is_published === true
        })

        const gamesToDisplay = filteredGames.slice(0, 20)
        setCompletedGames(gamesToDisplay)

        // Fetch game events (goals, yellow cards, red cards) for these games
        if (gamesToDisplay.length > 0) {
          try {
            const gameIds = gamesToDisplay.map(g => g.id)
            const { data: eventsData } = await supabase
              .from('game_goals')
              .select(`
                game_id,
                player_id,
                event_type,
                player:roster(id, full_name, team_id)
              `)
              .in('game_id', gameIds)

            if (eventsData) {
              // Transform the data to handle both single objects and arrays
              const transformedEvents = eventsData.map((event: {
                game_id: string
                player_id: string
                event_type: string
                player: { id: string; full_name: string; team_id: string } | { id: string; full_name: string; team_id: string }[]
              }) => ({
                game_id: event.game_id,
                player_id: event.player_id,
                event_type: event.event_type as 'goal' | 'yellow_card' | 'red_card',
                player: Array.isArray(event.player) ? event.player[0] : event.player
              }))
              setGameEvents(transformedEvents)
            }
          } catch (error) {
            // Silently fail if game_goals table doesn't exist yet
            console.warn('Could not fetch game events:', error)
          }
        }
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
          <p className="text-foreground/70 text-lg">Completed Game Results</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Completed Games with Scores */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Game Results</h2>
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
                          {weekGames.map((game) => {
                            // Get events for this game
                            const gameEventsForThisGame = gameEvents.filter(e => e.game_id === game.id)
                            
                            // Group by team and event type
                            const homeGoals = gameEventsForThisGame
                              .filter(e => e.event_type === 'goal' && e.player?.team_id === game.home_team_id)
                              .reduce((acc, event) => {
                                if (event.player) {
                                  const existing = acc.find(s => s.player_id === event.player_id)
                                  if (existing) {
                                    existing.count += 1
                                  } else {
                                    acc.push({
                                      player_id: event.player_id,
                                      player_name: event.player.full_name,
                                      count: 1
                                    })
                                  }
                                }
                                return acc
                              }, [] as Array<{ player_id: string; player_name: string; count: number }>)

                            const awayGoals = gameEventsForThisGame
                              .filter(e => e.event_type === 'goal' && e.player?.team_id === game.away_team_id)
                              .reduce((acc, event) => {
                                if (event.player) {
                                  const existing = acc.find(s => s.player_id === event.player_id)
                                  if (existing) {
                                    existing.count += 1
                                  } else {
                                    acc.push({
                                      player_id: event.player_id,
                                      player_name: event.player.full_name,
                                      count: 1
                                    })
                                  }
                                }
                                return acc
                              }, [] as Array<{ player_id: string; player_name: string; count: number }>)

                            const homeYellowCards = gameEventsForThisGame
                              .filter(e => e.event_type === 'yellow_card' && e.player?.team_id === game.home_team_id)
                              .map(e => e.player?.full_name).filter(Boolean) as string[]

                            const awayYellowCards = gameEventsForThisGame
                              .filter(e => e.event_type === 'yellow_card' && e.player?.team_id === game.away_team_id)
                              .map(e => e.player?.full_name).filter(Boolean) as string[]

                            const homeRedCards = gameEventsForThisGame
                              .filter(e => e.event_type === 'red_card' && e.player?.team_id === game.home_team_id)
                              .map(e => e.player?.full_name).filter(Boolean) as string[]

                            const awayRedCards = gameEventsForThisGame
                              .filter(e => e.event_type === 'red_card' && e.player?.team_id === game.away_team_id)
                              .map(e => e.player?.full_name).filter(Boolean) as string[]

                            return (
                              <div
                                key={game.id}
                                className="flex flex-col p-4 rounded-lg bg-card/30 border border-border/30 gap-4"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    <div className="flex items-center gap-2 sm:gap-3 text-foreground mb-2">
                                      <div className="flex-1 text-right min-w-0">
                                        <span className="font-medium text-sm sm:text-base truncate block">{game.home_team?.name || 'TBD'}</span>
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2 font-bold text-lg sm:text-xl flex-shrink-0">
                                        <span className={game.home_score > game.away_score ? "text-primary" : ""}>
                                          {game.home_score}
                                        </span>
                                        <span className="text-foreground/50">-</span>
                                        <span className={game.away_score > game.home_score ? "text-primary" : ""}>
                                          {game.away_score}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="font-medium text-sm sm:text-base truncate block">{game.away_team?.name || 'TBD'}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground/70 text-sm">
                                      <MapPin className="h-3 w-3" />
                                      <span>{game.location}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Goal Scorers and Cards */}
                                {(homeGoals.length > 0 || awayGoals.length > 0 || homeYellowCards.length > 0 || awayYellowCards.length > 0 || homeRedCards.length > 0 || awayRedCards.length > 0) && (
                                  <div className="mt-2 pt-3 border-t border-border/50 space-y-2">
                                    {/* Home Team Stats */}
                                    {(homeGoals.length > 0 || homeYellowCards.length > 0 || homeRedCards.length > 0) && (
                                      <div className="text-xs text-foreground/70">
                                        <span className="font-semibold text-foreground">{game.home_team?.name || 'Home'}: </span>
                                        {homeGoals.length > 0 && (
                                          <span>
                                            Goals: {homeGoals
                                              .sort((a, b) => b.count - a.count)
                                              .map((scorer, idx) => (
                                                <span key={scorer.player_id}>
                                                  {scorer.player_name}
                                                  {scorer.count > 1 && <span className="font-bold"> ({scorer.count})</span>}
                                                  {idx < homeGoals.length - 1 && ', '}
                                                </span>
                                              ))}
                                          </span>
                                        )}
                                        {homeYellowCards.length > 0 && (
                                          <span className="ml-2">
                                            <span className="inline-block w-2 h-2 rounded bg-yellow-500 mr-1"></span>
                                            Yellow: {homeYellowCards.join(', ')}
                                          </span>
                                        )}
                                        {homeRedCards.length > 0 && (
                                          <span className="ml-2">
                                            <span className="inline-block w-2 h-2 rounded bg-red-500 mr-1"></span>
                                            Red: {homeRedCards.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Away Team Stats */}
                                    {(awayGoals.length > 0 || awayYellowCards.length > 0 || awayRedCards.length > 0) && (
                                      <div className="text-xs text-foreground/70">
                                        <span className="font-semibold text-foreground">{game.away_team?.name || 'Away'}: </span>
                                        {awayGoals.length > 0 && (
                                          <span>
                                            Goals: {awayGoals
                                              .sort((a, b) => b.count - a.count)
                                              .map((scorer, idx) => (
                                                <span key={scorer.player_id}>
                                                  {scorer.player_name}
                                                  {scorer.count > 1 && <span className="font-bold"> ({scorer.count})</span>}
                                                  {idx < awayGoals.length - 1 && ', '}
                                                </span>
                                              ))}
                                          </span>
                                        )}
                                        {awayYellowCards.length > 0 && (
                                          <span className="ml-2">
                                            <span className="inline-block w-2 h-2 rounded bg-yellow-500 mr-1"></span>
                                            Yellow: {awayYellowCards.join(', ')}
                                          </span>
                                        )}
                                        {awayRedCards.length > 0 && (
                                          <span className="ml-2">
                                            <span className="inline-block w-2 h-2 rounded bg-red-500 mr-1"></span>
                                            Red: {awayRedCards.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
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
