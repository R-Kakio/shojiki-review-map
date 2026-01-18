'use client'

import Image from 'next/image'
import type { StoreWithReview } from '@/types'

interface StoreDetailProps {
  store: StoreWithReview
  onClose: () => void
}

const ratingConfig = {
  good: { emoji: '👍', label: '良い', bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-300' },
  neutral: { emoji: '👌', label: '普通', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300' },
  bad: { emoji: '👎', label: '悪い', bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-300' },
  unknown: { emoji: '❓', label: '不明', bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300' },
}

export default function StoreDetail({ store, onClose }: StoreDetailProps) {
  const review = store.reviews?.[0]
  const rating = review?.rating || 'unknown'
  const config = ratingConfig[rating]

  // YouTube Shorts URL
  const youtubeUrl = review?.youtube_video_id
    ? `https://www.youtube.com/shorts/${review.youtube_video_id}`
    : null

  // Google Maps URL
  const googleMapsUrl =
    store.google_maps_url ||
    (store.google_place_id
      ? `https://www.google.com/maps/place/?q=place_id:${store.google_place_id}`
      : store.latitude && store.longitude
      ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}`
      : null)

  // サムネイル
  const thumbnailUrl = review?.thumbnail_url ||
    (review?.youtube_video_id
      ? `https://i.ytimg.com/vi/${review.youtube_video_id}/maxresdefault.jpg`
      : null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 truncate pr-4">
            {store.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <span className="text-xl text-gray-500">✕</span>
          </button>
        </div>

        {/* サムネイル */}
        {thumbnailUrl && (
          <div className="aspect-video w-full bg-gray-100">
            <Image
              src={thumbnailUrl}
              alt={store.name}
              width={512}
              height={288}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 本体 */}
        <div className="p-4 space-y-4">
          {/* 評価バッジ */}
          <div className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-lg border
            ${config.bgColor} ${config.borderColor}
          `}>
            <span className="text-2xl">{config.emoji}</span>
            <div>
              <div className={`font-bold ${config.textColor}`}>
                正直評価: {config.label}
              </div>
              {store.google_rating && (
                <div className="text-xs text-gray-600">
                  Google: ⭐ {store.google_rating}
                </div>
              )}
            </div>
          </div>

          {/* 基本情報 */}
          <div className="space-y-2">
            {store.genre && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">🏷️</span>
                <span>{store.genre}</span>
              </div>
            )}
            {store.address && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-400">📍</span>
                <span>{store.address}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">📞</span>
                <a href={`tel:${store.phone}`} className="text-blue-600 hover:underline">
                  {store.phone}
                </a>
              </div>
            )}
            {store.business_hours && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-400">🕐</span>
                <span className="whitespace-pre-line">{store.business_hours}</span>
              </div>
            )}
          </div>

          {/* レビュー要約 */}
          {review?.review_summary && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-bold text-gray-700 mb-1">📝 レビュー要約</h3>
              <p className="text-sm text-gray-600">{review.review_summary}</p>
            </div>
          )}

          {/* 紹介メニュー */}
          {review?.menu_items && review.menu_items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">🍴 紹介メニュー</h3>
              <div className="flex flex-wrap gap-2">
                {review.menu_items.map((item, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3 pt-2">
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold text-center transition flex items-center justify-center gap-2"
              >
                <span>▶</span>
                <span>YouTube Shortsを見る</span>
              </a>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold text-center transition flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
