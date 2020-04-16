# Amazonian Async
### This was created during my time as a [Code Chrysalis](https://codechrysalis.io) Student

この課題は、読み物と課題のチャレンジの２つのパートに分かれています：

1. パート 1 - 非同期 JavaScript について読む
2. パート 2 - Promise と async / await を使用して、 Amazonian の課題を解く

# パート 1 - 非同期 JavaScript

## レッスンの目的

このパートを完了すると、次のことが理解できるようになります：

- 非同期呼び出しを扱う必要がある理由
- コールバックの使い方
- Promise の使い方
- async / await の使い方

## バックグラウンド

同期処理の実行中に、処理を抽象化するために高階関数がどのように役立つかすでに見てきましたが、高階関数の最も重要なケースは、_非同期処理_ を扱うときです。

### なぜ、非同期処理を扱うことが重要なのか？

JavaScript はシングルスレッドで動作する言語であるため、一度に 1 つのことしかできません。長時間の実行では、[同期とブロッキング](https://github.com/codechrysalis/students/wiki/Synchronous-and-Blocking)で説明されているパフォーマンスの問題が発生します。これは、アプリケーションが非同期処理に依存している場合に問題となる場合があります。

開発者が JavaScript の非同期処理のコードを扱う最も一般的なケースは、アプリケーションプログラミングインターフェイス（API） を使用する場合です。サーバを学習するときに独自の API を構築し、サードパーティーの API を扱うことも今後学習する予定です。

一般的に、API はさまざまなコンポーネント間で明確に定義された通信方法のまとまりです。 API は**リクエストを受け取り**（例：「天気は？」）、**レスポンスを送信します**（「22 ℃ です！」）。

この通信には時間がかかる場合があります。また、他のコードがリクエストに対するレスポンスに依存している場合、問題が起こる可能性があります。そのため、JavaScript にはこの状況に対処する方法が用意されています。

### 非同期処理を扱わない方法

以下に、非同期処理のコードを扱う 3 つの事例を示します。これらの例では、実際には API を使用していないため、[setTimeout](https://developer.mozilla.org/ja/docs/Web/API/WindowTimers/setTimeout) を使用して遅延を発生させています。このメソッドは、関数と数値（`n`）の 2 つの引数を持ちます。次に、`n` ミリ秒後に関数を呼び出します。

何をすべきかを示す前に、やってはいけないことを以下に示します。以下の関数を見てみましょう。3 秒後に結果が返されるはずです。コードをコンソールに貼り付けて実行するとどうなりますか？

```JavaScript
function getCoffee(num) {
  setTimeout(() => {
    if (typeof num === "number") {
      return `Here are your ${num} coffees!`;
    } else {
      return `${num} is not a number!`;
    }
  }, 3000);
}

console.log(getCoffee(2));
console.log(getCoffee("butterfly"));
```

`undefined`を返します。`getCoffee()`がレスポンスを受け取る前に、 `console.log()`が実行されました。これは想定外の結果であり、問題ですね。

## オプション 1：コールバック

ES6 より以前は、非同期処理のコードはコールバックを介して処理されていました。

以下の例では、`getCoffeeCallback` は、コーヒーの数とコールバック関数を引数に持つ関数として定義されています。さらに、このコールバック関数は `error` と `result` の 2 つの引数を持ちます。リクエストの成否に応じて、結果もしくはエラーの場合に呼び出されるコールバック関数（その他の引数は null）を返します。

コンソールで、以下のコードを実行してみましょう！

```JavaScript
function getCoffeeCallback(num, func) {
  setTimeout(() => {
    if (typeof num === "number") {
      return func(`Here are your ${num} coffees!`, null);
    } else {
      return func(null, `${num} is not a number!`);
    }
  }, 3000);
}

getCoffeeCallback(2, (error, result) => console.log(error ? error : result));

getCoffeeCallback("butterfly", (error, result) => console.log(error ? error : result));
```

今回のコードは `undefined` を返しません。どうしてでしょうか？その理由は、[イベントループ](https://www.youtube.com/watch?v=8aGhZQkoFbQ)と呼ばれるもののおかげです。結論から言うと、`getCoffeeCallback` に渡された関数がキューに追加されました。JavaScript のイベントループはそのキューと連携して、適切なタイミングでコールバック関数を実行します。

もう 1 つの例を見てみましょう。以前に、`readFileSync` を使用してファイルを同期的に読み込んだことを覚えていますか？ファイルの読み取りは長時間の処理となる _可能性がある_ ため、Node は同期と非同期の両方の実装を提供しています。非同期のバージョンは `readFile` になります。

```js
const fs = require("fs");

const result = fs.readFile("index.js", "utf8");
console.log(result);
```

`readFile` を使用すると、結果として `undefined` が得られます。

[Node.js ドキュメント - fs.readFile()](https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback) をチェックすると、その理由がわかります：`readFile` には `error` パラメータと `result` パラメータを渡すコールバック関数が 3 番目のパラメータとして必要です。

`getCoffeeCallback` 関数と同じように、必要な引数（コールバック関数！）を渡しましょう。

```JavaScript
const fs = require('fs');

fs.readFile('index.js', 'utf8', (error, result) => console.log(error, result));
```

わーい！動きましたね。

## オプション 2： Promise

ES6 では、非同期処理を行うために、非常に優れた方法を標準化しました。

以下のリファクタリングされたコードを見てましょう。高階関数 `getCoffeePromise` は、`getCoffeeCallback` 関数とほとんど同じに見えると気付くでしょう。ただし、今回はコールバック関数を渡さずに、`Promise`（`new` キーワードで作成）を返します。この Promise には、2 つの引数（`resolve` と呼ばれる関数と `reject` と呼ばれる関数）を持つ関数が渡されます。

`getCoffeePromise` の呼び出し方も少し異なります。コールバック関数を渡さない代わりに、別の方法でレスポンスを処理する必要があります。つまり、`.then()`と `.catch()`をチェーンさせる必要があります。

- `.then()` は、`resolve` 関数に渡されたものをすべて出力します。
- `.catch()` は、`reject` 関数に渡されたものをすべて出力します。

コンソールで、以下のコードを実行してみましょう！

```JavaScript
function getCoffeePromise (num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof num === "number") {
        resolve(`Here are your ${num} coffees!`);
      } else {
        reject(`${num} is not a number!`);
      }
    }, 3000);
  });
};

getCoffeePromise(2).then(result => console.log(result)).catch(error => console.log(error));

getCoffeePromise("butterfly")
  .then(result => console.log(result))
  .catch(error => console.log(error));
```

注：Promise を呼び出す場合、最初の例のように 1 行で記述することも、2 番目の例のように改行して次の行に記述することもできます。2 番目の例のように改行して次の行に記述する場合は、チェーンの間にスペース、コメント、セミコロンを追加しないようにしましょう！

[Promise](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise) の詳細については、こちらを参照してください。

## オプション 3：async / await

ES7 では、Promise の構文に別のアップグレードが提供されました。

仕組みは次のとおりです。

1. `async` キーワードを使用して、`getCoffeeAsync` を非同期関数として定義します。
2. これにより、後で `await` キーワードを使用して、定義した非同期関数を呼び出すことができます。
3. `await` キーワードの次の行の処理は、`await` 行の処理が終了（解決）するまで _待機します_。
4. `try` および `catch` キーワードを使用して、非同期処理の成功と失敗をハンドリングすることができます。

このアップグレードのすばらしい点は、`await` キーワードにあります。通常、コールバックまたはチェーンされた Promise メソッドの外部で `console.log()` を書き込むと、`undefined` が返されます。一方で、`await` キーワードは、非同期処理が解決されるまでコードの実行を**停止**するため、上述の問題は発生しません！

それでは、以下のコードをブラウザで試してみてください！

```JavaScript
const getCoffeeAsync = async function(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof num === "number") {
         resolve(`Here are your ${num} coffees!`);
      } else {
        reject(`${num} is not a number!`);
      }
    }, 3000);
  });
}

const start = async function(num) {
  try {
    const result = await getCoffeeAsync(num);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

start(2);
start("butterfly");
```

注：この例では、`getCoffeeAsync` 関数内で、まだ Promise を返していることに気付くでしょう。残念ながら、`setTimeout` は明示的に async/await をまだサポートしていません！そのため、上記のようなラッパーを用意してコードを引き続き動作させる必要があります。

[Async/Await](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function) の詳細については、こちらを参照してください。

## 3 つの方法（コールバック、Promise、async/await）の比較

[Pokemon API](https://pokeapi.co/) に対して同じリクエストを行うために、非同期 JavaScript を処理する 3 つの方法がどのように活用されるか見てみましょう。

Pokemon の API 呼び出しを行うには、[XMLHttpRequest](https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest)（コールバックを使用）、または、[Fetch](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)（Promises を使用）を使います。

それでは、ブラウザでテストしてみましょう！

### 1.コールバック

```JavaScript
function request(callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://pokeapi.co/api/v2/ability/4/", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      (function(response) {
        callback(JSON.parse(response));
      })(xhr.responseText);
    } else {
      callback(xhr.status);
    }
  };
  xhr.send();
}
request((error, result) => console.log(error ? error : result));
```

### 2. Promise

```JavaScript
fetch("https://pokeapi.co/api/v2/ability/4/")
  .then(response => response.json())
  .then(jsonResponse => console.log(jsonResponse))
  .catch(error => console.log(error));
```

### 3. Async / Await

```JavaScript
async function request() {
  const response = await fetch("https://pokeapi.co/api/v2/ability/4/");
  const jsonResponse = await response.json();
  console.log(jsonResponse);
}
request();
```

それぞれの方法には、ちょっとした違いがあるように見えます。どうしてでしょうか？

これらのリクエストでは、JSON をレスポンスとして返しますが、これらのレスポンス処理には時間がかかります。これは、多くの API で一般的なことです。

1. 最初の例では、プロセスに対して別のコールバック関数を返します。これを処理するには、すぐに呼び出される無名関数にレスポンスを渡し、その結果に対して `JSON.parse()` を呼び出し実行します。

2. 後の 2 つの例では、別の Promise を返します！これを処理するには、前の Promise からのレスポンスに対して `.json()` というメソッドを呼び出します。次に、別の `.then()` メソッドをチェーンするか、別の `await` を使用して結果を取得します。

将来、API を使用する場合には、おそらく JSON を扱う必要があるので、`.json()` メソッドを覚えておくようにしましょう！

## どれを使うべきなのか

場合によっては、コールバックを使用する必要が出てきます。ただし、可能な限り async/await または Promise を使用するようにしましょう。JavaScript の構文は、妥当な理由があってアップグレードされていきます！

お疲れさまでした！さあ、それでは今まで学んだことを次のパートで確認しましょう。

# パート 2 - Amazonian のチャレンジ

## セットアップ

- `yarn` による依存パッケージをインストール
- `yarn test` によるテストの実行

## 概要

非同期 JavaScript の理解度をテストしましょう！この課題では、あなたが、ユーザーが製品を購入して評価できるオンラインショップ、 Amazonian で働くために雇われたと想定しましょう。

Amazonian では、データをリレーショナル形式で `.json` ファイルに保存します：

- products
- users
- reviews

各ファイルは、`id` とデータを持つデータベーステーブルを表します。

あなたの仕事は、次に示すフォーマットにこれらの 3 つのテーブルを”結合”することです。

```js
{
    productName: product.name,
    username: user.username,
    text: review.text,
    rating: review.rating
}
```

[ReviewBuilder.js](ReviewBuilder.js)を確認してください。ここには 4 つの方法があります：

- 同期処理によるソリューション
- 3 つの非同期処理によるソリューション：
  1. コールバックを使用する
  2. Promise の使用（未完成）
  3. async＆await の使用（未完成）

buildReviewsSync の同期処理による実装は既に完了しています。メソッドとして、`fs.readFileSync` を使用していることに注意してください。

既に実装済みのコールバックによる実装では、データを非同期で返す `fs.readFile` を使用しています。`fs.readFile` の使い方については、[Node ドキュメント](https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback)を参照してください。

## 基礎レベル

1. [ ] `ReviewBuilder.js` および `helpers/index.js` ファイルのソースコードを読んでみましょう。

   - すでに実装済みの 2 つのソリューションで何が起こなわれているのか理解しましょう。
   - また、ヘルパーファイルのソースコードの内容を必ず理解しましょう。実装する必要がある 2 つのメソッドでそれらを使用する必要があります。
   - 各行で何が起こなわれているか理解するために、擬似コードを作成してみましょう！

1. [ ] `buildReviewsPromises` メソッドを実装しましょう。
1. [ ] `buildReviewsAsyncAwait` メソッドを実装しましょう。
