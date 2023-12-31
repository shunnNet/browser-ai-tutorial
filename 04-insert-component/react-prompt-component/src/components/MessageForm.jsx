import { useState } from "react"

const MessageForm = ({ onSubmit }) => {
  const [message, setMessage] = useState("")
  const handleChange = (e) => {
    setMessage(e.target.value)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ message })
    setMessage("")
  }
  return (
    <form onSubmit={handleSubmit}>
      <textarea value={message} onChange={handleChange}></textarea>
      <button type="submit">Ask</button>
    </form>
  )
}

export default MessageForm
