'use client'

import Image from 'next/image'
import type { StoreWithReview } from '@/types'

interface StoreCardProps {
  store: StoreWithReview
  onClick: () => void
  isSelected: boolean
}

const ratingConfig = {
  good: { emoji: '👍', label: '良い', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  neutral: { emoji: '👌', label: '普通', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  bad: { emoji: '👎', label: '悪い', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  unknown: { emoji: '❓', label: '不明', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
}

export default function StoreCard({ store, onClick, isSelected }: StoreCardProps) {
  const review = store.reviews?.[0]
  const rating = review?.rating || 'unknown'
  const config = ratingConfig[rating]
  
  // YouTubeサムネイル
  const thumbnailUrl = review?.thumbnail_url || 
    (review?.youtube_video_id 
      ? `https://i.ytimg.com/vi/${review.youtube_video_id}/hqdefault.jpg`
      : null)

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border-2 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-transparent hover:border-gray-200'}
      `}
    >
      <div className="flex p-3 gap-3">
        {/* サムネイル */}
        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={store.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-3xl">🏪</span>
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-800 truncate">{store.name}</h3>
            <span className={`
              flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium
              ${config.bgColor} ${config.textColor}
            `}>
              {config.emoji} {config.label}
            </span>
          </div>
          
          {store.genre && (
            <p className="text-xs text-gray-500 mt-0.5">🏷️ {store.genre}</p>
          )}
          
          {store.address && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">📍 {store.address}</p>
          )}
          
          {review?.review_summary && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {review.review_summary}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
