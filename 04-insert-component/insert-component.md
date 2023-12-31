# 給前端的簡單 AI 教學 - 2.3 在 llm 回應中渲染 custom component

如果你曾經跟 ChatGPT 聊過天，會發現他的回應中不只有文字，還有列表、 `<code>` 區塊，甚至有可能會顯示個圖片給你看...

因為 OpenAI API 在回應的時候會預設回應 `markdown` 格式，如果 LLM 不是預設回應 markdown，你也可以使用 prompt，請他以 markdown 格式回應。

只要他是以 markdown 回應，我們就可以利用渲染 markdown 的元件客製化顯示內容。比如使用 [`react-markdown`](https://github.com/remarkjs/react-markdown) 或是使用 [`vue-markdown`](https://github.com/shunnNet/vue-markdown)。

此外，我們也可以利用這兩個套件，渲染非標準 markdown 元素，比如 `ProductCard`, `LoginForm` 等客製化元件。

## 前置
你可以直接查看這篇文章的完整程式碼，以節省你的時間，有 `Vue` 跟 `React` 兩個範例。

這篇文章將以 `Vue` 的程式碼進行解說。但應該都可以找到 `React` 的對應寫法。

你可以參照範例中的 `Readme.md` 進行設置。

- [Vue sample code](https://github.com/shunnNet/browser-ai-tutorial/tree/main/04-insert-component/vue-prompt-component)
- [React sample code](https://github.com/shunnNet/browser-ai-tutorial/tree/main/04-insert-component/react-prompt-component)

## 1.1 配置元件
首先我們要先設置渲染 markdown 的元件。

`vue-markdown` 跟 `react-markdown` 預設都只渲染最基本的 markdown，像是 `table` 之類的元素會無法對應，所以我們需要為他們加上 `remark-gfm` plugin。

此外，為了渲染我們的客製化元件，我們需要加上渲染 `html` 的能力，因此需要加上 `rehype-raw`。

```vue
<!-- Vue -->
<script setup>
import VueMarkdown from "@crazydos/vue-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

const markdown = ref(`
  ## hello world
`)
</script>

<template>
  <!--
    "sanitize=false" is required to allow non-standard HTML
    This is not required for "react-markdown"
  -->
  <VueMarkdown
    :markdown="markdown"
    :remarkPlugins="[remarkGfm]"
    :rehypePlugins="[rehypeRaw]"
    :sanitize="false"
  >
  </VueMarkdown>
</template>
```

## 1.2 客製化標準 markdown 元素
接著，我們來試著讓他渲染客製化元件。首先是對標準 `markdown` 進行渲染。`VueMarkdown` 的情況是，你可以透過 `scoped-slot` 客製化 html 元素。在 `react-markdown` 中你也可以找到對應的功能。

```vue
<template>
  <VueMarkdown
    :markdown="markdown"
    :remarkPlugins="[remarkGfm]"
    :rehypePlugins="[rehypeRaw]"
    :sanitize="false"
  >
    <template #h2="{ children }">
      <h2 class="text-red text-underline">
        <Component :is="children"/>
      </h2>
    </template>
  </VueMarkdown>
</template>
```

## 1.3 渲染客製化元件
比如說你可能會有個元件 `<LoginForm>`，你想要在 markdown 內容中穿插他，以 `VueMarkdown` 的做法是使用 `<slot slot-name="slotName"></slot>`

```vue
<!-- Vue -->
<script setup>
// ...
import RecommendProducts from "./components/RecommendProducts.vue"
// ...
const markdown = ref(`
  ## Hello world
  
  <slot slot-name="recommend-products"></slot>
  
  I am another content ....
`)
</script>

<template>
  <!--
    "sanitize=false" is required to allow non-standard HTML
    This is not required for "react-markdown"
  -->
  <VueMarkdown
    :markdown="markdown"
    :remarkPlugins="[remarkGfm]"
    :rehypePlugins="[rehypeRaw]"
    :sanitize="false"
  >
    <!-- omitted... -->
    <template #recommend-products>
      <RecommendProducts />
    </template>
  </VueMarkdown>
</template>
```

這麼一來渲染的準備就差不多了。我們來看看要怎麼處理 GPT 。

## 2.1 Prompt - 請插入特定的語法
在這篇中，我會使用 `systemMessage` 告訴 OpenAI GPT 如何進行回應。

若你是從前面看過來的人，或許你會對我一下使用 `systemMessage` 一下使用 `userMessage` 給 LLM 指示感到困惑。我會在下一篇文章說明這兩者的不同。我會在這裡使用 `systemMessage`，是因為**我認為語意上比較順**。

這裡的主要概念是，要求 GPT 插入特定的字串到他的回應中：

```ts
{
  role: "system",
  content: `Answer in markdown format. I will provide you some syntax and its usage, you may insert the syntax into appropriate position in your answer when it may help user without any modification to syntax.`
}
```

然後還需要跟他說要插入的語法：前面我們有提到，是使用 `<slot slot-name="slot-name"></slot>` 這樣的語法。

```ts
{
  role: "system",
  content: `Answer in markdown format. I will provide you some syntax and its usage, you may insert the syntax into appropriate position in your answer when it may help user without any modification to syntax.

syntax (recommend-products): <slot slot-name="recommend-products"></slot>
syntax description (recommend-products): A list of recommended products
`
}
```

前幾篇文章中有提到使用這樣的 prompt 描述一些 item 的做法，他讓 LLM 可以從中挑選適合的 item：

```
---Element: recommend-products---
id: recommend-products
description: A list of recommended products

---Element: login-form---
id: login-form
description: A form to login to the service, user need to input email and password, or use social login e.g: Google, Facebook, Twitter, etc.
```

其實只要他是遵照一個固定、明顯的格式，通常 LLM 都可以辨識出來那是一個區塊。因此在這裡我也可以將格式寫成以下：

```ts
{
  role: "system",
  content: `Answer in markdown format. I will provide you some syntax and its usage, you may insert the syntax into appropriate position in your answer when it may help user without any modification to syntax.

syntax (recommend-products): <slot slot-name="recommend-products"></slot>
syntax description (recommend-products): A list of recommended products

syntax (login-form): <slot slot-name="login-form"></slot>
syntax description (login-form): A form to login to the service, user need to input email and password, or use social login e.g: Google, Facebook, Twitter, etc.
`
}
```

注意，在這裡我提示 LLM 的是：`請插入你認為可能可以幫助使用者的語法`，因此他不一定會把兩個語法都插入到他的回應。我用的是 `you may insert`，如果強烈要求他一定要插入，你也可以改成 `you must insert`。

## 2.2 Prompt - 加入脈絡、加入範例
我在寫這個範例的時候遇到一些問題
1. 他有可能以為這是一個語法教學的對話
2. 他有可能以 markdown 程式碼區塊的方式插入語法

來看一下怎麼解決這兩個問題：

### 2.2.1 Prompt - 加入脈絡
我預設的情境是：這是一個客服跟客人的對話。但是他可能會這樣回應：

```
You can insert the following syntax to login:

<slot slot-name="login-form"></slot>
```

總不能讓客人看見這種東西吧 orz。

他會說出這種話，是因為我們沒有給他明確的情境限制，如果沒有告訴他，他通常都會自己猜，而那可能不是我們要的。因此我們可以明確的告訴他，這是什麼對話，或者他的身份。比如，你是一個客服人員。

```ts
{
   role: "system",
   content: `You are a customer service. Please help user to solve their problem.

...`
}
```

### 2.2.2 Prompt - 加入範例：One Shot
第二個問題：他有可能以 markdown 程式碼區塊的方式插入語法。

比如他可能會這樣回應：

```
```html
<slot slot-name="login-form"></slot>
```

不管是 `react-markdown` 或是 `vue-markdown` 都會將這裡渲染成 `<pre><code></code></pre>`，而不是把它解析成 `html`。

為了提高他成功插入的機率，我們給他加入一個插入的範例：

```
example: 
user: I want to buy a product
you: ...part of your answer : <slot slot-name="recommend-products"></slot> ...part of your answer...
```

像這種丟一個範例給他的做法，是一種叫做 one-shot 的 prompt 方法。當你發現 LLM 的回應不是很理想，或是總是沒有照著你的格式跑的時候，你可以丟一個範例讓他「照著做」。是一種「像是這種感覺的回應我」的東西。

舉一個例：
```
Please categorize the following items with possitive, negative:

rainy day 

```

回答通常會是
```
positive
```

你可以到 `ChatGPT` 去試試有加跟沒加的效果。

### 2.3 Prompt - 完整的 Prompt
綜合以上，Prompt 會長得像是這樣。我們在這之後加入 `userMessage`

```ts
const userMessage = "...."
const messages = [
  {
   role: "system",
   content: `You are a customer service. Please help user to solve their problem.
Answer in markdown format. I will provide you some syntax and its usage, you may insert the syntax into appropriate position in your answer when it may help user without any modification to syntax.

example: 
user: I want to buy a product
you: ...part of your answer : <slot slot-name="recommend-products"></slot> ...part of your answer...

syntax (recommend-products): <slot slot-name="recommend-products"></slot>
syntax description (recommend-products): A list of recommended products

syntax (login-form): <slot slot-name="login-form"></slot>
syntax description (login-form): A form to login to the service, user need to input email and password, or use social login e.g: Google, Facebook, Twitter, etc.
`,
  
  },
  {
    role: "user",
    content: userMessage
  }
],
```

## 3. Try it
接著我們就可以嘗試對他輸入一些訊息了，看他會不會根據情況渲染出元件。

```
Show me some products
```

結果是：

![render-component-in-llm-message](./sample.png)


## Summary
由於篇幅的關係，沒有呈現出完整的程式碼，如最開始所說的，你可以到以下地方查看完整的實作範例：

- [Vue sample code](https://github.com/shunnNet/browser-ai-tutorial/tree/main/04-insert-component/vue-prompt-component)
- [React sample code](https://github.com/shunnNet/browser-ai-tutorial/tree/main/04-insert-component/react-prompt-component)

若是你遇到一些問題也歡迎在下方留言。

若你是 `Vue` 的使用者，你也可以參考看看這個套件的範例 [vue-llm-rich-message](https://github.com/shunnNet/vue-llm-rich-message)

在下一篇文章，將會說明一些 prompt 的概念，或許可以幫助你更彈性的運用 prompt。

## reference
- [OpenAI Documentation: One-Shot](https://platform.openai.com/docs/guides/prompt-engineering/tactic-provide-examples)
- [`react-markdown`](https://github.com/remarkjs/react-markdown)
- [`vue-markdown`](https://github.com/shunnNet/vue-markdown)
- [`vue-llm-rich-message`](https://github.com/shunnNet/vue-llm-rich-message)

## Try Browser AI Project (In development)
Use `Browser AI` to help you build an LLM powered website!

Repository: https://github.com/shunnNet/browser-ai
Website: https://courageous-manatee-a625e9.netlify.app/
