'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { StoreWithReview, MapMarker } from '@/types'

// 評価に応じたマーカーアイコン
const createMarkerIcon = (rating: string) => {
  const colors = {
    good: '#48BB78',
    neutral: '#ECC94B',
    bad: '#F56565',
    unknown: '#A0AEC0',
  }
  const emojis = {
    good: '👍',
    neutral: '👌',
    bad: '👎',
    unknown: '❓',
  }
  
  const color = colors[rating as keyof typeof colors] || colors.unknown
  const emoji = emojis[rating as keyof typeof emojis] || emojis.unknown

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

// マップの中心を変更するコンポーネント
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface MapProps {
  stores: StoreWithReview[]
  selectedStore: StoreWithReview | null
  onSelectStore: (store: StoreWithReview) => void
}

export default function Map({ stores, selectedStore, onSelectStore }: MapProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  // 日本の中心（東京付近）
  const defaultCenter: [number, number] = [35.6762, 139.6503]
  const defaultZoom = 11

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">地図を読み込み中...</span>
      </div>
    )
  }

  // 選択された店舗がある場合はその位置を中心に
  const center: [number, number] = selectedStore?.latitude && selectedStore?.longitude
    ? [selectedStore.latitude, selectedStore.longitude]
    : defaultCenter

  const zoom = selectedStore ? 15 : defaultZoom

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-lg"
      scrollWheelZoom={true}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => {
        if (!store.latitude || !store.longitude) return null
        
        const rating = store.reviews?.[0]?.rating || 'unknown'
        
        return (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            icon={createMarkerIcon(rating)}
            eventHandlers={{
              click: () => onSelectStore(store),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{store.genre}</p>
                {store.reviews?.[0] && (
                  <p className="text-sm">
                    {store.reviews[0].review_summary || '動画をチェック！'}
                  </p>
                )}
                <button
                  onClick={() => onSelectStore(store)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  詳細を見る →
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
