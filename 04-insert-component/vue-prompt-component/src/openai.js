export const chatCompletion = async (messages, temperature = 0) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + import.meta.env.VITE_OPENAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: temperature,
      messages: messages,
    }),
  }).then((response) => response.json())

  return response.choices[0].message.content
}
