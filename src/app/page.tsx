'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import SearchFilters from '@/components/SearchFilters'
import StoreCard from '@/components/StoreCard'
import StoreDetail from '@/components/StoreDetail'
import type { StoreWithReview, SearchFilters as FilterType, Genre } from '@/types'

// Leafletはクライアントサイドのみ
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="spinner"></div>
      <span className="ml-2 text-gray-600">地図を読み込み中...</span>
    </div>
  ),
})

// サンプルデータ（Supabase接続前のテスト用）
const SAMPLE_STORES: StoreWithReview[] = [
  {
    id: 1,
    name: 'パティスリー SATSUKI',
    genre: 'スイーツ',
    address: '東京都千代田区紀尾井町4-1 ホテルニューオータニ',
    latitude: 35.6812,
    longitude: 139.7344,
    phone: '03-3221-2245',
    business_hours: '11:00〜20:00',
    google_rating: 4.2,
    google_place_id: null,
    google_maps_url: null,
    created_at: '',
    updated_at: '',
    reviews: [
      {
        id: 1,
        store_id: 1,
        youtube_video_id: 'SAMPLE_VIDEO_ID',
        rating: 'good',
        menu_items: ['スーパーエクストラメロンショートケーキ'],
        review_summary: '高いけど、高いなりの美味しさ。特別な日に行く価値あり。',
        transcript: null,
        video_title: 'ホテルニューオータニのメロンショートケーキを正直レビュー',
        thumbnail_url: null,
        published_at: null,
        created_at: '',
      },
    ],
  },
  {
    id: 2,
    name: 'リラックマ茶房 嵐山店',
    genre: 'カフェ',
    address: '京都府京都市右京区嵯峨天龍寺造路町',
    latitude: 35.0145,
    longitude: 135.6722,
    phone: null,
    business_hours: '10:00〜18:00',
    google_rating: 4.0,
    google_place_id: null,
    google_maps_url: null,
    created_at: '',
    updated_at: '',
    reviews: [
      {
        id: 2,
        store_id: 2,
        youtube_video_id: 'SAMPLE_VIDEO_ID_2',
        rating: 'neutral',
        menu_items: ['リラックマパフェ', '抹茶ラテ'],
        review_summary: 'キャラクターは可愛いけど、味は普通。インスタ映え目的なら◎',
        transcript: null,
        video_title: '京都嵐山の食べ歩きスイーツを正直レビュー',
        thumbnail_url: null,
        published_at: null,
        created_at: '',
      },
    ],
  },
  {
    id: 3,
    name: '某チェーン店',
    genre: 'スイーツ',
    address: '東京都渋谷区',
    latitude: 35.6595,
    longitude: 139.7004,
    phone: null,
    business_hours: null,
    google_rating: 3.5,
    google_place_id: null,
    google_maps_url: null,
    created_at: '',
    updated_at: '',
    reviews: [
      {
        id: 3,
        store_id: 3,
        youtube_video_id: 'SAMPLE_VIDEO_ID_3',
        rating: 'bad',
        menu_items: ['季節限定パフェ'],
        review_summary: '値段の割にボリュームが少ない。正直おすすめしない。',
        transcript: null,
        video_title: '話題の季節限定スイーツを正直レビュー',
        thumbnail_url: null,
        published_at: null,
        created_at: '',
      },
    ],
  },
]

const SAMPLE_GENRES: Genre[] = [
  { id: 1, name: 'スイーツ', icon: '🍰' },
  { id: 2, name: 'カフェ', icon: '☕' },
  { id: 3, name: 'ラーメン', icon: '🍜' },
  { id: 4, name: '焼肉', icon: '🥩' },
  { id: 5, name: '寿司', icon: '🍣' },
]

