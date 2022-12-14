#!/usr/bin/env sh

# エラー時は停止
set -e

# ビルド
npm run build

# ビルド出力ディレクトリに移動
cd docs

# Jekyll の処理をバイパスするために .nojekyll を配置
echo > .nojekyll

# カスタムドメインにデプロイする場合
# echo 'www.example.com' > CNAME

git init
git checkout -B main
git add -A
git commit -m 'deploy'

# https://<USERNAME>.github.io にデプロイする場合
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git main

# https://<USERNAME>.github.io/<REPO> にデプロイする場合
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

# https://bu-tanaka-fumiya.github.io/jst-chart-demo にデプロイ
git push -f git@github.com:bu-tanaka-fumiya/jst-chart-demo.git main:gh-pages

cd -
