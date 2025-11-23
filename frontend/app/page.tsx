"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Clock, Trophy, Users, Shield, Star, Award, Mail } from "lucide-react"
import { Marquee } from "@/components/ui/marquee"
import Image from "next/image"
import Link from "next/link"

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

type GoalScorer = {
  game_id: string
  player_id: string
  player?: {
    id: string
    full_name: string
    team_id: string
  }
}

export default function Home() {
  const [recentScores, setRecentScores] = useState<Game[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [goalScorers, setGoalScorers] = useState<GoalScorer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const supabase = createClient()

        // Fetch recent completed games (exclude unpublished playoff games)
        const { data: completed, error: completedError } = await supabase
          .from('games')
          .select(`
            *,
            home_team:teams!games_home_team_id_fkey(id, name),
            away_team:teams!games_away_team_id_fkey(id, name)
          `)
          .eq('status', 'completed')
          .order('game_date', { ascending: false })
          .order('game_time', { ascending: false })
          .limit(20)

        if (completedError) throw completedError

        // Fetch upcoming games (exclude unpublished playoff games)
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
          .limit(20)

        if (upcomingError) throw upcomingError

        // Filter out unpublished playoff games client-side (works even if columns don't exist yet)
        const filterPlayoffGames = (games: typeof completed) => {
          if (!games) return []
          return games.filter(game => {
            // If is_playoff doesn't exist or is false, include the game
            if (!game.is_playoff || game.is_playoff === false) return true
            // If is_playoff is true, only include if is_published is true
            return game.is_published === true
          })
        }

        const filteredCompleted = filterPlayoffGames(completed || [])
        const filteredUpcoming = filterPlayoffGames(upcoming || [])

        const recentGames = filteredCompleted.slice(0, 6)
        setRecentScores(recentGames)
        setUpcomingGames(filteredUpcoming.slice(0, 6))

        // Fetch goal scorers for recent games
        if (recentGames.length > 0) {
          try {
            const gameIds = recentGames.map(g => g.id)
            const { data: goalsData } = await supabase
              .from('game_goals')
              .select(`
                game_id,
                player_id,
                player:roster(id, full_name, team_id)
              `)
              .eq('event_type', 'goal')
              .in('game_id', gameIds)

            if (goalsData) {
              // Transform the data to match GoalScorer type
              const transformedGoals = goalsData.map((goal: {
                game_id: string
                player_id: string
                player: { id: string; full_name: string; team_id: string } | { id: string; full_name: string; team_id: string }[]
              }) => ({
                game_id: goal.game_id,
                player_id: goal.player_id,
                player: Array.isArray(goal.player) ? goal.player[0] : goal.player
              }))
              setGoalScorers(transformedGoals)
            }
          } catch (error) {
            // Silently fail if game_goals table doesn't exist yet
            console.warn('Could not fetch goal scorers:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
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
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
        <Image
                src="/logo.png"
                alt="BIMSL Logo"
                width={200}
                height={200}
                className="h-32 w-32 md:h-40 md:w-40 object-contain opacity-90"
          priority
        />
            </div>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary font-bold text-sm uppercase tracking-wider rounded-full">
                INAUGURAL SEASON
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 text-foreground">
              Brampton Intra-Masjid
              <br />
              <span className="text-primary">Soccer League</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 mb-8 font-medium px-4">
              Join The Premier Soccer League in Brampton
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 text-xs sm:text-sm md:text-base px-4">
              <div className="flex items-center gap-2 text-foreground/80">
                <Star className="w-5 h-5 text-primary" />
                <span>Quality Turf Fields</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <Shield className="w-5 h-5 text-primary" />
                <span>Certified Officials</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <Clock className="w-5 h-5 text-primary" />
                <span>Prime Game Times</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <Users className="w-5 h-5 text-primary" />
                <span>Matched Skill Levels</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/schedule">View Schedule</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                <Link href="/standings">View Standings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* League Info Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Calendar className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Season Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">Oct 12, 2025</div>
                  <div className="text-foreground/70">to</div>
                  <div className="text-2xl font-bold text-foreground">Feb 15, 2026</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Game Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">Sunday Nights</div>
                  <div className="text-lg text-foreground/70">8:30 PM - 11:00 PM</div>
                  <div className="text-sm text-foreground/50 italic mt-2">(Some exceptions may apply)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-bold text-foreground">Save Max Sports Centre</div>
                  <div className="text-foreground/70">1495 Sandalwood Pkwy E</div>
                  <div className="text-foreground/70">Brampton, ON L6R 0K2</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* League Format */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              8 Game Round Robin League
            </h2>
            <p className="text-2xl text-primary font-bold mb-8">With Playoffs</p>
            <p className="text-lg text-foreground/70 mb-8">
              Each team plays 8 games in a round robin format. The top 6 teams advance to the playoffs 
              to compete for the championship title.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">8</div>
                <div className="text-foreground/70 font-semibold">Games Per Team</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">6</div>
                <div className="text-foreground/70 font-semibold">Participating Teams</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">6</div>
                <div className="text-foreground/70 font-semibold">Playoff Teams</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Scores & Upcoming Games */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Recent Scores */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Recent Scores</h2>
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href="/scores">View All</Link>
                  </Button>
                </div>
                {loading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-foreground/70 py-4">Loading scores...</div>
                    </CardContent>
                  </Card>
                ) : recentScores.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-foreground/70 py-4">No completed games yet</div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {recentScores.map((game) => {
                      // Get goal scorers for this game
                      const gameGoals = goalScorers.filter(g => g.game_id === game.id)
                      const homeScorers = gameGoals
                        .filter(g => g.player?.team_id === game.home_team_id)
                        .reduce((acc, goal) => {
                          if (goal.player) {
                            const existing = acc.find(s => s.player_id === goal.player_id)
                            if (existing) {
                              existing.goals += 1
                            } else {
                              acc.push({
                                player_id: goal.player_id,
                                player_name: goal.player.full_name,
                                goals: 1
                              })
                            }
                          }
                          return acc
                        }, [] as Array<{ player_id: string; player_name: string; goals: number }>)
                      
                      const awayScorers = gameGoals
                        .filter(g => g.player?.team_id === game.away_team_id)
                        .reduce((acc, goal) => {
                          if (goal.player) {
                            const existing = acc.find(s => s.player_id === goal.player_id)
                            if (existing) {
                              existing.goals += 1
                            } else {
                              acc.push({
                                player_id: goal.player_id,
                                player_name: goal.player.full_name,
                                goals: 1
                              })
                            }
                          }
                          return acc
                        }, [] as Array<{ player_id: string; player_name: string; goals: number }>)

                      return (
                        <Card key={game.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-foreground/60">
                                {formatDate(game.game_date)} • Week {game.week}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600 font-semibold">
                                FT
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                              <div className="flex-1 text-right min-w-0">
                                <span className="font-medium text-foreground text-sm sm:text-base truncate block">{game.home_team?.name || 'TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 font-bold text-base sm:text-lg flex-shrink-0">
                                <span className={game.home_score > game.away_score ? "text-primary" : "text-foreground"}>
                                  {game.home_score}
                                </span>
                                <span className="text-foreground/50">-</span>
                                <span className={game.away_score > game.home_score ? "text-primary" : "text-foreground"}>
                                  {game.away_score}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground text-sm sm:text-base truncate block">{game.away_team?.name || 'TBD'}</span>
                              </div>
                            </div>
                            {/* Goal Scorers */}
                            {(homeScorers.length > 0 || awayScorers.length > 0) && (
                              <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
                                {homeScorers.length > 0 && (
                                  <div className="text-xs text-foreground/70">
                                    <span className="font-semibold">{game.home_team?.name || 'Home'}: </span>
                                    {homeScorers
                                      .sort((a, b) => b.goals - a.goals)
                                      .map((scorer, idx) => (
                                        <span key={scorer.player_id}>
                                          {scorer.player_name}
                                          {scorer.goals > 1 && <span className="font-bold"> ({scorer.goals})</span>}
                                          {idx < homeScorers.length - 1 && ', '}
                                        </span>
                                      ))}
                                  </div>
                                )}
                                {awayScorers.length > 0 && (
                                  <div className="text-xs text-foreground/70">
                                    <span className="font-semibold">{game.away_team?.name || 'Away'}: </span>
                                    {awayScorers
                                      .sort((a, b) => b.goals - a.goals)
                                      .map((scorer, idx) => (
                                        <span key={scorer.player_id}>
                                          {scorer.player_name}
                                          {scorer.goals > 1 && <span className="font-bold"> ({scorer.goals})</span>}
                                          {idx < awayScorers.length - 1 && ', '}
                                        </span>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Games */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Upcoming Games</h2>
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href="/schedule">View All</Link>
                  </Button>
                </div>
                {loading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-foreground/70 py-4">Loading schedule...</div>
                    </CardContent>
                  </Card>
                ) : upcomingGames.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-foreground/70 py-4">No upcoming games scheduled</div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {upcomingGames.map((game) => (
                      <Card key={game.id} className="hover:shadow-md transition-shadow border-2 border-primary/20">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-foreground/60">
                              {formatDate(game.game_date)} • {formatTime(game.game_time)} • Week {game.week}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-semibold">
                              {game.status === 'in_progress' ? 'LIVE' : 'Upcoming'}
                            </span>
                          </div>
                          <div className="text-foreground">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className="font-medium text-sm sm:text-base">{game.home_team?.name || 'TBD'}</span>
                              <span className="text-foreground/50 hidden sm:inline">vs</span>
                              <span className="font-medium text-sm sm:text-base">{game.away_team?.name || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-foreground/60 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{game.location}</span>
                            </div>
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
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground">
              About Brampton Intra-Masjid Soccer League
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Top Quality Facilities</h3>
                <p className="text-foreground/70">
                  We play on the best turf fields in the region with dedicated lines, proper goals, and excellent lighting.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">100% Refereed Games</h3>
                <p className="text-foreground/70">
                  All games are officiated by certified match officials ensuring fair play and proper enforcement of rules.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Prime Game Slots</h3>
                <p className="text-foreground/70">
                  Games are scheduled for Sunday evenings between 8:30 PM and 11:00 PM for optimal playing conditions.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">For Players, BY Players</h3>
                <p className="text-foreground/70">
                  Created by footballers who understand what makes a great league experience for all participants.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Matched Skill Levels</h3>
                <p className="text-foreground/70">
                  Teams are organized to ensure competitive balance and exciting matches throughout the season.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Championship Playoffs</h3>
                <p className="text-foreground/70">
                  Top teams compete in playoffs to determine the league champion in an exciting tournament format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-foreground">
              League Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">
                    View the complete game schedule for all 8 weeks of the season.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/schedule">View Schedule</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Standings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">
                    Check current league standings and playoff qualification status.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/standings">View Standings</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    League Leaders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">
                    See top scorers, assist leaders, and most valuable players.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/league-leaders">View Leaders</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 mb-4">
                    Find answers to frequently asked questions about the league.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/faq">View FAQ</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
              Our Sponsors
            </h2>
            <div className="py-8">
              <Marquee
                speed={50}
                gap={48}
                pauseOnTap={true}
                fadeEdges={true}
                className="[&_div]:flex [&_div]:items-center [&_div]:justify-center"
              >
                  <div className="flex items-center justify-center h-24 w-48 mx-4">
                    <Image
                      src="/sponsors/baba.jpeg"
                      alt="Baba Sponsor"
                      width={200}
                      height={100}
                      className="object-contain max-h-24 w-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center h-24 w-48 mx-4">
          <Image
                      src="/sponsors/rahman.jpg"
                      alt="Rahman Sponsor"
                      width={200}
                      height={100}
                      className="object-contain max-h-24 w-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center h-24 w-48 mx-4">
          <Image
                      src="/sponsors/xsmallLogo.png"
                      alt="Logo Sponsor"
                      width={200}
                      height={100}
                      className="object-contain max-h-24 w-auto"
                    />
                  </div>
                  <div className="flex items-center justify-center h-24 w-48 mx-4">
          <Image
                      src="/sponsors/adhan.png"
                      alt="Adhan Sponsor"
                      width={200}
                      height={100}
                      className="object-contain max-h-24 w-auto"
                    />
                  </div>
              </Marquee>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="mb-4">
                <Image
                  src="/logo.png"
                  alt="BIMSL Logo"
                  width={120}
                  height={120}
                  className="h-20 w-20 object-contain opacity-90"
                />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">About Us</h3>
              <p className="text-foreground/70">
                The Brampton Intra-Masjid Soccer League brings together teams from various masjids 
                in Brampton for competitive, community-focused soccer.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Get in Touch</h3>
              <div className="space-y-2 text-foreground/70">
                <Link href="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Contact Us</span>
                </Link>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Save Max Sports Centre</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/schedule" className="block text-foreground/70 hover:text-primary transition-colors">
                  Schedule
                </Link>
                <Link href="/standings" className="block text-foreground/70 hover:text-primary transition-colors">
                  Standings
                </Link>
                <Link href="/scores" className="block text-foreground/70 hover:text-primary transition-colors">
                  Scores
                </Link>
                <Link href="/faq" className="block text-foreground/70 hover:text-primary transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="block text-foreground/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-foreground/50 text-sm">
            © 2025 Brampton Intra-Masjid Soccer League. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
