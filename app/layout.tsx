import type { Metadata } from 'next'
import './globals.css'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export const metadata: Metadata = {
  title: 'Supply Chain Command Center',
  description: 'AI-powered goal dashboard for logistics excellence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="frost">
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('sc-theme') || 'frost';
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-screen">
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  )
}
