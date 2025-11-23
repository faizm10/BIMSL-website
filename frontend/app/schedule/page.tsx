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
  status: string
  home_team?: { id: string; name: string }
  away_team?: { id: string; name: string }
}

export default function SchedulePage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!games_home_team_id_fkey(id, name),
            away_team:teams!games_away_team_id_fkey(id, name)
          `)
          .order('week', { ascending: true })
          .order('game_date', { ascending: true })
          .order('game_time', { ascending: true })

        if (error) throw error
        setGames(data || [])
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  // Group games by week
  const gamesByWeek = games.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = []
    }
    acc[game.week].push(game)
    return acc
  }, {} as Record<number, Game[]>)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-foreground">Loading schedule...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Schedule</h1>
          <p className="text-foreground/70 text-lg">Season: Oct 12, 2025 - Feb 15, 2026</p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {Object.keys(gamesByWeek).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-foreground/70 py-8">
                  No schedule available yet
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(gamesByWeek)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([week, weekGames]) => (
                <Card key={week} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Calendar className="h-6 w-6 text-primary" />
                      Week {week} - {weekGames[0]?.game_date ? formatDate(weekGames[0].game_date) : ''}
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
                            </div>
                            <div className="text-foreground">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                <span className="font-medium text-sm sm:text-base">{game.home_team?.name || 'TBD'}</span>
                                <span className="text-foreground/50 hidden sm:inline">vs</span>
                                <span className="font-medium text-sm sm:text-base">{game.away_team?.name || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-foreground/70">
                            <MapPin className="h-4 w-4" />
                            <span>{game.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
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
