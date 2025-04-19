// components/ui/user/LatestPostsSidebar.tsx
'use client'

import React from 'react'

export interface LatestItem {
  id: string
  title: string
}

interface LatestPostsSidebarProps {
  latest: LatestItem[]
}

export default function LatestPostsSidebar({
  latest,
}: LatestPostsSidebarProps) {
  return (
    <aside className="pl-6 sticky top-12 self-start">
      <h3 className="text-xl font-semibold mb-4">Latest Posts</h3>
      <ul className="space-y-2">
        {latest.map(item => (
          <li key={item.id}>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
