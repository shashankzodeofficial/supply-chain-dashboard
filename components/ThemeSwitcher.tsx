'use client'

import { useEffect, useState } from 'react'

type Theme = 'frost' | 'apex' | 'summit'

const themes: { id: Theme; label: string; dot: string }[] = [
  { id: 'frost',  label: 'Frost',  dot: 'theme-dot-frost'  },
  { id: 'apex',   label: 'Apex',   dot: 'theme-dot-apex'   },
  { id: 'summit', label: 'Summit', dot: 'theme-dot-summit'  },
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('frost')

  useEffect(() => {
    const saved = (localStorage.getItem('sc-theme') as Theme) || 'frost'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const apply = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('sc-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  return (
    <div className="theme-switcher">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => apply(t.id)}
          title={t.label}
          className={`theme-dot ${t.dot} ${theme === t.id ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}
