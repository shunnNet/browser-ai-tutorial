# 給前端的簡單 AI 教學 - 2.2 用 LLM 選擇 DOM 元素

## 前言
前一篇文章提到了如何用 LLM 選擇一個單詞後，透過單詞決定要渲染的元素（或是要執行的動作）。

這篇文章會再舉一個 prompt 的範例，讓 LLM 選擇一個 DOM 元素。

可以到 Github 看到這篇文章的[完整原始碼](https://github.com/shunnNet/browser-ai-tutorial/blob/main/03-choose-dom/index.html)

## 寫 Prompt 的一個方法
由於之後的文章才會多提一點 prompt 的相關知識，所以先在這裡給一個可以用來寫 prompt 的方法（個人見解）：

想像你是一個國中老師，要出考題給學生(GPT)：
- 題目要描述清楚
- 多提供一點細節，避免誤會
- 如果學生答不好，多給一點提示

-------------------------

## 1. 為 DOM 加上說明
你可以沿用上次的範例，或是直接使用這次的原始碼。

然後稍微在畫面加上幾個元素，`「登入」按鈕`，`「停止訂閱」按鈕`，跟一段`「說明文字」`。這三個是這一次的目標。
為了說明方便，還加上了一段 CSS。

```html
<form id="chat">
  <textarea id="input" required></textarea>
  <button type="submit">Ask</button>
</form>
<!--New part-->
<style>
.highlight {
  background-color: yellow;
}
</style>
<div>
  <button>Login</button>
  <button>Unsubscribe</button>
</div>
<section>
  Lorem
  ipsum dolor sit amet consectetur adipisicing elit. Placeat, laboriosam atque esse asperiores animi facere nihil
  amet minus vel corrupti, aliquam voluptates alias delectus est sint maiores saepe quasi iure.
</section>
```

接下來要對這三個元素加上一些資訊，我們分別為他們加上 ID，以及加上一段文字說明「這個元素的內容、作用」。

我會使用兩個標籤 `data-ai-id`, `data-ai-description`。沒有規範說一定要這樣設定，所以只要可以給出相同的資訊，標籤名稱是可以任意設置的。

```html
<!-- 點擊之後，顯示登入彈窗 -->
<button 
  data-ai-id="login-button"
  data-ai-description="The button, when clicked, can open a login popup."
>
  Login
</button>

<!-- 點擊之後，可以終止訂閱 browser-ai -->
<button
  data-ai-id="unsubscribe-button"
  data-ai-description="Clicking it will terminate users subscription of browser-ai."
>
  Unsubscribe
</button>

<!-- 描述如何在專案中安裝 browser-ai，是了解 browser-ai 的資訊 -->
<section 
  data-ai-id="usage-doc"
  data-ai-description="A section describe how to install browser-ai in user's project, a good infomation to learn browser-ai">
  ...omit...
</section>
```

## 2. 製作 prompt

### 2.1 指示
是這樣的，這次我希望 GPT 可以做到一件事：根據使用者的訊息（或是對話），選擇一個使用者可能會感興趣的 DOM元素，並把元素 ID 傳回來給我。

也就是說，
- GPT 要根據一段「內容」
- 回答我問的「問題」：一個使用者可能會感興趣的 DOM 元素
- 以指定「格式」回答我：DOM ID 

組合起來就是：請閱讀內容，遵照指定的格式，回答問題

```ts
const messages = [{
  role: "user",
  content: `Reading the content in "Content" section, and answer the question in "Question" section with strictly follow the instruction in "Format" section.`
}]
```

這邊有兩點說明一下：
第一，這次是把指示放在 `userMessage`。上一篇文章有提到，可以把一些回答的指示放在 `systemMessage` 中。但同時也提到，雖然跟放在 `systemMessage` 有些微的語意差別，但其實直接把指示放在 `userMessage` 也可以。

第二，這個 `prompt` 還沒完，只寫了一半。

在這一段 `prompt` 中，我提示了 GPT 底下會有一些 `section`，告訴他每一個 `section` 的意思，以及回答問題的步驟。

### 2.2 段落
接下來要把各個段落給他，也就是 `內容 Content`, `問題 Question`, `格式 Format`，再加上一個 `回答 Answer`

```ts
const messages = [{
  role: "user",
  content: `Reading the content in "Content" section, and answer the question in "Question" section with strictly follow the instruction in "Format" section.

"""Content"""
user: ${userMessage}

"""Question"""
Which element might customers be interested in?

"""Format"""
You must answer with one of the following Element Id with no other words. If you cannot determine, just say '__no__'.

"""Answer"""

`
}]
```

這裡要先說明「段落」是怎麼回事。

首先每個段落我都用固定的格式區分 `"""段落標題"""`，這種固定格式的作法，可以幫助 LLM 了解這是一個區塊，或是一個段落。然後也方便對 LLM 說明每個區塊。

然後，不一定要使用 `"""段落標題"""` 這個格式。只要是一致的模式，「看起來像一個段落」就可以。比方說

```
<Content>

<Question>

```

或是

```
---Content---

---Question---
```

LLM 這種生物是最喜歡模式了。（我猜啦）

接下來說明一下每個段落:
- `Content`：因為我們希望 LLM 根據使用者的訊息回答問題，所以「內容」就是指「對話」了。所以我在這裡放了使用者輸入的訊息。
- `Question`：這裡是我希望 LLM 回應的問題，`Which element might customers be interested in?`
- `Format`：這裡放了回應格式的規範：用 Element Id 回答我，除此以外不要回答任何字，如果找不到適合的，就說 "__no__"。
  - "__no__" 的部分在[前一篇文章(「以上皆非」 的段落)](https://dev.to/shunnnet/gei-qian-duan-de-jian-dan-ai-jiao-xue-21-yong-llm-jue-ding-xuan-ran-yuan-su-4inm)有提過，當沒有適合的答案可以回答時，最好給 LLM 一個「選擇」，不然他有可能會強行給一個答案。

- `Answer`：給 LLM 填入答案的區塊。這個區塊的概念跟考試會出現的填充題的格子一樣，暗示 LLM 填入答案。

### 2.3 DOM 元素的 prompt
終於要把 DOM 元素放進去了。

還記得前面已經把元素的資訊、ID 都標好了，我們可以使用 Web API 把他們取回來。

```ts
const eles = [...document.querySelectorAll(`[data-ai-id]`)]
```

先說一下，我要做成這樣的 prompt：

```
""Element: login-button""
Id: login-button
Description: The button, when clicked, can open a login popup.

""Element: unsubscribe-button""
Id: unsubscribe-button
Description: Clicking it will terminate users subscription of browser-ai.

```

跟前面的「段落」很像，只是這次我使用的是**兩個** `"`。因為等等要把他們插入大的段落中，為了跟大段落區隔，所以使用**兩個**，意圖表明這是**小段落**。

然後我在每一段加上元素的相關資訊，好讓 LLM 了解「這個元素的用途是什麼，有什麼內容」，以及他們的 ID。

知道目標的格式之後，就可以把他們算出來了：
```ts
const eles = [...document.querySelectorAll(`[data-ai-id]`)]
const elementPrompt = eles
  .map(ele => `""Element: ${ele.dataset.aiId}""
Id: ${ele.dataset.aiId}
Description: ${ele.dataset.aiDescription}`
)
  .join("\n\n")
```

然後我們把做好的 `elementPrompt`，加入大的 `prompt` 中。

我放在 Format 的區塊中：
```ts
const messages = [{
  role: "user",
  content: `Reading the content in "Content" section, and answer the question in "Question" section with strictly follow the instruction in "Format" section.

"""Content"""
user: ${userMessage}

"""Question"""
Which element might customers be interested in?

"""Format"""
You must answer with one of the following Element Id with no other words. If you cannot determine, just say '__no__'.

${elementPrompt}

"""Answer"""

`
}]
```

## 3. 連接起來
最後一步，在表單提交時，我們要把輸入的訊息傳給 GPT，然後根據 GPT 的回應，取得 DOM 元素。

建議大家直接沿用上一篇的程式碼，或是使用這一篇的原始碼：

```ts
const handleSubmit = async (e) => {
  e.preventDefault();
  const userMessage = input.value
  form.reset()

  // ----Produce Element Prompt----
  const eles = [...document.querySelectorAll(`[data-ai-id]`)]
  const elementPrompt = eles.map(ele => `""Element: ${ele.dataset.aiId}""
Id: ${ele.dataset.aiId}
Description: ${ele.dataset.aiDescription}`
  ).join("\n\n")

  // ----Full prompt----
  const prompt = `Reading the content in "Content" section, and answer the question in "Question" section with strictly follow the instruction in "Format" section.

"""Content"""
user: ${userMessage}

"""Question"""
Which element might customers be interested in?

"""Format"""
You must answer with one of the following Element Id with no other words. If you cannot determine, just say '__no__'.

${elementPrompt}

"""Answer"""

`
const messages = [
  { role: "user", content: prompt },
]

// 注意，請將 temperature 設定為 0
const aiResponse = await chatCompletion(messages, 0)
console.log(aiResponse)
// 以下省略......
}
```

注意，請將 `temperature` 設定為 `0`，以提高成功率。

然後，試著在表單說些跟元素有關的訊息：「我想要登入」，接著看看 `console` 是不是回應：

```
login-button
```

有這個 ID 之後，就可以取得 DOM 元素了。

取得 DOM 元素後，可以拿來做什麼？

一個比較簡單可以想到的例子：

```ts
const aiResponse = await chatCompletion(messages, 0)

// 取得對應的元素
const target = document.querySelector(`[data-ai-id="${aiResponse}"]`)

// 如果有對應元素，則加上 class ".highlight"
if (target) {
  target.classList.add("highlight")
}
```

或者是

```ts
target.scrollIntoView()
```

諸如此類的等等...這交給各位的想像力了。

### Tip
如果你發現不管怎麼樣都選到 `__no__`，或許可以試試看對 `data-ai-description` 加上更詳細的描述。

-------------------------

## 收尾
整理一下。這篇文章我們看到了：
- 可以將指示加在 `userMessage`
- 如何指示 GPT 回應問題的方式，並且透過「段落」的這個模式說明問題
- 如何將 DOM 的內容加入 prompt 中

雖然我是以 DOM 作為範例，但我想，這類的做法在其他的場景也會頗有用途，比如選擇「文件」、「敘述」、「角色」.....甚至是 `route`, `function`。可以多多嘗試。

下一篇文章依然會再舉一個 GPT 的範例。

## Reference
[完整原始碼](https://github.com/shunnNet/browser-ai-tutorial/blob/main/03-choose-dom/index.html)

-------------------------

## 廣告 - Browser AI Project (In development)
我做的套件 der~
Use `Browser AI` to help you build an LLM powered website!
Repository: https://github.com/shunnNet/browser-ai
Website: https://courageous-manatee-a625e9.netlify.app/



