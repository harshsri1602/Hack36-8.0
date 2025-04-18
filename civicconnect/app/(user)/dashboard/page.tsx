// pages/index.tsx
import { NextPage } from 'next'
import { PostCard } from '@/components/ui/user/PostCard'

const POSTS = [
  {
    id: 1,
    title: 'First Post in the Center',
    descriptionText:
      'This is a sample description that will be clamped to three lines. If it’s any longer it should end with an ellipsis so users know there’s more but it’s hidden here.',
    // descriptionImageSrc: '/images/sample1.jpg',
    commentsCount: 12,
    status: 'Not taken',
  },
  {
    id: 2,
    title: 'Another Interesting Topic',
    descriptionImageSrc: '/images/sample2.jpg',
    commentsCount: 34,
    status: 'Action taken',
  },
  {
    id: 3,
    title: 'What’s Up in Tech?',
    descriptionText:
      'Here’s another text‑only post, demonstrating the 3‑line clamp. It’ll truncate nicely if it runs too long.',
    commentsCount: 7,
    status: 'Everyone satisfied',
  },
]

const LATEST = [
  { id: 101, title: 'Latest: New Feature Launched' },
  { id: 102, title: 'Latest: Bug Fixes Deployed' },
  { id: 103, title: 'Latest: Community Meetup' },
]

const HomePage: NextPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-[3fr_1fr] gap-8 py-12 px-4">
        {/* Center: list of PostCards */}
        <main className="space-y-8">
          {POSTS.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              descriptionText={post.descriptionText}
              descriptionImageSrc={post.descriptionImageSrc}
              commentsCount={post.commentsCount}
              status={post.status}
            />
          ))}
        </main>

        {/* Right sidebar: latest posts */}
        <aside className="border-l border-gray-700 pl-6">
          <h3 className="text-xl font-semibold mb-4">Latest Posts</h3>
          <ul className="space-y-2">
            {LATEST.map((item) => (
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
      </div>
    </div>
  )
}

export default HomePage
