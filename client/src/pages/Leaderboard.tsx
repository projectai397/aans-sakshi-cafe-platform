import { useState } from 'react';
import { Trophy, Medal, Zap, Target, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Leaderboard() {
  const { entries, filter, setFilter, metric, setMetric, userRank, isLoading, refreshLeaderboard } = useLeaderboard();
  const { t } = useI18n();
  const [showAnonymous, setShowAnonymous] = useState(true);

  const filters: Array<{ value: typeof filter; label: string; icon: React.ReactNode }> = [
    { value: 'all-time', label: 'All Time', icon: <Trophy className="w-4 h-4" /> },
    { value: 'monthly', label: 'Monthly', icon: <Target className="w-4 h-4" /> },
    { value: 'weekly', label: 'Weekly', icon: <Zap className="w-4 h-4" /> },
    { value: 'daily', label: 'Daily', icon: <Medal className="w-4 h-4" /> },
  ];

  const metrics: Array<{ value: typeof metric; label: string; key: keyof typeof entries[0] }> = [
    { value: 'collisions', label: 'Collisions', key: 'collisions' },
    { value: 'achievements', label: 'Achievements', key: 'achievements' },
    { value: 'score', label: 'Score', key: 'score' },
  ];

  const filteredEntries = entries.filter(entry => showAnonymous || !entry.isAnonymous);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getDivisionColor = (division: string) => {
    switch (division) {
      case 'AVE':
        return 'bg-blue-100 text-blue-800';
      case 'Sakshi':
        return 'bg-green-100 text-green-800';
      case 'SubCircle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Global Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Compete with users worldwide and climb the rankings</p>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  {userRank.avatar ? (
                    <img src={userRank.avatar} alt={userRank.username} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-accent-foreground">{userRank.username[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <h2 className="text-2xl font-bold">{userRank.username}</h2>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>🏆 Rank #{userRank.rank}</span>
                    <span>⚡ {userRank.collisions} Collisions</span>
                    <span>🎯 {userRank.achievements} Achievements</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-4xl font-bold text-accent">{userRank.score.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Time Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                variant={filter === f.value ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
              >
                {f.icon}
                {f.label}
              </Button>
            ))}
          </div>

          {/* Metric & Options */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as typeof metric)}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {metrics.map((m) => (
                <option key={m.value} value={m.value}>
                  Sort by {m.label}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setShowAnonymous(!showAnonymous)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showAnonymous ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showAnonymous ? 'Show All' : 'Hide Anonymous'}
            </Button>

            <Button
              onClick={refreshLeaderboard}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold">Player</th>
                    <th className="px-4 py-3 text-left font-semibold">Division</th>
                    <th className="px-4 py-3 text-right font-semibold">Collisions</th>
                    <th className="px-4 py-3 text-right font-semibold">Achievements</th>
                    <th className="px-4 py-3 text-right font-semibold">Score</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        entry.userId === userRank?.userId ? 'bg-accent/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          {getMedalIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.avatar ? (
                            <img
                              src={entry.avatar}
                              alt={entry.username}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {entry.username[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {entry.isAnonymous ? 'Anonymous Player' : entry.username}
                            </p>
                            {entry.userId === userRank?.userId && (
                              <p className="text-xs text-accent">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDivisionColor(entry.division)}`}>
                          {entry.division}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{entry.collisions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">{entry.achievements}</td>
                      <td className="px-4 py-3 text-right font-bold text-accent">{entry.score.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(entry.lastActive).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">🥇</div>
            <p className="text-sm text-muted-foreground">Top Performer</p>
            <p className="font-semibold">{filteredEntries[0]?.username || 'N/A'}</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-2">👥</div>
            <p className="text-sm text-muted-foreground">Total Players</p>
            <p className="font-semibold">{filteredEntries.length.toLocaleString()}</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">⚡</div>
            <p className="text-sm text-muted-foreground">Avg Collisions</p>
            <p className="font-semibold">
              {Math.round(filteredEntries.reduce((sum, e) => sum + e.collisions, 0) / filteredEntries.length)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
