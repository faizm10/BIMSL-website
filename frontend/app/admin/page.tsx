"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/logout-button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schedule = [
  {
    week: 1,
    date: "Oct 12, 2025",
    games: [
      { id: 1, time: "8:30 PM", home: "Masjid Al-Huda", away: "Islamic Center", field: "Field 1" },
      { id: 2, time: "9:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Noor", field: "Field 2" },
      { id: 3, time: "10:30 PM", home: "Islamic Society", away: "Masjid Al-Falah", field: "Field 1" },
    ],
  },
  {
    week: 2,
    date: "Oct 19, 2025",
    games: [
      { id: 4, time: "8:30 PM", home: "Masjid Al-Noor", away: "Masjid Al-Huda", field: "Field 1" },
      { id: 5, time: "9:30 PM", home: "Islamic Center", away: "Islamic Society", field: "Field 2" },
      { id: 6, time: "10:30 PM", home: "Masjid Al-Falah", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 3,
    date: "Oct 26, 2025",
    games: [
      { id: 7, time: "8:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Huda", field: "Field 1" },
      { id: 8, time: "9:30 PM", home: "Masjid Al-Falah", away: "Masjid Al-Noor", field: "Field 2" },
      { id: 9, time: "10:30 PM", home: "Islamic Society", away: "Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 4,
    date: "Nov 2, 2025",
    games: [
      { id: 10, time: "8:30 PM", home: "Masjid Al-Huda", away: "Masjid Al-Falah", field: "Field 1" },
      { id: 11, time: "9:30 PM", home: "Masjid Al-Noor", away: "Islamic Society", field: "Field 2" },
      { id: 12, time: "10:30 PM", home: "Islamic Center", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 5,
    date: "Nov 9, 2025",
    games: [
      { id: 13, time: "8:30 PM", home: "Islamic Society", away: "Masjid Al-Huda", field: "Field 1" },
      { id: 14, time: "9:30 PM", home: "Masjid Al-Falah", away: "Islamic Center", field: "Field 2" },
      { id: 15, time: "10:30 PM", home: "Brampton Islamic Center", away: "Masjid Al-Noor", field: "Field 1" },
    ],
  },
  {
    week: 6,
    date: "Nov 16, 2025",
    games: [
      { id: 16, time: "8:30 PM", home: "Masjid Al-Huda", away: "Brampton Islamic Center", field: "Field 1" },
      { id: 17, time: "9:30 PM", home: "Masjid Al-Noor", away: "Masjid Al-Falah", field: "Field 2" },
      { id: 18, time: "10:30 PM", home: "Islamic Center", away: "Islamic Society", field: "Field 1" },
    ],
  },
  {
    week: 7,
    date: "Nov 23, 2025",
    games: [
      { id: 19, time: "8:30 PM", home: "Masjid Al-Falah", away: "Masjid Al-Huda", field: "Field 1" },
      { id: 20, time: "9:30 PM", home: "Islamic Society", away: "Masjid Al-Noor", field: "Field 2" },
      { id: 21, time: "10:30 PM", home: "Brampton Islamic Center", away: "Islamic Center", field: "Field 1" },
    ],
  },
  {
    week: 8,
    date: "Nov 30, 2025",
    games: [
      { id: 22, time: "8:30 PM", home: "Masjid Al-Huda", away: "Islamic Society", field: "Field 1" },
      { id: 23, time: "9:30 PM", home: "Islamic Center", away: "Masjid Al-Falah", field: "Field 2" },
      { id: 24, time: "10:30 PM", home: "Masjid Al-Noor", away: "Brampton Islamic Center", field: "Field 1" },
    ],
  },
]

const teams = [
  { id: 1, name: "Masjid Al-Huda", wins: 5, losses: 2, draws: 0, goalsFor: 18, goalsAgainst: 8 },
  { id: 2, name: "Islamic Center", wins: 4, losses: 2, draws: 1, goalsFor: 15, goalsAgainst: 12 },
  { id: 3, name: "Brampton Islamic Center", wins: 3, losses: 3, draws: 1, goalsFor: 14, goalsAgainst: 13 },
  { id: 4, name: "Masjid Al-Noor", wins: 3, losses: 2, draws: 2, goalsFor: 12, goalsAgainst: 10 },
  { id: 5, name: "Islamic Society", wins: 2, losses: 4, draws: 1, goalsFor: 10, goalsAgainst: 15 },
  { id: 6, name: "Masjid Al-Falah", wins: 1, losses: 5, draws: 1, goalsFor: 6, goalsAgainst: 17 },
]

const recentScores = [
  {
    date: "Nov 23, 2025",
    week: 7,
    games: [
      { id: 19, time: "8:30 PM", home: "Masjid Al-Falah", homeScore: 0, away: "Masjid Al-Huda", awayScore: 4, status: "FT" },
      { id: 20, time: "9:30 PM", home: "Islamic Society", homeScore: 2, away: "Masjid Al-Noor", awayScore: 2, status: "FT" },
      { id: 21, time: "10:30 PM", home: "Brampton Islamic Center", homeScore: 3, away: "Islamic Center", awayScore: 1, status: "FT" },
    ],
  },
  {
    date: "Nov 16, 2025",
    week: 6,
    games: [
      { id: 16, time: "8:30 PM", home: "Masjid Al-Huda", homeScore: 3, away: "Brampton Islamic Center", awayScore: 1, status: "FT" },
      { id: 17, time: "9:30 PM", home: "Masjid Al-Noor", homeScore: 2, away: "Masjid Al-Falah", awayScore: 0, status: "FT" },
      { id: 18, time: "10:30 PM", home: "Islamic Center", homeScore: 1, away: "Islamic Society", awayScore: 1, status: "FT" },
    ],
  },
  {
    date: "Nov 9, 2025",
    week: 5,
    games: [
      { id: 13, time: "8:30 PM", home: "Islamic Society", homeScore: 1, away: "Masjid Al-Huda", awayScore: 3, status: "FT" },
      { id: 14, time: "9:30 PM", home: "Masjid Al-Falah", homeScore: 0, away: "Islamic Center", awayScore: 2, status: "FT" },
      { id: 15, time: "10:30 PM", home: "Brampton Islamic Center", homeScore: 2, away: "Masjid Al-Noor", awayScore: 2, status: "FT" },
    ],
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'scores' | 'teams'>('schedule')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        window.location.href = '/auth/login'
      } else {
        setUser(data.user)
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
            <Trophy className="h-6 w-6 text-primary" />
            <div>
              <div className="font-bold text-foreground">BIMSL Admin</div>
              <div className="text-xs text-foreground/70">{user?.email}</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('schedule')}
                    isActive={activeTab === 'schedule'}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('scores')}
                    isActive={activeTab === 'scores'}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Scores</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('teams')}
                    isActive={activeTab === 'teams'}
                  >
                    <Users className="h-4 w-4" />
                    <span>Teams</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <LogoutButton />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {activeTab === 'schedule' ? 'Schedule Management' : activeTab === 'scores' ? 'Scores Management' : 'Teams Management'}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {activeTab === 'schedule' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Game Schedule</h2>
                <Button>Add Game</Button>
              </div>
              <div className="space-y-4">
                {schedule.map((week) => (
                  <Card key={week.week} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Week {week.week} - {week.date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {week.games.map((game) => (
                          <div
                            key={game.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 border border-border gap-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-foreground">{game.time}</span>
                              </div>
                              <div className="text-foreground">
                                <span className="font-medium">{game.home}</span>
                                <span className="mx-2 text-foreground/50">vs</span>
                                <span className="font-medium">{game.away}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-foreground/70">
                                <MapPin className="h-4 w-4" />
                                <span>{game.field}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm">Delete</Button>
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
          ) : activeTab === 'scores' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Game Scores</h2>
                <Button>Add Score</Button>
              </div>
              <div className="space-y-4">
                {recentScores.map((week) => (
                  <Card key={week.week} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Week {week.week} - {week.date}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {week.games.map((game) => (
                          <div
                            key={game.id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 border border-border gap-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-foreground">{game.time}</span>
                                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600 font-semibold">
                                  {game.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-foreground">
                                <div className="flex-1 text-right">
                                  <span className="font-medium">{game.home}</span>
                                </div>
                                <div className="flex items-center gap-2 font-bold text-xl">
                                  <Input
                                    type="number"
                                    defaultValue={game.homeScore}
                                    className="w-16 text-center"
                                  />
                                  <span className="text-foreground/50">-</span>
                                  <Input
                                    type="number"
                                    defaultValue={game.awayScore}
                                    className="w-16 text-center"
                                  />
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">{game.away}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Save</Button>
                              <Button variant="outline" size="sm">Cancel</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Teams</h2>
                <Button>Add Team</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card key={team.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {team.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-foreground/70">Wins:</span>
                            <span className="ml-2 font-semibold text-foreground">{team.wins}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Losses:</span>
                            <span className="ml-2 font-semibold text-foreground">{team.losses}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Draws:</span>
                            <span className="ml-2 font-semibold text-foreground">{team.draws}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Points:</span>
                            <span className="ml-2 font-semibold text-primary">{team.wins * 3 + team.draws}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/70">Goals For:</span>
                            <span className="font-semibold text-green-600">{team.goalsFor}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/70">Goals Against:</span>
                            <span className="font-semibold text-red-600">{team.goalsAgainst}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold mt-1">
                            <span className="text-foreground/70">Goal Difference:</span>
                            <span className={team.goalsFor - team.goalsAgainst >= 0 ? "text-green-600" : "text-red-600"}>
                              {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                          <Button variant="outline" size="sm" className="flex-1">Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Add New Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input id="team-name" placeholder="Enter team name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-masjid">Masjid/Organization</Label>
                      <Input id="team-masjid" placeholder="Enter masjid name" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button>Create Team</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
