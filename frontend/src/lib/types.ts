export interface User {
  id: string
  githubId: number
  username: string
  email: string | null
  avatarUrl: string | null
  displayName: string | null
  createdAt: string
  lastSynced: string | null
}

export interface Repository {
  id: string
  userId: string
  githubRepoId: number
  name: string
  fullName: string
  description: string | null
  isPrivate: boolean
  stars: number
  forks: number
  createdAt: string
  updatedAt: string
}

export interface Commit {
  id: string
  repositoryId: string
  userId: string
  sha: string
  message: string
  authorName: string
  authorEmail: string
  committedAt: string
}

export interface RepoLanguage {
  id: string
  repositoryId: string
  language: string
  bytes: number
  percentage: number
  syncedAt: string
}

export interface SyncLog {
  id: string
  userId: string
  repositoryId: string | null
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  message: string | null
  startedAt: string
  completedAt: string | null
}

export interface DashboardStats {
  overview: {
    totalCommits30d: number
    activeDays30d: number
    currentStreak: number
    longestStreak: number
  }
  heatmap: Array<{ date: string; count: number }>
  languages: Array<{ language: string; bytes: number; percentage: number }>
  topRepos: Array<{ name: string; fullName: string; commitCount: number }>
  comparison: {
    thisMonth: { commits: number; activeDays: number }
    lastMonth: { commits: number; activeDays: number }
  }
  activeTime: Array<{ weekday: number; hour: number; count: number }>
  lastSyncedAt: string | null
  lastSyncStatus: 'SUCCESS' | 'FAILED' | 'RUNNING' | null
  lastSyncError: string | null
}
