import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '正直レビューマップ',
  description: 'YouTube「正直レビュー」で紹介されたお店をマップで探せるサイト',
  openGraph: {
    title: '正直レビューマップ',
    description: 'YouTube「正直レビュー」で紹介されたお店をマップで探せるサイト',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <span className="text-2xl">🍰</span>
                <h1 className="text-xl font-bold text-gray-800">
                  正直レビューマップ
                </h1>
              </a>
              <nav className="flex items-center gap-4">
                <a
                  href="https://www.youtube.com/@shojiki_sweets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-red-600 transition"
                >
                  📺 YouTubeチャンネル
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-white border-t mt-8 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>
              このサイトはYouTube「
              <a
                href="https://www.youtube.com/@shojiki_sweets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:underline"
              >
                正直レビュー
              </a>
              」のファンサイトです。
            </p>
            <p className="mt-1">
              評価は動画内での発言に基づいており、公式な評価ではありません。
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
