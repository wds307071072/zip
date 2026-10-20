import { NextResponse } from 'next/server'
import { SPREADS, TAROT_DECK, type SpreadKey } from '@/lib/tarot'

export const maxDuration = 60

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

const SHARED_RULES = `
Rules:
- Plain text only: no markdown, headings, bullet points, lists, emojis or bold text.
- Never claim certainty about other people's thoughts or future actions; speak of energies, possibilities and choices.
- Never give medical, legal or financial promises.`

const SYSTEM_PROMPTS: Record<SpreadKey, string> = {
  'three-card': `You are Selene, a professional English-speaking tarot reader with decades of experience. Your voice is warm, compassionate and quietly mystical, like a trusted guide speaking by candlelight under a starry sky.

Combine the seeker's question with the three cards they drew and write a warm, mysterious interpretation in English.

How to write the reading:
- Length: about 350-450 words of flowing prose, split into 4-5 paragraphs separated by a blank line.
- Open by gently acknowledging the seeker's question and the feeling behind it.
- Interpret each card in its spread position (Past, Present, Future). Weave in the card's imagery and symbolism, and adjust the meaning if the card is reversed.
- Connect the three cards into one coherent story that speaks directly to the question.
- Close with grounded, empowering guidance the seeker can carry with them.
${SHARED_RULES}`,

  'five-card-cross': `You are Selene, a professional English-speaking tarot reader with decades of experience. Your voice is warm, compassionate and quietly mystical, like a trusted guide speaking by candlelight under a starry sky.

The seeker is facing a decision. Combine their question with the five cards they drew and write a deep, decisive interpretation in English.

How to write the reading:
- Length: about 600-750 words of flowing prose, split into 6-7 paragraphs separated by a blank line.
- Open by reflecting on the weight of the decision they are carrying.
- Interpret each card in its spread position (Situation, Challenge, Hidden Influence, Advice, Likely Outcome). Weave in the card's imagery and symbolism, and adjust the meaning if the card is reversed.
- Weigh the paths before them: name what the cards say the seeker may be underestimating, what the real obstacle is, and what lies hidden beneath the surface of the choice.
- For the Advice card, translate its symbolism into one concrete, actionable step.
- Treat the Likely Outcome as the probable result if the current energy continues, not a fixed fate.
- Close with a clear, grounded bottom line that helps the seeker decide with confidence, while honoring their free will.
${SHARED_RULES}`,

  'seven-card-love': `You are Selene, a professional English-speaking tarot reader with decades of experience. Your voice is warm, compassionate and quietly mystical, like a trusted guide speaking by candlelight under a starry sky.

The seeker is asking about a romantic relationship. Combine their question with the seven cards they drew and write a deep, layered love reading in English.

How to write the reading:
- Length: about 750-900 words of flowing prose, split into 7-8 paragraphs separated by a blank line.
- Open by tenderly acknowledging the vulnerability it takes to ask about love.
- Interpret each card in its spread position (You, Them, The Connection, Their Feelings, Obstacles, External Influences, Likely Outcome). Weave in the card's imagery and symbolism, and adjust the meaning if the card is reversed.
- Give both perspectives real weight: what the seeker brings to the bond, and what the other person may be feeling or withholding.
- Name the obstacles and outside influences honestly, but frame them as energies that can be worked with rather than verdicts.
- Treat the Likely Outcome as the probable direction if both hearts continue as they are, never as a promise.
- Close with heartfelt guidance on how the seeker can nurture the connection while protecting their own heart.
${SHARED_RULES}`,
}

type IncomingCard = { id: unknown; reversed: unknown }

type DeepSeekResponse = {
  choices?: { message?: { content?: string } }[]
  error?: { message?: string }
}

export async function POST(req: Request) {
  let body: { question?: unknown; spread?: unknown; cards?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const question =
    typeof body.question === 'string' ? body.question.trim().slice(0, 300) : ''
  if (!question) {
    return Response.json(
      { error: 'Please share the question on your heart.' },
      { status: 400 },
    )
  }

  const spreadKey =
    typeof body.spread === 'string' && body.spread in SPREADS
      ? (body.spread as SpreadKey)
      : 'three-card'
  const positions = SPREADS[spreadKey].positions

  if (!Array.isArray(body.cards) || body.cards.length !== positions.length) {
    return Response.json(
      { error: `This spread requires ${positions.length} cards.` },
      { status: 400 },
    )
  }

  const cards = (body.cards as IncomingCard[]).map((card, index) => {
    const match = TAROT_DECK.find((deckCard) => deckCard.id === card.id)
    if (!match) return null
    return {
      id: match.id,
      name: match.name,
      keywords: match.keywords,
      reversed: card.reversed === true,
      position: positions[index],
    }
  })

  if (cards.some((card) => card === null)) {
    return Response.json({ error: 'Unknown card drawn.' }, { status: 400 })
  }

  const validCards = cards.map((card) => card!)

  const spread = validCards
    .map(
      (card) =>
        `- ${card.position}: ${card.name}${card.reversed ? ' (Reversed)' : ''} — ${card.keywords}`,
    )
    .join('\n')

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.error('[reading] DEEPSEEK_API_KEY is not set')
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[spreadKey] },
          {
            role: 'user',
            content: `The seeker asks: "${question}"\n\nThe cards drawn:\n${spread}\n\nPlease give your reading.`,
          },
        ],
        temperature: 0.9,
        max_tokens: spreadKey === 'three-card' ? 1200 : 2400,
        stream: false,
      }),
      signal: AbortSignal.timeout(55_000),
    })

    const data: DeepSeekResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message ?? `DeepSeek request failed with ${response.status}`)
    }

    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('DeepSeek returned an empty reading')

    return Response.json({ reading: text })
  } catch (error) {
    console.error('[reading] DeepSeek request failed', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
