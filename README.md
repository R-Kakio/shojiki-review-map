# 🍰 正直レビューマップ

YouTube「正直レビュー」で紹介されたお店をマップで探せるWebサイト

## セットアップ

### 1. Supabaseでデータベース作成

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Project Settings > API から接続情報を取得

### 2. Vercelにデプロイ

1. このリポジトリをGitHubにプッシュ
2. [Vercel](https://vercel.com) で「New Project」→ リポジトリを選択
3. Environment Variables を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. データ追加

`/admin` にアクセスして店舗・レビューを追加

## ローカル開発

```bash
npm install
cp .env.local.example .env.local
# .env.local を編集
npm run dev
```

## 技術スタック

- Next.js 14 + TypeScript + Tailwind CSS
- Leaflet + OpenStreetMap（無料）
- Supabase（無料）
- Vercel（無料）

## 費用: ¥0/月
