-- =============================================
-- 正直レビューマップ データベーススキーマ
-- Supabase SQL Editor で実行してください
-- =============================================

-- ジャンルマスタ
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50)
);

-- 初期ジャンルデータ
INSERT INTO genres (name, icon) VALUES
  ('スイーツ', '🍰'),
  ('カフェ', '☕'),
  ('ラーメン', '🍜'),
  ('焼肉', '🥩'),
  ('寿司', '🍣'),
  ('イタリアン', '🍝'),
  ('中華', '🥟'),
  ('和食', '🍱'),
  ('パン', '🥐'),
  ('ファストフード', '🍔')
ON CONFLICT (name) DO NOTHING;

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  business_hours TEXT,
  google_rating DECIMAL(2, 1),
  google_place_id VARCHAR(255),
  google_maps_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レビュー動画テーブル
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  youtube_video_id VARCHAR(50) NOT NULL,
  rating VARCHAR(20) DEFAULT 'unknown' CHECK (rating IN ('good', 'neutral', 'bad', 'unknown')),
  menu_items TEXT[],
  review_summary TEXT,
  transcript TEXT,
  video_title TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, youtube_video_id)
);

-- インデックス（検索高速化）
CREATE INDEX IF NOT EXISTS idx_stores_genre ON stores(genre);
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON reviews(store_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stores_updated_at ON stores;
CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) の設定
-- 読み取りは全員可能、書き込みは認証ユーザーのみ

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能
CREATE POLICY "Public read access" ON stores
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON genres
  FOR SELECT USING (true);

-- 認証ユーザーは全ての操作が可能
CREATE POLICY "Authenticated users can insert" ON stores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON stores
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON stores
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON reviews
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON reviews
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- サンプルデータ（テスト用・削除可能）
-- =============================================

INSERT INTO stores (name, genre, address, latitude, longitude, phone, business_hours, google_rating) VALUES
  ('パティスリー SATSUKI', 'スイーツ', '東京都千代田区紀尾井町4-1 ホテルニューオータニ', 35.6812, 139.7344, '03-3221-2245', '11:00〜20:00', 4.2),
  ('リラックマ茶房 嵐山店', 'カフェ', '京都府京都市右京区嵯峨天龍寺造路町', 35.0145, 135.6722, NULL, '10:00〜18:00', 4.0)
ON CONFLICT DO NOTHING;

INSERT INTO reviews (store_id, youtube_video_id, rating, menu_items, review_summary, video_title) VALUES
  (1, 'SAMPLE_VIDEO_1', 'good', ARRAY['スーパーエクストラメロンショートケーキ'], '高いけど、高いなりの美味しさ。特別な日に行く価値あり。', 'ホテルニューオータニのメロンショートケーキを正直レビュー'),
  (2, 'SAMPLE_VIDEO_2', 'neutral', ARRAY['リラックマパフェ', '抹茶ラテ'], 'キャラクターは可愛いけど、味は普通。インスタ映え目的なら◎', '京都嵐山の食べ歩きスイーツを正直レビュー')
ON CONFLICT DO NOTHING;
