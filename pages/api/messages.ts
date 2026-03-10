import type { NextApiRequest, NextApiResponse } from "next"
import Sentiment from "sentiment"
import { prisma } from "../../lib/prisma"
import { pusherServer } from "../../lib/pusher"

const analyzer = new Sentiment()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" })
  }

  const { username, text } = req.body

  if (!username?.trim() || !text?.trim()) {
    return res.status(400).json({ error: "Отсутствует имя, либо текст сообщения" })
  }

  const result = analyzer.analyze(text)
  const score = result.score

  let sentiment: "positive" | "negative" | "neutral"
  if (score > 0) sentiment = "positive"
  else if (score < 0) sentiment = "negative"
  else sentiment = "neutral"

  const message = await prisma.message.create({
    data: {
      username: username.trim(),
      text: text.trim(),
      score,
      sentiment,
    },
  })

  await pusherServer.trigger("chat-channel", "new-message", message)

  return res.status(200).json(message)
}