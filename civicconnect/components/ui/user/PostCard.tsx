// app/components/PostCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronUp, ChevronDown } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Priority = 'very-low' | 'low' | 'high' | 'very-high'
const PRIORITIES: Priority[] = ['very-low', 'low', 'high', 'very-high']
const PRIORITY_COLORS: Record<Priority, string> = {
  'very-low':  'bg-green-800',
  low:         'bg-blue-800',
  high:        'bg-yellow-800',
  'very-high': 'bg-red-800',
}

interface PostCardProps {
  title: string
  descriptionText?: string
  descriptionImageSrc?: string
  commentsCount: number
  status: string
}

export function PostCard({
  title,
  descriptionText,
  descriptionImageSrc,
  commentsCount,
  status,
}: PostCardProps) {
  const [idx, setIdx] = useState(0)
  const prio = PRIORITIES[idx]

  const increase = () =>
    setIdx(i => Math.min(i + 1, PRIORITIES.length - 1))
  const decrease = () =>
    setIdx(i => Math.max(i - 1, 0))

  return (
    <Card className="relative flex overflow-hidden rounded-lg bg-[#1A1A1A] border border-black">
      {/* ← Absolute priority bar on the left */}
      <div
        className={`
          absolute inset-y-0 left-0 w-6
          ${PRIORITY_COLORS[prio]}
          flex flex-col items-center justify-center
        `}
      >
        {/* Up arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={increase}
          disabled={idx === PRIORITIES.length - 1}
          className="p-0 hover:bg-transparent focus:ring-0"
        >
          <ChevronUp className="h-4 w-4 text-gray-400" />
        </Button>

        {/* Down arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={decrease}
          disabled={idx === 0}
          className="p-0 hover:bg-transparent focus:ring-0"
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {/* Main content, padded to sit right of the bar */}
      <div className="flex-1 pl-6">
        <CardHeader className="pb-0">
          <CardTitle className="text-base line-clamp-2 text-white">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2 pb-1">
          {descriptionImageSrc ? (
            <div className="relative h-48 w-full rounded-md overflow-hidden mb-2">
              <Image
                src={descriptionImageSrc}
                alt="Post image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-200 line-clamp-3 mb-2">
              {descriptionText}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full flex justify-between text-xs text-gray-400">
            <span>💬 {commentsCount} comments</span>
            <span>Status: {status}</span>
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}
