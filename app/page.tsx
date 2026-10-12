'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import { BalanceSummary, RatesWidget, RecentTransactions, WalletCard } from '@/components/dashboard'
import { getMe } from '@/lib/api/endpoints'
import styles from './page.module.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User>()
  const [isLoading, setIsLoading] = useState(true)

  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let ignore = false
    getMe()
      .then((res) => {
        if (!ignore) setUser(res.data)
      })
      .catch(() => {
        if (!ignore) setLoadFailed(true)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  if (isLoading) return <p className={styles.loading}>Loading…</p>
  if (loadFailed || !user) return <p className={styles.loading}>We couldn&apos;t load your account.</p>

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Welcome back, {user.firstName}</h1>
        <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
      </header>

      <BalanceSummary wallets={user.wallets} />

      <div className={styles.wallets}>
        {user.wallets.map((wallet) => (
          <WalletCard key={wallet.currency} wallet={wallet} />
        ))}
      </div>

      <div className={styles.columns}>
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
