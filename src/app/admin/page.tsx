'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { StoreWithReview, Genre } from '@/types'

type TabType = 'stores' | 'reviews' | 'add'

interface NewStore {
  name: string
  genre: string
  address: string
  latitude: string
  longitude: string
  phone: string
  business_hours: string
  google_rating: string
}

interface NewReview {
  store_id: string
  youtube_video_id: string
  rating: string
  menu_items: string
  review_summary: string
  video_title: string
}

const INITIAL_STORE: NewStore = {
  name: '',
  genre: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  business_hours: '',
  google_rating: '',
}

const INITIAL_REVIEW: NewReview = {
  store_id: '',
  youtube_video_id: '',
  rating: 'unknown',
  menu_items: '',
  review_summary: '',
  video_title: '',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stores')
  const [stores, setStores] = useState<StoreWithReview[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [newStore, setNewStore] = useState<NewStore>(INITIAL_STORE)
  const [newReview, setNewReview] = useState<NewReview>(INITIAL_REVIEW)
  const [isAddingStore, setIsAddingStore] = useState(true)

  const supabase = createClient()

  // データ取得
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: storesData } = await supabase
        .from('stores')
        .select('*, reviews(*)')
        .order('created_at', { ascending: false })

      const { data: genresData } = await supabase
        .from('genres')
        .select('*')
        .order('name')

      if (storesData) setStores(storesData as StoreWithReview[])
      if (genresData) setGenres(genresData)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 店舗追加
  async function handleAddStore(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    try {
      const { error } = await supabase.from('stores').insert([
        {
          name: newStore.name,
          genre: newStore.genre || null,
          address: newStore.address || null,
          latitude: newStore.latitude ? parseFloat(newStore.latitude) : null,
          longitude: newStore.longitude ? parseFloat(newStore.longitude) : null,
          phone: newStore.phone || null,
          business_hours: newStore.business_hours || null,
          google_rating: newStore.google_rating ? parseFloat(newStore.google_rating) : null,
        },
      ])

      if (error) throw error

      setMessage({ type: 'success', text: '店舗を追加しました！' })
      setNewStore(INITIAL_STORE)
      fetchData()
    } catch (error: any) {
      setMessage({ type: 'error', text: `エラー: ${error.message}` })
    }
  }

  // レビュー追加
  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          store_id: parseInt(newReview.store_id),
          youtube_video_id: newReview.youtube_video_id,
          rating: newReview.rating,
          menu_items: newReview.menu_items
            ? newReview.menu_items.split(',').map((s) => s.trim())
            : null,
          review_summary: newReview.review_summary || null,
          video_title: newReview.video_title || null,
        },
      ])

      if (error) throw error

      setMessage({ type: 'success', text: 'レビューを追加しました！' })
      setNewReview(INITIAL_REVIEW)
      fetchData()
    } catch (error: any) {
      setMessage({ type: 'error', text: `エラー: ${error.message}` })
    }
  }

  // 店舗削除
  async function handleDeleteStore(id: number) {
    if (!confirm('この店舗を削除しますか？関連するレビューも削除されます。')) return

    try {
      // 関連レビューを先に削除
      await supabase.from('reviews').delete().eq('store_id', id)
      // 店舗を削除
      const { error } = await supabase.from('stores').delete().eq('id', id)
      if (error) throw error

      setMessage({ type: 'success', text: '店舗を削除しました' })
      fetchData()
    } catch (error: any) {
      setMessage({ type: 'error', text: `エラー: ${error.message}` })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🔧 管理画面</h1>

      {/* メッセージ */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* タブ */}
      <div className="flex border-b mb-6">
        {[
          { key: 'stores', label: '🏪 店舗一覧' },
          { key: 'add', label: '➕ 新規追加' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab.key
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 店舗一覧 */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : stores.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              <p>まだ店舗が登録されていません</p>
              <button
                onClick={() => setActiveTab('add')}
                className="mt-2 text-red-600 hover:underline"
              >
                新規追加する →
              </button>
            </div>
          ) : (
            stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-sm border p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{store.name}</h3>
                    <p className="text-sm text-gray-600">
                      {store.genre} | {store.address || '住所未設定'}
                    </p>
                    {store.reviews && store.reviews.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          評価: {store.reviews[0].rating}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          Video ID: {store.reviews[0].youtube_video_id}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteStore(store.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️ 削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 新規追加 */}
      {activeTab === 'add' && (
        <div>
          {/* 追加タイプ切り替え */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsAddingStore(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isAddingStore
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏪 店舗を追加
            </button>
            <button
              onClick={() => setIsAddingStore(false)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !isAddingStore
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎬 レビューを追加
            </button>
          </div>

          {/* 店舗追加フォーム */}
          {isAddingStore ? (
            <form onSubmit={handleAddStore} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">新しい店舗を追加</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: パティスリー SATSUKI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                <select
                  value={newStore.genre}
                  onChange={(e) => setNewStore({ ...newStore, genre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="">選択してください</option>
                  {genres.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.icon} {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <input
                  type="text"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: 東京都千代田区紀尾井町4-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">緯度</label>
                  <input
                    type="text"
                    value={newStore.latitude}
                    onChange={(e) => setNewStore({ ...newStore, latitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="例: 35.6812"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">経度</label>
                  <input
                    type="text"
                    value={newStore.longitude}
                    onChange={(e) => setNewStore({ ...newStore, longitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="例: 139.7344"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                💡 緯度経度は <a href="https://www.google.co.jp/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a> で店舗を右クリック → 座標をコピーで取得できます
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input
                  type="text"
                  value={newStore.phone}
                  onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: 03-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">営業時間</label>
                <input
                  type="text"
                  value={newStore.business_hours}
                  onChange={(e) => setNewStore({ ...newStore, business_hours: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: 11:00〜20:00"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition"
              >
                店舗を追加
              </button>
            </form>
          ) : (
            /* レビュー追加フォーム */
            <form onSubmit={handleAddReview} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">新しいレビューを追加</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  店舗 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newReview.store_id}
                  onChange={(e) => setNewReview({ ...newReview, store_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="">店舗を選択</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newReview.youtube_video_id}
                  onChange={(e) => setNewReview({ ...newReview, youtube_video_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: dQw4w9WgXcQ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  youtube.com/shorts/<strong>VIDEO_ID</strong> の部分
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  評価 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="unknown">❓ 不明</option>
                  <option value="good">👍 良い</option>
                  <option value="neutral">👌 普通</option>
                  <option value="bad">👎 悪い</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">動画タイトル</label>
                <input
                  type="text"
                  value={newReview.video_title}
                  onChange={(e) => setNewReview({ ...newReview, video_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: 話題のスイーツを正直レビュー"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  紹介メニュー（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={newReview.menu_items}
                  onChange={(e) => setNewReview({ ...newReview, menu_items: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例: メロンショート, 抹茶ケーキ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">レビュー要約</label>
                <textarea
                  value={newReview.review_summary}
                  onChange={(e) => setNewReview({ ...newReview, review_summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="例: 値段は高いけど、味は本格的。特別な日におすすめ。"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition"
              >
                レビューを追加
              </button>
            </form>
          )}
        </div>
      )}

      {/* ヘルプ */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">💡 使い方のヒント</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. まず「店舗を追加」で店舗情報を登録します</li>
          <li>2. 次に「レビューを追加」でYouTube動画とレビュー内容を紐付けます</li>
          <li>3. 緯度経度はGoogle Mapsで店舗を右クリックするとコピーできます</li>
          <li>4. より詳細な編集は <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a> で行えます</li>
        </ul>
      </div>
    </div>
  )
}
