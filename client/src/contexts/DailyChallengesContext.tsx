import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'collision' | 'achievement' | 'exploration' | 'social';
  target: number;
  current: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  completedAt?: Date;
  expiresAt: Date;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  lastCompletedDate?: Date;
  streakBonusMultiplier: number;
}

interface DailyChallengesContextType {
  challenges: Challenge[];
  streak: StreakData;
  totalRewardsToday: number;
  completeChallenge: (id: string) => void;
  updateChallengeProgress: (id: string, progress: number) => void;
  refreshChallenges: () => void;
  claimReward: (id: string) => void;
}

const DailyChallengesContext = createContext<DailyChallengesContextType | undefined>(undefined);

// Mock challenges generator
function generateDailyChallenges(): Challenge[] {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(23, 59, 59, 999);

  return [
    {
      id: 'challenge-1',
      title: 'Collision Master',
      description: 'Reach 50 particle collisions',
      icon: '⚡',
      category: 'collision',
      target: 50,
      current: Math.floor(Math.random() * 50),
      reward: 100,
      difficulty: 'easy',
      completed: false,
      expiresAt,
    },
    {
      id: 'challenge-2',
      title: 'Achievement Hunter',
      description: 'Unlock 2 new achievements',
      icon: '🏆',
      category: 'achievement',
      target: 2,
      current: Math.floor(Math.random() * 2),
      reward: 150,
      difficulty: 'medium',
      completed: false,
      expiresAt,
    },
    {
      id: 'challenge-3',
      title: 'Explorer',
      description: 'Visit 5 different pages',
      icon: '🗺️',
      category: 'exploration',
      target: 5,
      current: Math.floor(Math.random() * 5),
      reward: 75,
      difficulty: 'easy',
      completed: false,
      expiresAt,
    },
    {
      id: 'challenge-4',
      title: 'Social Butterfly',
      description: 'Share achievements 3 times',
      icon: '🦋',
      category: 'social',
      target: 3,
      current: Math.floor(Math.random() * 3),
      reward: 125,
      difficulty: 'medium',
      completed: false,
      expiresAt,
    },
    {
      id: 'challenge-5',
      title: 'Collision Legend',
      description: 'Reach 200 particle collisions',
      icon: '🔥',
      category: 'collision',
      target: 200,
      current: Math.floor(Math.random() * 200),
      reward: 300,
      difficulty: 'hard',
      completed: false,
      expiresAt,
    },
  ];
}

function generateStreakData(): StreakData {
  return {
    currentStreak: Math.floor(Math.random() * 10) + 1,
    longestStreak: Math.floor(Math.random() * 30) + 5,
    totalCompleted: Math.floor(Math.random() * 100) + 20,
    lastCompletedDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    streakBonusMultiplier: 1 + (Math.floor(Math.random() * 10) * 0.1),
  };
}

export function DailyChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState<StreakData>(generateStreakData());
  const [totalRewardsToday, setTotalRewardsToday] = useState(0);

  const refreshChallenges = () => {
    setChallenges(generateDailyChallenges());
  };

  useEffect(() => {
    refreshChallenges();
  }, []);

  const completeChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, completed: true, completedAt: new Date(), current: c.target }
          : c
      )
    );

    const challenge = challenges.find((c) => c.id === id);
    if (challenge) {
      const reward = Math.floor(challenge.reward * streak.streakBonusMultiplier);
      setTotalRewardsToday((prev) => prev + reward);

      // Update streak
      setStreak((prev) => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        totalCompleted: prev.totalCompleted + 1,
        lastCompletedDate: new Date(),
      }));
    }
  };

  const updateChallengeProgress = (id: string, progress: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newProgress = Math.min(progress, c.target);
          return {
            ...c,
            current: newProgress,
            completed: newProgress >= c.target,
            completedAt: newProgress >= c.target ? new Date() : undefined,
          };
        }
        return c;
      })
    );
  };

  const claimReward = (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (challenge && challenge.completed) {
      const reward = Math.floor(challenge.reward * streak.streakBonusMultiplier);
      console.log(`Claimed reward: ${reward} points`);
      // Reward logic would go here
    }
  };

  const value: DailyChallengesContextType = {
    challenges,
    streak,
    totalRewardsToday,
    completeChallenge,
    updateChallengeProgress,
    refreshChallenges,
    claimReward,
  };

  return (
    <DailyChallengesContext.Provider value={value}>
      {children}
    </DailyChallengesContext.Provider>
  );
}

export function useDailyChallenges() {
  const context = useContext(DailyChallengesContext);
  if (!context) {
    throw new Error('useDailyChallenges must be used within DailyChallengesProvider');
  }
  return context;
}
