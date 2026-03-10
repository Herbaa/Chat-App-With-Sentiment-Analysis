import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../lib/prisma"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Метод не поддерживается" })
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return res.status(200).json(messages)
}