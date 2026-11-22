# WebImage Batch Studio

> ブラウザ完結型・画像一括リサイズ＆フォーマット変換クライアントアプリ

[![CI](https://github.com/KikumaMori/webimage-batch-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/KikumaMori/webimage-batch-studio/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/tested_with-vitest-yellow.svg)](https://vitest.dev/)

---

## 🚀 主な機能 (Features)

* **📁 ドラッグ＆ドロップ一括インポート**: 複数画像の同時選択、またはフォルダごとの直感的な読み込み。
* **⚙️ 高度なリサイズ・寸法調整**:
  * 長辺指定 / 短辺指定 / 固定幅 / 固定高さ / 比率(%)指定（拡大・縮小対応）
  * 縦横比自動維持トグル & 拡大防止（Don't Upscale）オプション
* **🔄 多彩なフォーマット変換**: WebP, JPEG, PNG（圧縮レベル 0〜9 対応）, AVIF（@jsquash/avif ハイブリッド構成）への一括変換。
* **📝 高度な一括リネーム・SEO規則**:
  * プレフィックス付き連番（`*` で位置を指定可能）
  * SEOフレンドリーな小文字化・スラッグ変換
  * 検索・置換（正規表現対応）
* **💧 ウォーターマーク（透かし）機能**: カスタムテキストのウォーターマーク付与（位置、フォントサイズ、透明度、色のカスタマイズ対応）。
* **📦 一括ダウンロード**: 処理済み画像を個別ダウンロードするか、`JSZip` を用いてワンクリックで一括ZIPアーカイブとしてダウンロード。
* **🔒 サーバー送信ゼロ**: すべての処理が端末のブラウザ内で完結するため、外部サーバーへのデータ送信はありません。

---

## 💻 セットアップ手順（ローカル環境での動かし方）

Node.js環境があれば、ローカル環境にて動作させることができます。

### 前提条件
* Node.js (推奨: v18以上)
* npm または bun

### インストール & 起動コマンド

ターミナル（コマンドプロンプト）を開き、以下のコマンドを順に実行します：

```bash
# 1. リポジトリのクローン（またはプロジェクトフォルダへ移動）
cd <project-directory>

# 2. 依存関係のインストール
npm install

# 3. 開発サーバーの起動 (ポート3000で起動します)
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスすれば、すぐにアプリが起動します。

### 自動テスト & カバレッジ実行コマンド
```bash
# 全体テストの実行
npm test

# テストカバレッジの計測
npm run test:coverage
```

### 本番ビルド確認用コマンド
```bash
# プロダクション用ビルドの作成
npm run build

# ビルド成果物のプレビュー
npm run preview
```

---

## 📖 使い方 (Usage)

1. **画像を読み込む**:
   メイン画面の中央ドロップゾーンに、変換・リサイズしたい画像をドラッグ＆ドロップします（またはクリックしてファイルを選択）。
2. **処理設定を変更する**:
   * **出力形式**: WebP、JPEG、PNG（圧縮レベル）、AVIF から選択。
   * **リサイズ設定**: 長辺・短辺・幅・高さ・比率などを設定。
   * **リネーム・SEO規則**: 連番（`*`）や文字列置換（正規表現対応）を設定。
   * **ウォーターマーク**: 必要に応じてテキストや位置を設定。

3. **変換・確認**:
   自動または手動で最適化が実行され、プレビューと圧縮前後のファイルサイズ比較が表示されます。「比較」ボタンで画質劣化をチェックできます。
4. **ダウンロード**:
   個別に保存するか、「ZIPで一括ダウンロード」ボタンでまとめて保存します。

---

## 🛠️ 技術スタック & 技術選定の理由

| カテゴリ | 技術・ライブラリ | 選定理由 |
| :--- | :--- | :--- |
| **UI Framework** | React 19 | コンポーネント指向による高い保守性と、最新のHooksを活用した効率的な状態管理。 |
| **Language** | TypeScript | 厳格な型安全性により、画像処理パラメータや設定値のバグを未然に防止。 |
| **Build Tool** | Vite | 圧倒的なビルド速度とHMRによる快適な開発体験。 |
| **Styling** | Tailwind CSS v4 | 高速かつ柔軟なユーティリティファーストのスタイリング。 |
| **Icons** | Lucide React | 洗練された軽量なモダンアイコンセット。 |
| **Image Encoding** | @jsquash/avif / pako | ブラウザが苦手なAVIFエンコードや、PNG圧縮レベル（0〜9）の可逆圧縮を実現。 |
| **File Archiving** | JSZip / FileSaver | ブラウザ内で即座にZIPファイルを生成し、ローカルへ保存。 |
| **Testing** | Vitest | 高速なユニットテスト実行による品質担保。 |

---

## 📄 ライセンス (License)

本プロジェクトの独自コードは **MIT License** のもとで公開されています（詳細は [LICENSE](./LICENSE) ）。
なお、利用している外部ライブラリ・パッケージには、それぞれのライセンスが適用されます。

---

## ✍️ 作者 (Author)

* **開発者**: MORI KIKUMA
* **GitHub**: [@KikumaMori](https://github.com/KikumaMori)
* **note**: https://note.com/morikikuma