export default function HomePage() {
  const [stores, setStores] = useState<StoreWithReview[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<StoreWithReview | null>(null)
  const [detailStore, setDetailStore] = useState<StoreWithReview | null>(null)
  const [filters, setFilters] = useState<FilterType>({
    keyword: '',
    genre: '',
    rating: '',
    area: '',
  })

  // データ取得
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        
        // 店舗とレビューを取得
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select(`
            *,
            reviews (*)
          `)
          .order('created_at', { ascending: false })

        if (storesError) {
          console.error('Stores fetch error:', storesError)
          // エラー時はサンプルデータを使用
          setStores(SAMPLE_STORES)
        } else if (storesData && storesData.length > 0) {
          setStores(storesData as StoreWithReview[])
        } else {
          // データがない場合はサンプルデータ
          setStores(SAMPLE_STORES)
        }

        // ジャンル取得
        const { data: genresData, error: genresError } = await supabase
          .from('genres')
          .select('*')
          .order('name')

        if (genresError || !genresData || genresData.length === 0) {
          setGenres(SAMPLE_GENRES)
        } else {
          setGenres(genresData)
        }
      } catch (error) {
        console.error('Data fetch error:', error)
        // 接続エラー時はサンプルデータ
        setStores(SAMPLE_STORES)
        setGenres(SAMPLE_GENRES)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // フィルタリング
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      // キーワード
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase()
        const matchName = store.name.toLowerCase().includes(keyword)
        const matchGenre = store.genre?.toLowerCase().includes(keyword)
        const matchMenu = store.reviews?.some((r) =>
          r.menu_items?.some((m) => m.toLowerCase().includes(keyword))
        )
        const matchSummary = store.reviews?.some((r) =>
          r.review_summary?.toLowerCase().includes(keyword)
        )
        if (!matchName && !matchGenre && !matchMenu && !matchSummary) {
          return false
        }
      }

      // ジャンル
      if (filters.genre && store.genre !== filters.genre) {
        return false
      }

      // 評価
      if (filters.rating) {
        const rating = store.reviews?.[0]?.rating
        if (rating !== filters.rating) {
          return false
        }
      }

      // エリア
      if (filters.area && !store.address?.includes(filters.area)) {
        return false
      }

      return true
    })
  }, [stores, filters])

  const handleStoreClick = useCallback((store: StoreWithReview) => {
    setSelectedStore(store)
  }, [])

  const handleStoreDetailOpen = useCallback((store: StoreWithReview) => {
    setDetailStore(store)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 検索フィルター */}
      <div className="mb-4">
        <SearchFilters
          filters={filters}
          onFilterChange={setFilters}
          genres={genres}
          resultCount={filteredStores.length}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 地図 */}
        <div className="lg:col-span-3 map-container h-[400px] lg:h-[600px] rounded-lg overflow-hidden shadow-sm">
          <Map
            stores={filteredStores.filter((s) => s.latitude && s.longitude)}
            selectedStore={selectedStore}
            onSelectStore={handleStoreDetailOpen}
          />
        </div>

        {/* 店舗リスト */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto">
          {filteredStores.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              <span className="text-4xl block mb-2">🔍</span>
              <p>該当する店舗が見つかりませんでした</p>
              <p className="text-sm mt-1">条件を変更して検索してください</p>
            </div>
          ) : (
            filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => handleStoreDetailOpen(store)}
                isSelected={selectedStore?.id === store.id}
              />
            ))
          )}
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">📌 マーカーの見方</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-green-500 rounded-full text-center text-white text-xs leading-6">👍</span>
            <span>良い評価</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-yellow-400 rounded-full text-center text-white text-xs leading-6">👌</span>
            <span>普通</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-red-500 rounded-full text-center text-white text-xs leading-6">👎</span>
            <span>悪い評価</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-6 bg-gray-400 rounded-full text-center text-white text-xs leading-6">❓</span>
            <span>評価不明</span>
          </div>
        </div>
      </div>

      {/* 店舗詳細モーダル */}
      {detailStore && (
        <StoreDetail store={detailStore} onClose={() => setDetailStore(null)} />
      )}
    </div>
  )
}
