import { useState, memo } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { chatCompletion } from "./openai"
import LoginForm from "./components/LoginForm"
import RecommendProducts from "./components/RecommendProducts"
import React from "react"
import MessageForm from "./components/MessageForm"

const MemoizedMessageForm = memo(MessageForm)
function App() {
  const [markdown, setMarkdown] = useState(``)

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

  const handleSubmit = async ({ message }) => {
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
        content: message,
      },
    ]
    const res = await chatCompletion(conversation)
    console.log(res)
    setMarkdown(res)
  }
  const componentsMap = {
    "login-form": LoginForm,
    "recommend-products": RecommendProducts,
  }
  const components = {
    slot: (props) => {
      const Component = componentsMap[props["slot-name"]]
      return Component ? React.createElement(Component) : null
    },
  }
  return (
    <>
      <MemoizedMessageForm onSubmit={handleSubmit} />
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {markdown}
      </Markdown>
    </>
  )
}

export default App
