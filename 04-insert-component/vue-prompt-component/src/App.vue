<script setup>
import VueMarkdown from "@crazydos/vue-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import RecommendProducts from "./components/RecommendProducts.vue"
import LoginForm from "./components/LoginForm.vue"
import { reactive, ref } from "vue"
import { chatCompletion } from "./openai"
const md = ref(``)
const form = reactive({
  message: "",
})

const availableComponents = [
  {
    id: "recommend-products",
    description: "A list of recommended products",
  },
  {
    id: "login-form",
    description:
      "A form to login to the service, user need to input email and password, or use social login e.g: Google, Facebook, Twitter, etc.",
  },
]

const availableComponentsPrompt = availableComponents
  .map((cmp) => {
    return `syntax (${cmp.id}): <slot slot-name="${cmp.id}"></slot>\nsyntax description (${cmp.id}): ${cmp.description}\n`
  })
  .join("\n\n")

const handleSubmit = async () => {
  const userMessage = form.message
  form.message = ""
  const conversation = [
    {
      role: "system",
      content: `You are a customer service. Please help user to solve their problem.
Answer in markdown format. I will provide you some syntax and its usage, you may insert the syntax into appropriate position in your answer when it may help user without any modification to syntax.

example: 
user: I want to buy a product
you: ...part of your answer : <slot slot-name="recommend-products"></slot> ...part of your answer...

${availableComponentsPrompt}
`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ]
  const res = await chatCompletion(conversation)
  console.log(res)
  md.value = res
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <textarea v-model="form.message"></textarea>
    <button type="submit">Ask</button>
  </form>
  <VueMarkdown
    :markdown="md"
    :remarkPlugins="[remarkGfm]"
    :rehypePlugins="[rehypeRaw]"
    :sanitize="false"
  >
    <template #recommend-products>
      <RecommendProducts />
    </template>
    <template #login-form>
      <LoginForm />
    </template>
  </VueMarkdown>
</template>

<style></style>
