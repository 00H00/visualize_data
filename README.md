## 概要

Three.jsを用いて数値実験のデータを可視化したときのプログラム．
可視化が目的なので，htmlのデザインや実験データのフォーマットが間違っているときのエラー処理など細かいことは何もしてない．


## 使い方
1. ```#git clone https://github.com/00H00/visualize_data ```

2. ```#node node_server.js``` または ```#python server.py```

Three.jsをモジュールとして使用しているため，ローカルサーバを建てる必要がある．
 node.jsまたはpythonが必要で，node.jsを使う場合npmでモジュールをインストールする必要は**ない**．

3.  ブラウザのURLに```localhost```または```127.0.0.1```を入力

4.  実験データのファイルに```test_data1.csv``` または ```test_data2.csv``` を選択してデータを読み込む．

5.  必要に応じてダウンロードボタンを押して，画面のpngファイルを保存する．

## 注意点
Three.js（see https://github.com/mrdoob/three.js ）はそこそこ頻繁にバージョンと仕様が変わる．現在(2021/6/15）では127を使用してる．
