// pages/index.tsx
import { NextPage } from 'next'
import { PostCard } from '@/components/ui/user/PostCard'
import LatestPostsSidebar from '@/components/ui/user/LatestPostsSidebar'
import MapWidget from '@/components/ui/user/MapWidget'

const POSTS = [
  { id: 1, title: 'First Post in the Center', descriptionText: '…', commentsCount: 12, status: 'Not taken' },
  { id: 2, title: 'Another Interesting Topic', descriptionImageSrc: '/images/sample2.jpg', commentsCount: 34, status: 'Action taken' },
  { id: 3, title: 'What’s Up in Tech?', descriptionText: '…', commentsCount: 7, status: 'Everyone satisfied' },
  { id: 1, title: 'First Post in the Center', descriptionText: '…', commentsCount: 12, status: 'Not taken' },
  { id: 2, title: 'Another Interesting Topic', descriptionImageSrc: '/images/sample2.jpg', commentsCount: 34, status: 'Action taken' },
  { id: 3, title: 'What’s Up in Tech?', descriptionText: '…', commentsCount: 7, status: 'Everyone satisfied' },
  // …more posts if you like
]

const LATEST = [
  { id: 101, title: 'Latest: New Feature Launched' },
  { id: 102, title: 'Latest: Bug Fixes Deployed' },
  { id: 103, title: 'Latest: Community Meetup' },
]

const HomePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="
          w-full max-w-screen-2xl mx-auto
          grid
          grid-cols-[4fr_3fr]      /* ← now 3∶1∶3 layout */
          grid-rows-[auto_auto]
          gap-y-8 gap-x-24
          py-12 px-4
        "
      >
        {/* POSTS in first column */}
        <main className="row-start-1 col-start-1 space-y-8 pl-1">
          {POSTS.map(post => (
            <PostCard key={post.id} {...post} />
          ))}
        </main>

        {/* sidebar+map spans cols 2–3 */}
        <div
          className="
            row-start-1 row-span-2
            col-start-2 col-span-2      /* covers the 1fr + 3fr columns */
            border-l border-gray-700 pl-6 pr-[15%]
            sticky top-12 self-start
            flex flex-col space-y-8
          "
        >
          <LatestPostsSidebar latest={LATEST} />
          <MapWidget />
        </div>
      </div>
    </div>
  )
}

export default HomePage
