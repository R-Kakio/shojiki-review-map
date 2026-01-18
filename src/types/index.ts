// 店舗情報
export interface Store {
  id: number;
  name: string;
  genre: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  business_hours: string | null;
  google_rating: number | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
}

// レビュー動画
export interface Review {
  id: number;
  store_id: number;
  youtube_video_id: string;
  rating: 'good' | 'neutral' | 'bad' | 'unknown';
  menu_items: string[] | null;
  review_summary: string | null;
  transcript: string | null;
  video_title: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
}

// 店舗 + レビュー結合
export interface StoreWithReview extends Store {
  reviews: Review[];
}

// ジャンル
export interface Genre {
  id: number;
  name: string;
  icon: string | null;
}

// 検索フィルター
export interface SearchFilters {
  keyword: string;
  genre: string;
  rating: string;
  area: string;
}

// マップ上のマーカー
export interface MapMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  rating: 'good' | 'neutral' | 'bad' | 'unknown';
  genre: string | null;
}
