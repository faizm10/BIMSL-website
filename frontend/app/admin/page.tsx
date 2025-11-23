"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Calendar, Clock, MapPin, Trophy, Users, Trash2, Edit, Plus, UserPlus, Zap, Award, AlertTriangle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
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
  is_playoff?: boolean
  is_published?: boolean
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

// Playoff Bracket Component
type PlayoffBracketProps = {
  teams: Team[]
  games: Game[]
  onGameUpdate: () => Promise<void>
  onGameCreate: (gameData: {
    match_id: string
    week: number
    game_date: string
    game_time: string
    location: string
    home_team_id: string
    away_team_id: string
    home_score: number
    away_score: number
    status: string
    is_playoff: boolean
    is_published: boolean
  }) => Promise<void>
  onGameEdit: (game: Game) => void
  supabase: ReturnType<typeof createClient>
}

function PlayoffBracket({ teams, games, onGameCreate, onGameEdit, onGameUpdate, supabase }: PlayoffBracketProps) {
  // Get top 6 teams from standings
  const playoffTeams = teams.slice(0, 6)
  const team1 = playoffTeams[0]
  const team2 = playoffTeams[1]
  const team3 = playoffTeams[2]
  const team4 = playoffTeams[3]
  const team5 = playoffTeams[4]
  const team6 = playoffTeams[5]

  // Filter playoff games (using is_playoff field)
  const playoffGames = games.filter(g => g.is_playoff === true)
  
  // Find specific playoff games
  const findPlayoffGame = (matchIdPrefix: string) => {
    return playoffGames.find(g => g.match_id?.startsWith(matchIdPrefix))
  }

  const semi1v4 = findPlayoffGame('PLAYOFF-SEMI1')
  const semi2v3 = findPlayoffGame('PLAYOFF-SEMI2')
  const game5v6 = findPlayoffGame('PLAYOFF-5V6')
  const game3rd4th = findPlayoffGame('PLAYOFF-3RD4TH')
  const final = findPlayoffGame('PLAYOFF-FINAL')

  // Determine winners
  const getWinner = (game: Game | undefined) => {
    if (!game || game.status !== 'completed' || game.home_score === null || game.away_score === null) {
      return null
    }
    if (game.home_score > game.away_score) return game.home_team_id
    if (game.away_score > game.home_score) return game.away_team_id
    return null // Draw - no winner yet
  }

  const winner1v4 = getWinner(semi1v4)
  const loser1v4 = semi1v4 && winner1v4 ? (semi1v4.home_team_id === winner1v4 ? semi1v4.away_team_id : semi1v4.home_team_id) : null
  const winner2v3 = getWinner(semi2v3)
  const loser2v3 = semi2v3 && winner2v3 ? (semi2v3.home_team_id === winner2v3 ? semi2v3.away_team_id : semi2v3.home_team_id) : null

  const openPlayoffGameDialog = async (gameType: string, homeTeamId: string, awayTeamId: string, week: number) => {
    const existingGame = findPlayoffGame(`PLAYOFF-${gameType}`)
    
    if (existingGame) {
      // Edit existing game
      onGameEdit(existingGame)
    } else {
      // Create new game
      const today = new Date().toISOString().split('T')[0]
      const defaultTime = '20:30:00'
      
      await onGameCreate({
        match_id: `PLAYOFF-${gameType}`,
        week,
        game_date: today,
        game_time: defaultTime,
        location: 'Save Max Sports Centre',
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: 0,
        away_score: 0,
        status: 'scheduled',
        is_playoff: true,
        is_published: false
      })
    }
  }

  const handlePublishToggle = async (game: Game, publish: boolean) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_published: publish })
        .eq('id', game.id)

      if (error) throw error
      await onGameUpdate()
    } catch (error) {
      console.error('Error updating publish status:', error)
      alert(`Error ${publish ? 'publishing' : 'unpublishing'} game`)
    }
  }

  const renderGameBox = (
    game: Game | undefined,
    team1: Team | undefined,
    team2: Team | undefined,
    label: string,
    onClick: () => void,
    disabled?: boolean
  ) => {
    if (!team1 || !team2) {
      return (
        <div className="p-4 rounded-lg border-2 border-border/50 bg-muted/30 opacity-50">
          <div className="text-xs font-semibold text-foreground/60 mb-2">{label}</div>
          <div className="text-sm text-foreground/50">Teams not yet determined</div>
        </div>
      )
    }

    const isCompleted = game?.status === 'completed' && game.home_score !== null && game.away_score !== null
    const winner = game && isCompleted 
      ? (game.home_score > game.away_score ? game.home_team_id : game.away_score > game.home_score ? game.away_team_id : null)
      : null

    const team1Score = game && isCompleted 
      ? (game.home_team_id === team1.id ? game.home_score : game.away_score)
      : null
    const team2Score = game && isCompleted 
      ? (game.home_team_id === team2.id ? game.home_score : game.away_score)
      : null

    return (
      <div 
        onClick={disabled ? undefined : onClick}
        className={`p-4 rounded-lg border-2 transition-all ${
          disabled 
            ? 'bg-muted/30 border-border/50 opacity-50 cursor-not-allowed'
            : isCompleted 
              ? 'bg-primary/10 border-primary hover:bg-primary/20 cursor-pointer' 
              : 'bg-card border-border hover:border-primary/50 cursor-pointer'
        }`}
      >
        <div className="text-xs font-semibold text-foreground/60 mb-2">{label}</div>
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-2 rounded ${
            winner === team1.id ? 'bg-primary/20 font-bold' : 'hover:bg-muted/50'
          }`}>
            <span className="text-sm text-foreground">{team1.name}</span>
            {team1Score !== null && (
              <span className={`text-sm font-bold ${winner === team1.id ? 'text-primary' : 'text-foreground'}`}>
                {team1Score}
              </span>
            )}
          </div>
          <div className={`flex items-center justify-between p-2 rounded ${
            winner === team2.id ? 'bg-primary/20 font-bold' : 'hover:bg-muted/50'
          }`}>
            <span className="text-sm text-foreground">{team2.name}</span>
            {team2Score !== null && (
              <span className={`text-sm font-bold ${winner === team2.id ? 'text-primary' : 'text-foreground'}`}>
                {team2Score}
              </span>
            )}
          </div>
        </div>
        {game ? (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-foreground/50">
              {game.game_date ? new Date(game.game_date).toLocaleDateString() : 'Not scheduled'}
              {game.game_time && ` • ${game.game_time.slice(0, 5)}`}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {game.is_published ? (
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600 font-semibold">
                    Published
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-600 font-semibold">
                    Draft
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant={game.is_published ? "outline" : "default"}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePublishToggle(game, !game.is_published)
                }}
                className="text-xs h-7"
              >
                {game.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
            {!isCompleted && (
              <div className="text-xs text-primary">Click to edit game</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-primary mt-2">Click to create game</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Playoff Bracket
        </h2>
        <p className="text-foreground/70">Based on current standings. Click on games to create or edit them.</p>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Playoff Bracket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Semifinals Row */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Semifinals</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {renderGameBox(
                  semi1v4,
                  team1,
                  team4,
                  'Semifinal 1: 1st vs 4th',
                  () => team1 && team4 && openPlayoffGameDialog('SEMI1', team1.id, team4.id, 9)
                )}
                {renderGameBox(
                  semi2v3,
                  team2,
                  team3,
                  'Semifinal 2: 2nd vs 3rd',
                  () => team2 && team3 && openPlayoffGameDialog('SEMI2', team2.id, team3.id, 9)
                )}
              </div>
            </div>

            {/* 5th vs 6th Place Game */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">5th Place Game</h3>
              <div className="max-w-md">
                {renderGameBox(
                  game5v6,
                  team5,
                  team6,
                  '5th vs 6th',
                  () => team5 && team6 && openPlayoffGameDialog('5V6', team5.id, team6.id, 10)
                )}
              </div>
            </div>

            {/* 3rd/4th Place Game */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">3rd Place Game</h3>
              <div className="max-w-md">
                {renderGameBox(
                  game3rd4th,
                  loser1v4 ? teams.find(t => t.id === loser1v4) : undefined,
                  loser2v3 ? teams.find(t => t.id === loser2v3) : undefined,
                  '3rd vs 4th (Losers of Semifinals)',
                  () => {
                    if (loser1v4 && loser2v3) {
                      openPlayoffGameDialog('3RD4TH', loser1v4, loser2v3, 10)
                    }
                  },
                  !loser1v4 || !loser2v3
                )}
              </div>
            </div>

            {/* Final */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Championship Final</h3>
              <div className="max-w-md">
                {renderGameBox(
                  final,
                  winner1v4 ? teams.find(t => t.id === winner1v4) : undefined,
                  winner2v3 ? teams.find(t => t.id === winner2v3) : undefined,
                  'Final (Winners of Semifinals)',
                  () => {
                    if (winner1v4 && winner2v3) {
                      openPlayoffGameDialog('FINAL', winner1v4, winner2v3, 11)
                    }
                  },
                  !winner1v4 || !winner2v3
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'schedule' | 'scores' | 'teams' | 'roster' | 'standings' | 'playoffs' | 'league-leaders'>('schedule')
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [roster, setRoster] = useState<Roster[]>([])
  const [gameGoals, setGameGoals] = useState<Array<{ game_id: string; player_id: string; player?: Roster }>>([])
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
  const [gameYellowCardsForDialog, setGameYellowCardsForDialog] = useState<Array<{ player_id: string; card_count: number }>>([])
  const [gameRedCardsForDialog, setGameRedCardsForDialog] = useState<Array<{ player_id: string; card_count: number }>>([])
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
    status: 'scheduled',
    is_playoff: false,
    is_published: false
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

  // Initialize tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const validTabs: Array<'schedule' | 'scores' | 'teams' | 'roster' | 'standings' | 'playoffs' | 'league-leaders'> = 
      ['schedule', 'scores', 'teams', 'roster', 'standings', 'playoffs', 'league-leaders']
    
    if (tabParam && validTabs.includes(tabParam as 'schedule' | 'scores' | 'teams' | 'roster' | 'standings' | 'playoffs' | 'league-leaders')) {
      setActiveTab(tabParam as typeof activeTab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/admin?${params.toString()}`, { scroll: false })
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Fetch game events (goals, yellow cards, red cards) with player information
      try {
        const { data: gameGoalsData, error: gameGoalsError } = await supabase
          .from('game_goals')
          .select('game_id, player_id, event_type')

        if (gameGoalsError) {
          // Check if table doesn't exist (empty error object or relation error)
          const errorMessage = gameGoalsError.message || JSON.stringify(gameGoalsError)
          if (errorMessage.includes('relation') || 
              errorMessage.includes('does not exist') ||
              errorMessage.includes('relation "game_goals"') ||
              Object.keys(gameGoalsError).length === 0) {
            // Table doesn't exist yet - this is expected if migration hasn't been run
            setGameGoals([])
          } else {
            console.warn('Could not fetch game goals:', gameGoalsError)
            setGameGoals([])
          }
        } else if (gameGoalsData) {
          // Enrich with player information
          const enrichedGameGoals = gameGoalsData.map(goal => {
            const player = rosterData?.find(p => p.id === goal.player_id)
            return {
              ...goal,
              player
            }
          })
          setGameGoals(enrichedGameGoals)
        }
      } catch {
        // Silently fail if table doesn't exist
        setGameGoals([])
      }

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

      // Build insert object with core fields
      const insertData: {
        match_id: string
        week: number
        game_date: string
        game_time: string
        location: string
        home_team_id: string
        away_team_id: string
        home_score: number
        away_score: number
        status: string
        is_playoff?: boolean
        is_published?: boolean
      } = {
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
      }

      // Only include playoff fields if they're explicitly set (columns may not exist yet)
      if (gameForm.is_playoff !== undefined || gameForm.is_published !== undefined) {
        insertData.is_playoff = gameForm.is_playoff || false
        insertData.is_published = gameForm.is_published || false
      }

      let { data: newGame, error } = await supabase
        .from('games')
        .insert([insertData])
        .select()
        .single()

      // If error is about missing columns, retry without playoff fields
      if (error && (error.message?.includes('column') || error.message?.includes('is_playoff') || error.message?.includes('is_published'))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { is_playoff, is_published, ...coreInsertData } = insertData
        const retryResult = await supabase
          .from('games')
          .insert([coreInsertData])
          .select()
          .single()
        newGame = retryResult.data
        error = retryResult.error
      }

      if (error) throw error

      // Save goal scorers to game_goals table and update roster
      if (newGame && gameGoalsForDialog.length > 0) {
        try {
          // First, delete any existing game_goals for this game (in case of re-saving)
          await supabase
            .from('game_goals')
            .delete()
            .eq('game_id', newGame.id)

          // Create game_goals entries (one row per event)
          const gameEventsToInsert = [
            // Goals
            ...gameGoalsForDialog
              .filter(g => g.player_id && g.goal_count > 0)
              .flatMap(g => 
                Array(g.goal_count).fill(null).map(() => ({
                  game_id: newGame.id,
                  player_id: g.player_id,
                  event_type: 'goal'
                }))
              ),
            // Yellow cards
            ...gameYellowCardsForDialog
              .filter(c => c.player_id && c.card_count > 0)
              .flatMap(c => 
                Array(c.card_count).fill(null).map(() => ({
                  game_id: newGame.id,
                  player_id: c.player_id,
                  event_type: 'yellow_card'
                }))
              ),
            // Red cards
            ...gameRedCardsForDialog
              .filter(c => c.player_id && c.card_count > 0)
              .flatMap(c => 
                Array(c.card_count).fill(null).map(() => ({
                  game_id: newGame.id,
                  player_id: c.player_id,
                  event_type: 'red_card'
                }))
              )
          ]

          if (gameEventsToInsert.length > 0) {
            const { error: goalsError } = await supabase
              .from('game_goals')
              .insert(gameEventsToInsert)

            if (goalsError) {
              // If table doesn't exist, just log and continue
              if (goalsError.message?.includes('relation') || goalsError.message?.includes('does not exist')) {
                console.warn('game_goals table does not exist yet. Run migration 007_create_game_goals_table.sql')
              } else {
                console.error('Error inserting game goals:', goalsError)
              }
            } else {
              // Update roster totals by recalculating from all game_goals
              await updateRosterGoalsFromGameGoals()
            }
          }
        } catch (error) {
          console.error('Error saving game goals:', error)
          // Don't fail the entire game creation if goal saving fails
        }
      }

      setGameDialogOpen(false)
      resetGameForm()
      setGameGoalsForDialog([])
      setGameYellowCardsForDialog([])
      setGameRedCardsForDialog([])
      // Fetch data will refresh roster with updated goals and recalculate team stats
      await fetchData()
      
      // Refresh game goals display
      try {
        const { data: gameGoalsData } = await supabase
          .from('game_goals')
          .select('game_id, player_id')
        if (gameGoalsData) {
          const enrichedGameGoals = gameGoalsData.map(goal => {
            const player = roster.find(p => p.id === goal.player_id)
            return { ...goal, player }
          })
          setGameGoals(enrichedGameGoals)
        }
      } catch (error) {
        // Silently fail if table doesn't exist
      }
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

      // Build update object with core fields
      const updateData: {
        match_id: string
        week: number
        game_date: string
        game_time: string
        location: string
        home_team_id: string
        away_team_id: string
        home_score: number
        away_score: number
        status: string
        is_playoff?: boolean
        is_published?: boolean
      } = {
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
      }

      // Only include playoff fields if they're explicitly set (columns may not exist yet)
      // Try to include them, but if the update fails, we'll retry without them
      if (gameForm.is_playoff !== undefined || gameForm.is_published !== undefined) {
        updateData.is_playoff = gameForm.is_playoff || false
        updateData.is_published = gameForm.is_published || false
      }

      let { error } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', editingGame.id)

      // If error is about missing columns, retry without playoff fields
      if (error && (error.message?.includes('column') || error.message?.includes('is_playoff') || error.message?.includes('is_published'))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { is_playoff, is_published, ...coreUpdateData } = updateData
        const retryResult = await supabase
          .from('games')
          .update(coreUpdateData)
          .eq('id', editingGame.id)
        error = retryResult.error
      }

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Save goal scorers to game_goals table and update roster
      if (editingGame) {
        try {
          // Delete existing game_goals for this game
          await supabase
            .from('game_goals')
            .delete()
            .eq('game_id', editingGame.id)

          // Create new game_goals entries (one row per event)
          const gameEventsToInsert = [
            // Goals
            ...gameGoalsForDialog
              .filter(g => g.player_id && g.goal_count > 0)
              .flatMap(g => 
                Array(g.goal_count).fill(null).map(() => ({
                  game_id: editingGame.id,
                  player_id: g.player_id,
                  event_type: 'goal'
                }))
              ),
            // Yellow cards
            ...gameYellowCardsForDialog
              .filter(c => c.player_id && c.card_count > 0)
              .flatMap(c => 
                Array(c.card_count).fill(null).map(() => ({
                  game_id: editingGame.id,
                  player_id: c.player_id,
                  event_type: 'yellow_card'
                }))
              ),
            // Red cards
            ...gameRedCardsForDialog
              .filter(c => c.player_id && c.card_count > 0)
              .flatMap(c => 
                Array(c.card_count).fill(null).map(() => ({
                  game_id: editingGame.id,
                  player_id: c.player_id,
                  event_type: 'red_card'
                }))
              )
          ]

          if (gameEventsToInsert.length > 0) {
            const { error: goalsError } = await supabase
              .from('game_goals')
              .insert(gameEventsToInsert)

            if (goalsError) {
              // If table doesn't exist, just log and continue
              const errorMessage = goalsError.message || JSON.stringify(goalsError)
              if (errorMessage.includes('relation') || 
                  errorMessage.includes('does not exist') ||
                  Object.keys(goalsError).length === 0) {
                console.warn('game_goals table does not exist yet. Run migration 007_create_game_goals_table.sql')
              } else {
                console.error('Error inserting game events:', goalsError)
              }
            } else {
              // Update roster totals by recalculating from all game_goals
              await updateRosterGoalsFromGameGoals()
            }
          } else {
            // No events in dialog, but still update roster (in case events were removed)
            await updateRosterGoalsFromGameGoals()
          }
        } catch (error) {
          console.error('Error saving game goals:', error)
          // Don't fail the entire game update if goal saving fails
        }
      }

      setGameDialogOpen(false)
      setEditingGame(null)
      resetGameForm()
      setGameGoalsForDialog([])
      setGameYellowCardsForDialog([])
      setGameRedCardsForDialog([])
      // Fetch data will refresh roster with updated goals and recalculate team stats
      await fetchData()
      
      // Refresh game goals display after roster is updated
      setTimeout(async () => {
        try {
          const { data: gameGoalsData } = await supabase
            .from('game_goals')
            .select('game_id, player_id')
          if (gameGoalsData) {
            // Get updated roster
            const { data: updatedRoster } = await supabase
              .from('roster')
              .select('*')
            if (updatedRoster) {
              const enrichedGameGoals = gameGoalsData.map(goal => {
                const player = updatedRoster.find(p => p.id === goal.player_id)
                return { ...goal, player }
              })
              setGameGoals(enrichedGameGoals)
            }
          }
        } catch (error) {
          // Silently fail if table doesn't exist
        }
      }, 500)
    } catch (error) {
      console.error('Error updating game:', error)
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message?: string }).message 
        : 'Unknown error occurred'
      alert(`Error updating game: ${errorMessage}`)
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

  // Function to recalculate roster stats (goals, yellow cards, red cards) from game_goals table
  const updateRosterGoalsFromGameGoals = async () => {
    try {
      // Fetch all game_goals grouped by player and event type
      const { data: gameEventsData, error: goalsError } = await supabase
        .from('game_goals')
        .select('player_id, event_type')

      if (goalsError) {
        // If table doesn't exist, just return silently
        const errorMessage = goalsError.message || JSON.stringify(goalsError)
        if (errorMessage.includes('relation') || 
            errorMessage.includes('does not exist') ||
            Object.keys(goalsError).length === 0) {
          return
        }
        console.error('Error fetching game events:', goalsError)
        return
      }

      // Count events per player by type
      const statsByPlayer: Record<string, { goals: number; yellow_cards: number; red_cards: number }> = {}
      
      if (gameEventsData) {
        gameEventsData.forEach((event: { player_id: string; event_type: string }) => {
          if (!statsByPlayer[event.player_id]) {
            statsByPlayer[event.player_id] = { goals: 0, yellow_cards: 0, red_cards: 0 }
          }
          if (event.event_type === 'goal') {
            statsByPlayer[event.player_id].goals += 1
          } else if (event.event_type === 'yellow_card') {
            statsByPlayer[event.player_id].yellow_cards += 1
          } else if (event.event_type === 'red_card') {
            statsByPlayer[event.player_id].red_cards += 1
          }
        })
      }

      // Update each player's stats in roster
      const updatePromises = Object.entries(statsByPlayer).map(async ([playerId, stats]) => {
        const { error } = await supabase
          .from('roster')
          .update({ 
            goals: stats.goals,
            yellow_cards: stats.yellow_cards,
            red_cards: stats.red_cards
          })
          .eq('id', playerId)

        if (error) {
          console.error(`Error updating stats for player ${playerId}:`, error)
        }
      })

      // Also set stats to 0 for players who have no events
      const allPlayerIds = roster.map(p => p.id)
      const playersWithEvents = Object.keys(statsByPlayer)
      const playersWithoutEvents = allPlayerIds.filter(id => !playersWithEvents.includes(id))

      const zeroStatsPromises = playersWithoutEvents.map(async (playerId) => {
        const { error } = await supabase
          .from('roster')
          .update({ goals: 0, yellow_cards: 0, red_cards: 0 })
          .eq('id', playerId)

        if (error) {
          console.error(`Error resetting stats for player ${playerId}:`, error)
        }
      })

      await Promise.all([...updatePromises, ...zeroStatsPromises])
    } catch (error) {
      console.error('Error updating roster stats from game events:', error)
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
      status: 'scheduled',
      is_playoff: false,
      is_published: false
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

  const openGameDialog = async (game?: Game) => {
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
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        status: game.status,
        is_playoff: game.is_playoff || false,
        is_published: game.is_published || false
      })

      // Fetch existing events (goals, yellow cards, red cards) for this game
      try {
        const { data: gameEventsData, error: goalsError } = await supabase
          .from('game_goals')
          .select('player_id, event_type')
          .eq('game_id', game.id)

        if (goalsError) {
          // If table doesn't exist or any error, just set empty array silently
          // Check for common error patterns
          const errorMessage = goalsError.message || JSON.stringify(goalsError)
          if (errorMessage.includes('relation') || 
              errorMessage.includes('does not exist') ||
              errorMessage.includes('relation "game_goals"') ||
              Object.keys(goalsError).length === 0) {
            // Table doesn't exist yet - this is expected if migration hasn't been run
            setGameGoalsForDialog([])
            setGameYellowCardsForDialog([])
            setGameRedCardsForDialog([])
          } else {
            // Only log if it's a real error (not just missing table)
            console.warn('Error fetching game events:', goalsError)
            setGameGoalsForDialog([])
            setGameYellowCardsForDialog([])
            setGameRedCardsForDialog([])
          }
        } else {
          // Group events by player and event type
          const goalsByPlayer: Record<string, { player_id: string; goal_count: number }> = {}
          const yellowCardsByPlayer: Record<string, { player_id: string; card_count: number }> = {}
          const redCardsByPlayer: Record<string, { player_id: string; card_count: number }> = {}

          if (gameEventsData) {
            gameEventsData.forEach((event: { player_id: string; event_type: string }) => {
              if (event.event_type === 'goal') {
                if (goalsByPlayer[event.player_id]) {
                  goalsByPlayer[event.player_id].goal_count += 1
                } else {
                  goalsByPlayer[event.player_id] = { player_id: event.player_id, goal_count: 1 }
                }
              } else if (event.event_type === 'yellow_card') {
                if (yellowCardsByPlayer[event.player_id]) {
                  yellowCardsByPlayer[event.player_id].card_count += 1
                } else {
                  yellowCardsByPlayer[event.player_id] = { player_id: event.player_id, card_count: 1 }
                }
              } else if (event.event_type === 'red_card') {
                if (redCardsByPlayer[event.player_id]) {
                  redCardsByPlayer[event.player_id].card_count += 1
                } else {
                  redCardsByPlayer[event.player_id] = { player_id: event.player_id, card_count: 1 }
                }
              }
            })
          }

          setGameGoalsForDialog(Object.values(goalsByPlayer))
          setGameYellowCardsForDialog(Object.values(yellowCardsByPlayer))
          setGameRedCardsForDialog(Object.values(redCardsByPlayer))
        }
      } catch (error) {
        console.error('Error loading game events:', error)
        setGameGoalsForDialog([])
        setGameYellowCardsForDialog([])
        setGameRedCardsForDialog([])
      }
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

  // Yellow cards functions
  const addYellowCardToDialog = () => {
    setGameYellowCardsForDialog([...gameYellowCardsForDialog, { player_id: '', card_count: 1 }])
  }

  const removeYellowCardFromDialog = (index: number) => {
    setGameYellowCardsForDialog(gameYellowCardsForDialog.filter((_, i) => i !== index))
  }

  const updateYellowCardInDialog = (index: number, field: 'player_id' | 'card_count', value: string | number) => {
    const updated = [...gameYellowCardsForDialog]
    updated[index] = { ...updated[index], [field]: value }
    setGameYellowCardsForDialog(updated)
  }

  // Red cards functions
  const addRedCardToDialog = () => {
    setGameRedCardsForDialog([...gameRedCardsForDialog, { player_id: '', card_count: 1 }])
  }

  const removeRedCardFromDialog = (index: number) => {
    setGameRedCardsForDialog(gameRedCardsForDialog.filter((_, i) => i !== index))
  }

  const updateRedCardInDialog = (index: number, field: 'player_id' | 'card_count', value: string | number) => {
    const updated = [...gameRedCardsForDialog]
    updated[index] = { ...updated[index], [field]: value }
    setGameRedCardsForDialog(updated)
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
    } catch (error) {
      console.error('Error creating roster entry:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
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
    } catch (error) {
      console.error('Error updating roster entry:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12 text-primary" />
          <div className="text-foreground/70 font-medium text-lg">Loading admin dashboard...</div>
        </div>
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
                    onClick={() => handleTabChange('schedule')}
                    isActive={activeTab === 'schedule'}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('scores')}
                    isActive={activeTab === 'scores'}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Scores</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('teams')}
                    isActive={activeTab === 'teams'}
                  >
                    <Users className="h-4 w-4" />
                    <span>Teams</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('roster')}
                    isActive={activeTab === 'roster'}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Roster</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('standings')}
                    isActive={activeTab === 'standings'}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Standings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('playoffs')}
                    isActive={activeTab === 'playoffs'}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Playoffs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleTabChange('league-leaders')}
                    isActive={activeTab === 'league-leaders'}
                  >
                    <Award className="h-4 w-4" />
                    <span>League Leaders</span>
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
               activeTab === 'standings' ? 'Standings' :
               activeTab === 'playoffs' ? 'Playoff Bracket' :
               'League Leaders'}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner className="h-8 w-8 text-primary" />
              <div className="text-foreground/70 font-medium">Loading data...</div>
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
          ) : activeTab === 'playoffs' ? (
            <PlayoffBracket 
              teams={teams}
              games={games}
              onGameUpdate={async () => {
                await fetchData()
              }}
              onGameCreate={async (gameData) => {
                try {
                  // For playoff games, use the provided match_id
                  const { error } = await supabase
                    .from('games')
                    .insert([gameData])

                  if (error) throw error
                  await fetchData()
                } catch (error) {
                  console.error('Error creating playoff game:', error)
                  alert('Error creating playoff game')
                }
              }}
              onGameEdit={(game) => {
                setEditingGame(game)
                setGameForm({
                  match_id: game.match_id || '',
                  week: game.week,
                  game_date: game.game_date,
                  game_time: game.game_time,
                  location: game.location,
                  home_team_id: game.home_team_id,
                  away_team_id: game.away_team_id,
                  home_score: game.home_score || 0,
                  away_score: game.away_score || 0,
                  status: game.status,
                  is_playoff: game.is_playoff || false,
                  is_published: game.is_published || false
                })
                setGameDialogOpen(true)
              }}
              supabase={supabase}
            />
          ) : activeTab === 'league-leaders' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">League Leaders</h2>
              
              {/* Overall Top Scorers */}
              <Card>
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
                                <TableCell>{team?.name || 'Unknown'}</TableCell>
                                <TableCell className="text-center font-bold text-lg">{player.goals || 0}</TableCell>
                              </TableRow>
                            )
                          })}
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
              <Card>
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
                                    <TableCell>{team?.name || 'Unknown'}</TableCell>
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
                                    <TableCell>{team?.name || 'Unknown'}</TableCell>
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
                                {/* Display goal scorers */}
                                {(() => {
                                  const gameGoalScorers = gameGoals
                                    .filter(gg => gg.game_id === game.id)
                                    .reduce((acc, goal) => {
                                      if (goal.player) {
                                        const existing = acc.find(p => p.player_id === goal.player_id)
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

                                  if (gameGoalScorers.length > 0) {
                                    return (
                                      <div className="mt-2 text-xs text-foreground/70">
                                        <span className="font-semibold">Goal Scorers: </span>
                                        {gameGoalScorers
                                          .sort((a, b) => b.goals - a.goals)
                                          .map((scorer, idx) => (
                                            <span key={scorer.player_id}>
                                              {scorer.player_name}
                                              {scorer.goals > 1 && <span className="font-bold"> ({scorer.goals})</span>}
                                              {idx < gameGoalScorers.length - 1 && ', '}
                                            </span>
                                          ))}
                                      </div>
                                    )
                                  }
                                  return null
                                })()}
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
              <p className="text-xs text-foreground/70">Match ID will be auto-generated as &quot;Week {gameForm.week} - Game X&quot;</p>
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
                <p className="text-sm text-foreground/70 italic">No goal scorers added. Click &quot;Add Scorer&quot; to track who scored.</p>
              )}
            </div>

            {/* Yellow Cards Section */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Yellow Cards (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addYellowCardToDialog}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Yellow Card
                </Button>
              </div>
              {gameYellowCardsForDialog.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gameYellowCardsForDialog.map((card, index) => {
                    const homeTeamPlayers = roster.filter(r => r.team_id === gameForm.home_team_id)
                    const awayTeamPlayers = roster.filter(r => r.team_id === gameForm.away_team_id)
                    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers]

                    return (
                      <div key={index} className="flex gap-2 items-end p-2 border rounded">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Player</Label>
                          <Select
                            value={card.player_id}
                            onValueChange={(value) => updateYellowCardInDialog(index, 'player_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                              {allPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.full_name} {player.jersey_number ? `#${player.jersey_number}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Count</Label>
                          <Input
                            type="number"
                            min="1"
                            value={card.card_count}
                            onChange={(e) => updateYellowCardInDialog(index, 'card_count', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeYellowCardFromDialog(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              {gameYellowCardsForDialog.length === 0 && (
                <p className="text-sm text-foreground/70 italic">No yellow cards added. Click &quot;Add Yellow Card&quot; to track cards.</p>
              )}
            </div>

            {/* Red Cards Section */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Red Cards (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRedCardToDialog}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Red Card
                </Button>
              </div>
              {gameRedCardsForDialog.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gameRedCardsForDialog.map((card, index) => {
                    const homeTeamPlayers = roster.filter(r => r.team_id === gameForm.home_team_id)
                    const awayTeamPlayers = roster.filter(r => r.team_id === gameForm.away_team_id)
                    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers]

                    return (
                      <div key={index} className="flex gap-2 items-end p-2 border rounded">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Player</Label>
                          <Select
                            value={card.player_id}
                            onValueChange={(value) => updateRedCardInDialog(index, 'player_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                              {allPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.full_name} {player.jersey_number ? `#${player.jersey_number}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs">Count</Label>
                          <Input
                            type="number"
                            min="1"
                            value={card.card_count}
                            onChange={(e) => updateRedCardInDialog(index, 'card_count', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRedCardFromDialog(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
              {gameRedCardsForDialog.length === 0 && (
                <p className="text-sm text-foreground/70 italic">No red cards added. Click &quot;Add Red Card&quot; to track cards.</p>
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

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-foreground/70 font-medium text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  )
}
