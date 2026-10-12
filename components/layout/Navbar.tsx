'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cx } from '@/lib/cx'
import { UserMenu } from './UserMenu'
import styles from './Navbar.module.css'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/convert', label: 'Convert' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className={styles.chrome}>
      <header className={styles.navbar}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            acme<span className={styles.logoDot}>.</span>wallet
          </Link>
          <nav className={styles.links} aria-label="Main">
            {LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cx(styles.link, active && styles.active)}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <UserMenu />
        </div>
      </header>
      <nav className={styles.tabs} aria-label="Main">
        {LINKS.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cx(styles.tab, active && styles.tabActive)}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
