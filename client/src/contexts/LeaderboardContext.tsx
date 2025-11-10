import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  achievements: number;
  collisions: number;
  division: string;
  isAnonymous: boolean;
  joinDate: string;
  lastActive: string;
}

export type LeaderboardFilter = 'all-time' | 'monthly' | 'weekly' | 'daily';
export type LeaderboardMetric = 'collisions' | 'achievements' | 'score';

interface LeaderboardContextType {
  entries: LeaderboardEntry[];
  filter: LeaderboardFilter;
  setFilter: (filter: LeaderboardFilter) => void;
  metric: LeaderboardMetric;
  setMetric: (metric: LeaderboardMetric) => void;
  userRank: LeaderboardEntry | null;
  isLoading: boolean;
  refreshLeaderboard: () => Promise<void>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

// Mock data generator
function generateMockLeaderboard(): LeaderboardEntry[] {
  const divisions = ['AVE', 'Sakshi', 'SubCircle'];
  const names = [
    'Alex Chen', 'Maya Patel', 'Jordan Smith', 'Sofia Garcia', 'Aditya Kumar',
    'Emma Wilson', 'Raj Desai', 'Luna Martinez', 'Kai Tanaka', 'Zara Ahmed'
  ];

  return names.map((name, index) => ({
    rank: index + 1,
    userId: `user-${index + 1}`,
    username: name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    score: Math.floor(Math.random() * 5000) + 1000,
    achievements: Math.floor(Math.random() * 50) + 5,
    collisions: Math.floor(Math.random() * 1000) + 100,
    division: divisions[Math.floor(Math.random() * divisions.length)],
    isAnonymous: Math.random() > 0.8,
    joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  })).sort((a, b) => b.score - a.score);
}

export function LeaderboardProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<LeaderboardFilter>('all-time');
  const [metric, setMetric] = useState<LeaderboardMetric>('collisions');
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  const refreshLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = generateMockLeaderboard();
      setEntries(mockData);
      
      // Set user rank (mock current user as rank 5)
      if (mockData.length > 4) {
        setUserRank(mockData[4]);
      }
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLeaderboard();
  }, [filter, metric]);

  const value: LeaderboardContextType = {
    entries,
    filter,
    setFilter,
    metric,
    setMetric,
    userRank,
    isLoading,
    refreshLeaderboard,
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider');
  }
  return context;
}
