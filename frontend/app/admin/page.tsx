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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, MapPin, Trophy, Users, Trash2, Edit, Plus, UserPlus } from 'lucide-react'
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

type Roster = {
  id: string
  team_id: string
  full_name: string
  jersey_number: number | null
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  team?: Team
}

// Removed GameGoal type - we'll just update roster table directly

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'scores' | 'teams' | 'roster' | 'standings'>('schedule')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [roster, setRoster] = useState<Roster[]>([])
  const [loadingData, setLoadingData] = useState(false)
  
  // Dialog states
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'team' | 'game' | 'roster'>('team')
  const [deleteId, setDeleteId] = useState<string>('')
  
  // Form states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [editingRoster, setEditingRoster] = useState<Roster | null>(null)
  const [gameGoalsForDialog, setGameGoalsForDialog] = useState<Array<{ player_id: string; goal_count: number }>>([])
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
  const [rosterForm, setRosterForm] = useState({
    team_id: '',
    full_name: '',
    jersey_number: null as number | null,
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0
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

      // Fetch roster with team names
      const { data: rosterData, error: rosterError } = await supabase
        .from('roster')
        .select(`
          *,
          team:teams(id, name)
        `)
        .order('team_id', { ascending: true })
        .order('full_name', { ascending: true })

      if (rosterError) throw rosterError
      setRoster(rosterData || [])

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

      const { data: newGame, error } = await supabase
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
        .select()
        .single()

      if (error) throw error

      // Update roster goals if any (optional)
      if (newGame && gameGoalsForDialog.length > 0) {
        // Update each player's goals count in the roster table
        const goalUpdates = gameGoalsForDialog
          .filter(g => g.player_id && g.goal_count > 0)
          .map(async (g) => {
            // Get current goals for this player
            const player = roster.find(p => p.id === g.player_id)
            if (player) {
              const newGoalsCount = (player.goals || 0) + g.goal_count
              const { error } = await supabase
                .from('roster')
                .update({ goals: newGoalsCount })
                .eq('id', g.player_id)

              if (error) {
                console.error(`Error updating goals for player ${g.player_id}:`, error)
              }
            }
          })

        await Promise.all(goalUpdates)
      }

      setGameDialogOpen(false)
      resetGameForm()
      setGameGoalsForDialog([])
      // Fetch data will refresh roster with updated goals and recalculate team stats
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

      // Update goals: delete existing and insert new ones
      if (editingGame) {
        // Update roster goals if any (optional)
        // Note: This will add to existing goals. If you need to recalculate, you'd need to track previous goals.
        if (gameGoalsForDialog.length > 0) {
          // Update each player's goals count in the roster table
          const goalUpdates = gameGoalsForDialog
            .filter(g => g.player_id && g.goal_count > 0)
            .map(async (g) => {
              // Get current goals for this player
              const player = roster.find(p => p.id === g.player_id)
              if (player) {
                const newGoalsCount = (player.goals || 0) + g.goal_count
                const { error } = await supabase
                  .from('roster')
                  .update({ goals: newGoalsCount })
                  .eq('id', g.player_id)

                if (error) {
                  console.error(`Error updating goals for player ${g.player_id}:`, error)
                }
              }
            })

          await Promise.all(goalUpdates)
        }
      }

      setGameDialogOpen(false)
      setEditingGame(null)
      resetGameForm()
      setGameGoalsForDialog([])
      // Fetch data will refresh roster with updated goals and recalculate team stats
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

  const handleDelete = async () => {
    if (deleteType === 'team') {
      await handleDeleteTeam()
    } else if (deleteType === 'game') {
      await handleDeleteGame()
    } else if (deleteType === 'roster') {
      await handleDeleteRoster()
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
    setGameGoalsForDialog([])
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
      // For now, start with empty goals - we'll update roster directly when saving
      setGameGoalsForDialog([])
    } else {
      setEditingGame(null)
      resetGameForm()
      setGameGoalsForDialog([])
    }
    setGameDialogOpen(true)
  }

  const addGoalToDialog = () => {
    setGameGoalsForDialog([...gameGoalsForDialog, { player_id: '', goal_count: 1 }])
  }

  const removeGoalFromDialog = (index: number) => {
    setGameGoalsForDialog(gameGoalsForDialog.filter((_, i) => i !== index))
  }

  const updateGoalInDialog = (index: number, field: 'player_id' | 'goal_count', value: string | number) => {
    const updated = [...gameGoalsForDialog]
    updated[index] = { ...updated[index], [field]: value }
    setGameGoalsForDialog(updated)
  }

  // Roster CRUD functions
  const handleCreateRoster = async () => {
    try {
      if (!rosterForm.team_id || !rosterForm.full_name) {
        alert('Please fill all required fields (Team, Full Name)')
        return
      }

      const { error } = await supabase
        .from('roster')
        .insert([{
          team_id: rosterForm.team_id,
          full_name: rosterForm.full_name,
          jersey_number: rosterForm.jersey_number || null,
          goals: rosterForm.goals || 0,
          assists: rosterForm.assists || 0,
          yellow_cards: rosterForm.yellow_cards || 0,
          red_cards: rosterForm.red_cards || 0
        }])

      if (error) throw error
      setRosterDialogOpen(false)
      resetRosterForm()
      await fetchData()
    } catch (error: any) {
      console.error('Error creating roster entry:', error)
      if (error.code === '23505') {
        alert('A player with this jersey number already exists for this team')
      } else {
        alert('Error creating roster entry')
      }
    }
  }

  const handleUpdateRoster = async () => {
    if (!editingRoster) return
    try {
      if (!rosterForm.team_id || !rosterForm.full_name) {
        alert('Please fill all required fields (Team, Full Name)')
        return
      }

      const { error } = await supabase
        .from('roster')
        .update({
          team_id: rosterForm.team_id,
          full_name: rosterForm.full_name,
          jersey_number: rosterForm.jersey_number || null,
          goals: rosterForm.goals || 0,
          assists: rosterForm.assists || 0,
          yellow_cards: rosterForm.yellow_cards || 0,
          red_cards: rosterForm.red_cards || 0
        })
        .eq('id', editingRoster.id)

      if (error) throw error
      setRosterDialogOpen(false)
      setEditingRoster(null)
      resetRosterForm()
      await fetchData()
    } catch (error: any) {
      console.error('Error updating roster entry:', error)
      if (error.code === '23505') {
        alert('A player with this jersey number already exists for this team')
      } else {
        alert('Error updating roster entry')
      }
    }
  }

  const handleDeleteRoster = async () => {
    try {
      const { error } = await supabase
        .from('roster')
        .delete()
        .eq('id', deleteId)

      if (error) throw error
      setDeleteDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error deleting roster entry:', error)
      alert('Error deleting roster entry')
    }
  }

  const resetRosterForm = () => {
    setRosterForm({
      team_id: '',
      full_name: '',
      jersey_number: null,
      goals: 0,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0
    })
  }

  const openRosterDialog = (rosterEntry?: Roster) => {
    if (rosterEntry) {
      setEditingRoster(rosterEntry)
      setRosterForm({
        team_id: rosterEntry.team_id,
        full_name: rosterEntry.full_name,
        jersey_number: rosterEntry.jersey_number,
        goals: rosterEntry.goals,
        assists: rosterEntry.assists,
        yellow_cards: rosterEntry.yellow_cards,
        red_cards: rosterEntry.red_cards
      })
    } else {
      setEditingRoster(null)
      resetRosterForm()
    }
    setRosterDialogOpen(true)
  }

  const openDeleteDialog = (type: 'team' | 'game' | 'roster', id: string) => {
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
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('roster')}
                    isActive={activeTab === 'roster'}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Roster</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('standings')}
                    isActive={activeTab === 'standings'}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Standings</span>
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
              {activeTab === 'schedule' ? 'Schedule Management' : 
               activeTab === 'scores' ? 'Scores Management' : 
               activeTab === 'teams' ? 'Teams Management' : 
               activeTab === 'roster' ? 'Roster Management' :
               'Standings'}
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
          ) : activeTab === 'roster' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Team Roster</h2>
                <Button onClick={() => openRosterDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>
              <div className="space-y-4">
                {Object.entries(
                  roster.reduce((acc, player) => {
                    const teamName = player.team?.name || 'Unknown Team'
                    if (!acc[teamName]) {
                      acc[teamName] = []
                    }
                    acc[teamName].push(player)
                    return acc
                  }, {} as Record<string, Roster[]>)
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([teamName, players]) => (
                    <Card key={teamName} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-primary" />
                          {teamName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 text-sm font-semibold text-foreground">#</th>
                                <th className="text-left p-2 text-sm font-semibold text-foreground">Name</th>
                                <th className="text-center p-2 text-sm font-semibold text-foreground">Goals</th>
                                <th className="text-center p-2 text-sm font-semibold text-foreground">Assists</th>
                                <th className="text-center p-2 text-sm font-semibold text-foreground">Yellow</th>
                                <th className="text-center p-2 text-sm font-semibold text-foreground">Red</th>
                                <th className="text-right p-2 text-sm font-semibold text-foreground">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {players
                                .sort((a, b) => {
                                  if (a.jersey_number === null && b.jersey_number === null) return 0
                                  if (a.jersey_number === null) return 1
                                  if (b.jersey_number === null) return -1
                                  return a.jersey_number - b.jersey_number
                                })
                                .map((player) => (
                                  <tr key={player.id} className="border-b hover:bg-muted/50">
                                    <td className="p-2 font-semibold text-foreground">{player.jersey_number ?? '-'}</td>
                                    <td className="p-2 text-foreground">{player.full_name}</td>
                                    <td className="p-2 text-center text-foreground">{player.goals}</td>
                                    <td className="p-2 text-center text-foreground">{player.assists}</td>
                                    <td className="p-2 text-center text-yellow-600 font-semibold">{player.yellow_cards}</td>
                                    <td className="p-2 text-center text-red-600 font-semibold">{player.red_cards}</td>
                                    <td className="p-2">
                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openRosterDialog(player)}>
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => openDeleteDialog('roster', player.id)}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ) : activeTab === 'standings' ? (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  League Standings
                </h2>
                <p className="text-foreground/70">Current League Table</p>
              </div>

              <Card className="hover:shadow-lg transition-shadow">
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
                        {teams.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center text-foreground/70 py-8">
                              No standings data available yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          teams.map((team, index) => {
                            // Calculate form (last 5 games)
                            const teamGames = games
                              .filter(g => g.status === 'completed' && (g.home_team_id === team.id || g.away_team_id === team.id))
                              .slice(0, 5)
                              .reverse()

                            const form = teamGames.map(game => {
                              const isHome = game.home_team_id === team.id
                              const teamScore = isHome ? game.home_score : game.away_score
                              const opponentScore = isHome ? game.away_score : game.home_score
                              if (teamScore > opponentScore) return 'W'
                              if (teamScore < opponentScore) return 'L'
                              return 'D'
                            })

                            return (
                              <TableRow key={team.id} className={index < 4 ? "bg-primary/5" : ""}>
                                <TableCell className="font-bold">
                                  <div className="flex items-center gap-2">
                                    {index + 1}
                                    {index < 4 && <Trophy className="h-4 w-4 text-primary" />}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">{team.name}</TableCell>
                                <TableCell className="text-center">{team.games_played}</TableCell>
                                <TableCell className="text-center">{team.wins}</TableCell>
                                <TableCell className="text-center">{team.draws}</TableCell>
                                <TableCell className="text-center">{team.losses}</TableCell>
                                <TableCell className="text-center">{team.goals_for}</TableCell>
                                <TableCell className="text-center">{team.goals_against}</TableCell>
                                <TableCell className={`text-center font-semibold ${team.goal_difference > 0 ? "text-green-500" : team.goal_difference < 0 ? "text-red-500" : ""}`}>
                                  {team.goal_difference > 0 ? "+" : ""}
                                  {team.goal_difference}
                                </TableCell>
                                <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1 justify-center">
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
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
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
                        {teams.length === 0 ? (
                          <p className="text-foreground/50">No teams qualified yet</p>
                        ) : (
                          <ul className="space-y-1">
                            {teams.slice(0, 4).map((team, index) => (
                              <li key={team.id} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </span>
                                {team.name}
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
                {Object.entries(
                  activeTab === 'scores' 
                    ? games
                        .filter(g => g.status === 'completed' && g.home_score !== null && g.away_score !== null)
                        .reduce((acc, game) => {
                          if (!acc[game.week]) {
                            acc[game.week] = []
                          }
                          acc[game.week].push(game)
                          return acc
                        }, {} as Record<number, Game[]>)
                    : gamesByWeek
                ).sort(([a], [b]) => Number(b) - Number(a)).map(([week, weekGames]) => (
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

            {/* Goals Section (Optional) */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Goal Scorers (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGoalToDialog}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Scorer
                </Button>
              </div>
              {gameGoalsForDialog.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gameGoalsForDialog.map((goal, index) => {
                    // Get players from both teams
                    const homeTeamPlayers = roster.filter(r => r.team_id === gameForm.home_team_id)
                    const awayTeamPlayers = roster.filter(r => r.team_id === gameForm.away_team_id)
                    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers]

                    return (
                      <div key={index} className="flex gap-2 items-end p-2 border rounded">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Player</Label>
                          <Select
                            value={goal.player_id}
                            onValueChange={(value) => updateGoalInDialog(index, 'player_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                              {allPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.full_name} {player.jersey_number ? `#${player.jersey_number}` : ''} 
                                  {player.team?.name ? ` (${player.team.name})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Goals</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={goal.goal_count}
                            onChange={(e) => updateGoalInDialog(index, 'goal_count', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeGoalFromDialog(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              {gameGoalsForDialog.length === 0 && (
                <p className="text-sm text-foreground/70 italic">No goal scorers added. Click "Add Scorer" to track who scored.</p>
              )}
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

      {/* Roster Dialog */}
      <Dialog open={rosterDialogOpen} onOpenChange={setRosterDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoster ? 'Edit Player' : 'Add New Player'}</DialogTitle>
            <DialogDescription>
              {editingRoster ? 'Update player information' : 'Add a new player to the roster'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roster-team">Team *</Label>
              <Select value={rosterForm.team_id} onValueChange={(value) => setRosterForm({ ...rosterForm, team_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roster-name">Full Name *</Label>
                <Input
                  id="roster-name"
                  value={rosterForm.full_name}
                  onChange={(e) => setRosterForm({ ...rosterForm, full_name: e.target.value })}
                  placeholder="Enter player's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roster-jersey">Jersey Number</Label>
                <Input
                  id="roster-jersey"
                  type="number"
                  min="1"
                  max="99"
                  value={rosterForm.jersey_number ?? ''}
                  onChange={(e) => setRosterForm({ ...rosterForm, jersey_number: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="e.g., 10 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roster-goals">Goals</Label>
                <Input
                  id="roster-goals"
                  type="number"
                  min="0"
                  value={rosterForm.goals || ''}
                  onChange={(e) => setRosterForm({ ...rosterForm, goals: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roster-assists">Assists</Label>
                <Input
                  id="roster-assists"
                  type="number"
                  min="0"
                  value={rosterForm.assists || ''}
                  onChange={(e) => setRosterForm({ ...rosterForm, assists: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roster-yellow">Yellow Cards</Label>
                <Input
                  id="roster-yellow"
                  type="number"
                  min="0"
                  value={rosterForm.yellow_cards || ''}
                  onChange={(e) => setRosterForm({ ...rosterForm, yellow_cards: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roster-red">Red Cards</Label>
                <Input
                  id="roster-red"
                  type="number"
                  min="0"
                  value={rosterForm.red_cards || ''}
                  onChange={(e) => setRosterForm({ ...rosterForm, red_cards: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRosterDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingRoster ? handleUpdateRoster : handleCreateRoster}>
              {editingRoster ? 'Update' : 'Create'}
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
              This action cannot be undone. This will permanently delete the {deleteType === 'team' ? 'team' : deleteType === 'game' ? 'game' : 'player'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
