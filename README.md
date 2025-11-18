# 個人用MBOシステム

将来の拡張可能性を持った個人用MBO（目標管理）システムです。

## 特徴

- **React 18 + TypeScript 5** - モダンな開発環境
- **TailwindCSS** - 柔軟なスタイリング
- **ローカルストレージ** - データ永続化
- **等級システム対応** - 7段階資格等級 + 11段階役割等級

## 等級システム

### 資格等級（7段階）
- TM1: テクニカルメンバー1
- TM2: テクニカルメンバー2
- L1: リード1
- L2: リード2
- L3: リード3
- M: マネージャー
- SM: シニアマネージャー

### 役割等級（11段階）
- TM1-1～TM1-3: テクニカルメンバー1の細分化
- TM2-1～TM2-3: テクニカルメンバー2の細分化
- L1-1～L1-5: リード1の細分化

## ディレクトリ構造

```
personal-mbo-system/
├── src/
│   ├── components/     # UIコンポーネント
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   └── ProfileSetup.tsx
│   ├── types/          # TypeScript型定義
│   │   ├── grade.ts
│   │   ├── mbo.ts
│   │   └── index.ts
│   ├── utils/          # ユーティリティ関数
│   │   ├── localStorage.ts
│   │   ├── dateUtils.ts
│   │   └── idGenerator.ts
│   ├── data/           # マスタデータ
│   │   └── gradeMaster.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## 機能

### 現在実装されている機能
- ✅ プロフィール設定（名前、等級情報）
- ✅ 等級マスタデータ管理
- ✅ ローカルストレージでのデータ永続化
- ✅ レスポンシブデザイン

### 今後実装予定の機能
- 🔲 目標（Objective）の作成・編集・削除
- 🔲 主要成果（Key Result）の管理
- 🔲 進捗トラッキング
- 🔲 評価機能
- 🔲 等級変更履歴
- 🔲 データエクスポート/インポート
- 🔲 グラフ・チャートでの可視化

## 拡張性

このシステムは以下の拡張に対応しています：

1. **等級システムの拡張**
   - `src/types/grade.ts` で新しい等級を追加
   - `src/data/gradeMaster.ts` でマスタデータを更新

2. **新機能の追加**
   - `src/components/` に新しいコンポーネントを追加
   - `src/types/` に必要な型定義を追加

3. **データストレージの変更**
   - `src/utils/localStorage.ts` を変更することで、バックエンドAPIへの切り替えも可能

## ライセンス

MIT