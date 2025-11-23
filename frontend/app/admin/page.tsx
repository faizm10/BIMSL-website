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
import { Calendar, Clock, MapPin, Trophy, Users, Trash2, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Team = {
  id: string
  name: string
  masjid_name: string | null
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
  home_team?: Team
  away_team?: Team
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'scores' | 'teams'>('schedule')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  // Dialog states
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'team' | 'game'>('team')
  const [deleteId, setDeleteId] = useState<string>('')
  
  // Form states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [teamForm, setTeamForm] = useState({ name: '', masjid_name: '' })
  const [gameForm, setGameForm] = useState({
    match_id: '',
    week: 1,
    game_date: '',
    game_time: '',
    location: '',
    home_team_id: '',
    away_team_id: '',
    home_score: 0,
    away_score: 0,
    status: 'scheduled'
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        window.location.href = '/auth/login'
      } else {
        setUser(data.user)
        setLoading(false)
        fetchData()
      }
    })
  }, [])

  const calculateTeamStats = (teamsData: Team[], gamesData: Game[]): Team[] => {
    // Calculate stats for each team from games
    return teamsData.map(team => {
      const teamGames = gamesData.filter(
        game => game.status === 'completed' && 
        (game.home_team_id === team.id || game.away_team_id === team.id)
      )

      let wins = 0
      let losses = 0
      let draws = 0
      let goals_for = 0
      let goals_against = 0

      teamGames.forEach(game => {
        const isHome = game.home_team_id === team.id
        const teamScore = isHome ? game.home_score : game.away_score
        const opponentScore = isHome ? game.away_score : game.home_score

        goals_for += teamScore
        goals_against += opponentScore

        if (teamScore > opponentScore) {
          wins++
        } else if (teamScore < opponentScore) {
          losses++
        } else {
          draws++
        }
      })

      const points = wins * 3 + draws
      const goal_difference = goals_for - goals_against

      return {
        ...team,
        points,
        games_played: teamGames.length,
        wins,
        losses,
        draws,
        goals_for,
        goals_against,
        goal_difference
      }
    }).sort((a, b) => {
      // Sort by points, then goal difference, then goals for
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_for - a.goals_for
    })
  }

  const syncTeamStatsToDatabase = async (teamsWithStats: Team[]) => {
    try {
      // Update all teams with calculated stats
      const updatePromises = teamsWithStats.map(team =>
        supabase
          .from('teams')
          .update({
            points: team.points,
            games_played: team.games_played,
            wins: team.wins,
            losses: team.losses,
            draws: team.draws,
            goals_for: team.goals_for,
            goals_against: team.goals_against,
            goal_difference: team.goal_difference
          })
          .eq('id', team.id)
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error syncing team stats to database:', error)
    }
  }

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true })

      if (teamsError) throw teamsError

      // Fetch games with team names
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(id, name),
          away_team:teams!games_away_team_id_fkey(id, name)
        `)
        .order('game_date', { ascending: false })
        .order('game_time', { ascending: false })

      if (gamesError) throw gamesError
      setGames(gamesData || [])

      // Calculate team stats from games
      const teamsWithStats = calculateTeamStats(teamsData || [], gamesData || [])
      setTeams(teamsWithStats)

      // Sync calculated stats back to database
      await syncTeamStatsToDatabase(teamsWithStats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreateTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .insert([{
          name: teamForm.name,
          masjid_name: teamForm.masjid_name || null
        }])

      if (error) throw error
      setTeamDialogOpen(false)
      setTeamForm({ name: '', masjid_name: '' })
      fetchData()
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Error creating team')
    }
  }

  const handleUpdateTeam = async () => {
    if (!editingTeam) return
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamForm.name,
          masjid_name: teamForm.masjid_name || null
        })
        .eq('id', editingTeam.id)

      if (error) throw error
      setTeamDialogOpen(false)
      setEditingTeam(null)
      setTeamForm({ name: '', masjid_name: '' })
      fetchData()
    } catch (error) {
      console.error('Error updating team:', error)
      alert('Error updating team')
    }
  }

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', deleteId)

      if (error) throw error
      setDeleteDialogOpen(false)
      // Fetch data will recalculate and sync team stats
      await fetchData()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Error deleting team')
    }
  }

  const generateMatchId = async (week: number): Promise<string> => {
    // Get all games for this week to determine the next game number
    const { data: weekGames, error } = await supabase
      .from('games')
      .select('match_id')
      .eq('week', week)
      .order('match_id', { ascending: true })

    if (error) throw error

    // Find the highest game number for this week
    let maxGameNumber = 0
    if (weekGames && weekGames.length > 0) {
      weekGames.forEach((game) => {
        if (game.match_id) {
          const match = game.match_id.match(/Week \d+ - Game (\d+)/)
          if (match) {
            const gameNum = parseInt(match[1])
            if (gameNum > maxGameNumber) {
              maxGameNumber = gameNum
            }
          }
        }
      })
    }

    // Generate next game number
    const nextGameNumber = maxGameNumber + 1
    return `Week ${week} - Game ${nextGameNumber}`
  }

  const handleCreateGame = async () => {
    // Validate all required fields are filled
    if (!gameForm.week || !gameForm.game_date || !gameForm.game_time || 
        !gameForm.location || !gameForm.home_team_id || !gameForm.away_team_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Generate match_id automatically
      const matchId = await generateMatchId(gameForm.week)

      const { error } = await supabase
        .from('games')
        .insert([{
          match_id: matchId,
          week: gameForm.week,
          game_date: gameForm.game_date,
          game_time: gameForm.game_time,
          location: gameForm.location,
          home_team_id: gameForm.home_team_id,
          away_team_id: gameForm.away_team_id,
          home_score: gameForm.home_score,
          away_score: gameForm.away_score,
          status: gameForm.status
        }])

      if (error) throw error
      setGameDialogOpen(false)
      resetGameForm()
      // Fetch data will recalculate and sync team stats
      await fetchData()
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Error creating game')
    }
  }

  const handleUpdateGame = async () => {
    if (!editingGame) return

    // Validate all required fields are filled
    if (!gameForm.week || !gameForm.game_date || !gameForm.game_time || 
        !gameForm.location || !gameForm.home_team_id || !gameForm.away_team_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      let matchId = gameForm.match_id

      // If week changed, regenerate match_id
      if (editingGame.week !== gameForm.week) {
        matchId = await generateMatchId(gameForm.week)
      } else if (!matchId) {
        // If no match_id exists, generate one
        matchId = await generateMatchId(gameForm.week)
      }

      const { error } = await supabase
        .from('games')
        .update({
          match_id: matchId,
          week: gameForm.week,
          game_date: gameForm.game_date,
          game_time: gameForm.game_time,
          location: gameForm.location,
          home_team_id: gameForm.home_team_id,
          away_team_id: gameForm.away_team_id,
          home_score: gameForm.home_score,
          away_score: gameForm.away_score,
          status: gameForm.status
        })
        .eq('id', editingGame.id)

      if (error) throw error
      setGameDialogOpen(false)
      setEditingGame(null)
      resetGameForm()
      // Fetch data will recalculate and sync team stats
      await fetchData()
    } catch (error) {
      console.error('Error updating game:', error)
      alert('Error updating game')
    }
  }

  const handleDeleteGame = async () => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', deleteId)

      if (error) throw error
      setDeleteDialogOpen(false)
      // Fetch data will recalculate and sync team stats
      await fetchData()
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Error deleting game')
    }
  }

  const resetGameForm = () => {
    setGameForm({
      match_id: '',
      week: 1,
      game_date: '',
      game_time: '',
      location: '',
      home_team_id: '',
      away_team_id: '',
      home_score: 0,
      away_score: 0,
      status: 'scheduled'
    })
  }

  const openTeamDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team)
      setTeamForm({ name: team.name, masjid_name: team.masjid_name || '' })
    } else {
      setEditingTeam(null)
      setTeamForm({ name: '', masjid_name: '' })
    }
    setTeamDialogOpen(true)
  }

  const openGameDialog = (game?: Game) => {
    if (game) {
      setEditingGame(game)
      setGameForm({
        match_id: game.match_id || '',
        week: game.week,
        game_date: game.game_date,
        game_time: game.game_time,
        location: game.location,
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        home_score: game.home_score,
        away_score: game.away_score,
        status: game.status
      })
    } else {
      setEditingGame(null)
      resetGameForm()
    }
    setGameDialogOpen(true)
  }

  const openDeleteDialog = (type: 'team' | 'game', id: string) => {
    setDeleteType(type)
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  // Group games by week
  const gamesByWeek = games.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = []
    }
    acc[game.week].push(game)
    return acc
  }, {} as Record<number, Game[]>)

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
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-foreground">Loading data...</div>
            </div>
          ) : activeTab === 'teams' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Teams</h2>
                <Button onClick={() => openTeamDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
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
                        {team.masjid_name && (
                          <div className="text-sm text-foreground/70">{team.masjid_name}</div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-foreground/70">Points:</span>
                            <span className="ml-2 font-semibold text-primary">{team.points}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Games:</span>
                            <span className="ml-2 font-semibold text-foreground">{team.games_played}</span>
                          </div>
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
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/70">Goals For:</span>
                            <span className="font-semibold text-green-600">{team.goals_for}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground/70">Goals Against:</span>
                            <span className="font-semibold text-red-600">{team.goals_against}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold mt-1">
                            <span className="text-foreground/70">Goal Difference:</span>
                            <span className={team.goal_difference >= 0 ? "text-green-600" : "text-red-600"}>
                              {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openTeamDialog(team)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openDeleteDialog('team', team.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTab === 'schedule' ? 'Game Schedule' : 'Game Scores'}
                </h2>
                <Button onClick={() => openGameDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Game
                </Button>
              </div>
              <div className="space-y-4">
                {Object.entries(gamesByWeek).sort(([a], [b]) => Number(b) - Number(a)).map(([week, weekGames]) => (
                  <Card key={week} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Week {week} - {weekGames[0]?.game_date ? new Date(weekGames[0].game_date).toLocaleDateString() : ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {weekGames.map((game) => {
                          const homeTeam = teams.find(t => t.id === game.home_team_id)
                          const awayTeam = teams.find(t => t.id === game.away_team_id)
                          return (
                            <div
                              key={game.id}
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 border border-border gap-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span className="font-semibold text-foreground">{game.game_time}</span>
                                  {game.status === 'completed' && (
                                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600 font-semibold">
                                      {game.status}
                                    </span>
                                  )}
                                </div>
                                <div className="text-foreground mb-2">
                                  <span className="font-medium">{homeTeam?.name || 'Unknown'}</span>
                                  <span className="mx-2 text-foreground/50">vs</span>
                                  <span className="font-medium">{awayTeam?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                                  <MapPin className="h-4 w-4" />
                                  <span>{game.location}</span>
                                  {game.match_id && <span className="ml-2">({game.match_id})</span>}
                                </div>
                                {activeTab === 'scores' && game.status === 'completed' && (
                                  <div className="flex items-center gap-2 mt-2 font-bold text-lg">
                                    <span>{game.home_score}</span>
                                    <span className="text-foreground/50">-</span>
                                    <span>{game.away_score}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openGameDialog(game)}>
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openDeleteDialog('game', game.id)}>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Team Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam ? 'Update team information' : 'Create a new team for the league'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-masjid">Masjid/Organization</Label>
              <Input
                id="team-masjid"
                value={teamForm.masjid_name}
                onChange={(e) => setTeamForm({ ...teamForm, masjid_name: e.target.value })}
                placeholder="Enter masjid name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingTeam ? handleUpdateTeam : handleCreateTeam}>
              {editingTeam ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            <DialogDescription>
              {editingGame ? 'Update game information' : 'Create a new game/match'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="week">Week *</Label>
              <Input
                id="week"
                type="number"
                min="1"
                value={gameForm.week}
                onChange={(e) => setGameForm({ ...gameForm, week: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-foreground/70">Match ID will be auto-generated as "Week {gameForm.week} - Game X"</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game-date">Date *</Label>
                <Input
                  id="game-date"
                  type="date"
                  value={gameForm.game_date}
                  onChange={(e) => setGameForm({ ...gameForm, game_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-time">Time *</Label>
                <Input
                  id="game-time"
                  type="time"
                  value={gameForm.game_time}
                  onChange={(e) => setGameForm({ ...gameForm, game_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={gameForm.location}
                onChange={(e) => setGameForm({ ...gameForm, location: e.target.value })}
                placeholder="e.g., Field 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-team">Home Team *</Label>
                <Select value={gameForm.home_team_id} onValueChange={(value) => setGameForm({ ...gameForm, home_team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-team">Away Team *</Label>
                <Select value={gameForm.away_team_id} onValueChange={(value) => setGameForm({ ...gameForm, away_team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.filter(t => t.id !== gameForm.home_team_id).map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-score">Home Score</Label>
                <Input
                  id="home-score"
                  type="number"
                  value={gameForm.home_score}
                  onChange={(e) => setGameForm({ ...gameForm, home_score: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-score">Away Score</Label>
                <Input
                  id="away-score"
                  type="number"
                  value={gameForm.away_score}
                  onChange={(e) => setGameForm({ ...gameForm, away_score: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={gameForm.status} onValueChange={(value) => setGameForm({ ...gameForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGameDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingGame ? handleUpdateGame : handleCreateGame}>
              {editingGame ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType === 'team' ? 'team' : 'game'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteType === 'team' ? handleDeleteTeam : handleDeleteGame}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
