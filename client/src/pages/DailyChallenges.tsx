import { useDailyChallenges } from '@/contexts/DailyChallengesContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, Gift, Target, TrendingUp } from 'lucide-react';

export default function DailyChallenges() {
  const { challenges, streak, totalRewardsToday, completeChallenge, claimReward } = useDailyChallenges();
  const { t } = useI18n();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'collision':
        return '⚡';
      case 'achievement':
        return '🏆';
      case 'exploration':
        return '🗺️';
      case 'social':
        return '🦋';
      default:
        return '🎯';
    }
  };

  const completedCount = challenges.filter((c) => c.completed).length;
  const completionPercentage = (completedCount / challenges.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold">Daily Challenges</h1>
          </div>
          <p className="text-muted-foreground">Complete challenges to earn rewards and build your streak</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Streak Card */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-sm">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{streak.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Longest: {streak.longestStreak} days
            </p>
          </Card>

          {/* Completed Card */}
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-sm">Completed Today</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {completedCount}/{challenges.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </Card>

          {/* Rewards Card */}
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-6 h-6 text-purple-500" />
              <h3 className="font-semibold text-sm">Rewards Today</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{totalRewardsToday}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Multiplier: {streak.streakBonusMultiplier.toFixed(1)}x
            </p>
          </Card>

          {/* Total Completed Card */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-sm">All Time</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{streak.totalCompleted}</p>
            <p className="text-xs text-muted-foreground mt-2">Challenges completed</p>
          </Card>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`p-6 transition-all ${
                challenge.completed
                  ? 'bg-green-50 border-green-200'
                  : 'hover:shadow-ghibli-lg'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{challenge.icon}</div>
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-xs text-muted-foreground">{challenge.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold text-accent">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                  />
                </div>
              </div>

              {/* Reward & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-yellow-600">
                    {Math.floor(challenge.reward * 1.5)} pts
                  </span>
                </div>
                {challenge.completed ? (
                  <Button
                    onClick={() => claimReward(challenge.id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Claim Reward
                  </Button>
                ) : (
                  <Button
                    onClick={() => completeChallenge(challenge.id)}
                    variant="outline"
                    size="sm"
                    disabled={challenge.current < challenge.target}
                  >
                    {challenge.current >= challenge.target ? 'Complete' : 'In Progress'}
                  </Button>
                )}
              </div>

              {/* Completion Badge */}
              {challenge.completed && (
                <div className="mt-4 p-2 bg-green-100 rounded text-center">
                  <p className="text-xs font-semibold text-green-800">✓ Completed</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="mt-8 p-6 bg-accent/5 border-accent/20">
          <h3 className="font-semibold mb-3">💡 Tips to Maximize Rewards</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Complete challenges daily to build your streak and increase reward multiplier</li>
            <li>• Hard difficulty challenges give higher base rewards</li>
            <li>• Your streak multiplier applies to all challenge rewards</li>
            <li>• Challenges reset daily at midnight</li>
            <li>• Complete all challenges to earn a bonus streak day</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
