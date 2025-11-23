"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award, Target } from "lucide-react"

type Player = {
  id: string
  full_name: string
  jersey_number: number | null
  goals: number
  assists: number
  team?: {
    id: string
    name: string
  }
}

export default function LeagueLeadersPage() {
  const [topScorers, setTopScorers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('roster')
          .select(`
            *,
            team:teams(id, name)
          `)
          .order('goals', { ascending: false })
          .limit(10)

        if (error) throw error
        setTopScorers(data || [])
      } catch (error) {
        console.error('Error fetching top scorers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopScorers()
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
          <p className="text-foreground/70 text-lg">Top Scorers This Season</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Top Scorers */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length === 0 ? (
                <div className="text-center text-foreground/70 py-8">
                  No scorers data available yet
                </div>
              ) : (
                <div className="space-y-4">
                  {topScorers.map((player, index) => {
                    const rank = index + 1
                    return (
                      <div
                        key={player.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg ${
                          rank === 1
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted/50 border border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                              rank === 1
                                ? "bg-primary text-primary-foreground"
                                : rank === 2
                                ? "bg-foreground/20 text-foreground"
                                : rank === 3
                                ? "bg-foreground/10 text-foreground"
                                : "bg-card text-foreground/70"
                            }`}
                          >
                            {rank}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground text-sm sm:text-base">
                              {player.full_name}
                              {player.jersey_number && (
                                <span className="ml-2 text-foreground/60 text-xs sm:text-sm">#{player.jersey_number}</span>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-foreground/70 truncate">{player.team?.name || 'Unknown Team'}</div>
                          </div>
                        </div>
                        <div className="text-right sm:text-left flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-bold text-primary">{player.goals}</div>
                          <div className="text-xs text-foreground/50">goals</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
