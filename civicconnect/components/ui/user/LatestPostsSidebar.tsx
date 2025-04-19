'use client'

import React from 'react'

interface LatestPostsSidebarProps {
  latest: { id: number; title: string }[]
}

export default function LatestPostsSidebar({
  latest,
}: LatestPostsSidebarProps) {
  return (
    <aside className="border-l border-gray-700 pl-6 sticky top-12 self-start">
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
