'use client'

import { useState, useCallback } from 'react'
import type { SearchFilters, Genre } from '@/types'

interface SearchFiltersProps {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
  genres: Genre[]
  resultCount: number
}

const ratingOptions = [
  { value: '', label: '全ての評価' },
  { value: 'good', label: '👍 良い' },
  { value: 'neutral', label: '👌 普通' },
  { value: 'bad', label: '👎 悪い' },
]

const areaOptions = [
  { value: '', label: '全国' },
  { value: '東京', label: '東京' },
  { value: '大阪', label: '大阪' },
  { value: '京都', label: '京都' },
  { value: '神奈川', label: '神奈川' },
  { value: '愛知', label: '愛知' },
  { value: '福岡', label: '福岡' },
  { value: '北海道', label: '北海道' },
  { value: '沖縄', label: '沖縄' },
]

export default function SearchFiltersComponent({
  filters,
  onFilterChange,
  genres,
  resultCount,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = useCallback(
    (key: keyof SearchFilters, value: string) => {
      onFilterChange({ ...filters, [key]: value })
    },
    [filters, onFilterChange]
  )

  const handleReset = useCallback(() => {
    onFilterChange({
      keyword: '',
      genre: '',
      rating: '',
      area: '',
    })
  }, [onFilterChange])

  const hasActiveFilters =
    filters.keyword || filters.genre || filters.rating || filters.area

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* キーワード検索 */}
      <div className="relative">
        <input
          type="text"
          placeholder="店舗名・メニューで検索..."
          value={filters.keyword}
          onChange={(e) => handleChange('keyword', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* フィルター展開ボタン（モバイル） */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full mt-2 py-2 text-sm text-gray-600 flex items-center justify-center gap-1"
      >
        <span>絞り込み</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* フィルターオプション */}
      <div className={`
        mt-3 grid gap-3
        md:grid-cols-3
        ${isExpanded ? 'grid' : 'hidden md:grid'}
      `}>
        {/* ジャンル */}
        <select
          value={filters.genre}
          onChange={(e) => handleChange('genre', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
        >
          <option value="">全てのジャンル</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.name}>
              {genre.icon} {genre.name}
            </option>
          ))}
        </select>

        {/* 評価 */}
        <select
          value={filters.rating}
          onChange={(e) => handleChange('rating', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
        >
          {ratingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* エリア */}
        <select
          value={filters.area}
          onChange={(e) => handleChange('area', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
        >
          {areaOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 結果数とリセット */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          検索結果: <span className="font-bold text-red-600">{resultCount}</span> 件
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-red-600 transition"
          >
            ✕ リセット
          </button>
        )}
      </div>
    </div>
  )
}
