export type TarotCard = {
  id: string
  name: string
  image: string
  keywords: string
}

export type DrawnCard = TarotCard & {
  position: string
  reversed: boolean
}

export type SpreadKey = 'three-card' | 'five-card-cross' | 'seven-card-love'

export type Spread = {
  key: SpreadKey
  label: string
  description: string
  positions: readonly string[]
}

export const SPREADS: Record<SpreadKey, Spread> = {
  'three-card': {
    key: 'three-card',
    label: '3-Card Reading',
    description: 'Past · Present · Future',
    positions: ['Past', 'Present', 'Future'],
  },
  'five-card-cross': {
    key: 'five-card-cross',
    label: '5-Card Cross',
    description: 'Decision Making',
    positions: [
      'Situation',
      'Challenge',
      'Hidden Influence',
      'Advice',
      'Likely Outcome',
    ],
  },
  'seven-card-love': {
    key: 'seven-card-love',
    label: '7-Card Love',
    description: 'Relationship',
    positions: [
      'You',
      'Them',
      'The Connection',
      'Their Feelings',
      'Obstacles',
      'External Influences',
      'Likely Outcome',
    ],
  },
}

export const TAROT_DECK: TarotCard[] = [
  {
    id: 'the-star',
    name: 'The Star',
    image: '/cards/the-star.webp',
    keywords: 'hope, healing, renewal, faith',
  },
  {
    id: 'the-moon',
    name: 'The Moon',
    image: '/cards/the-moon.webp',
    keywords: 'intuition, illusion, the subconscious, uncertainty',
  },
  {
    id: 'the-lovers',
    name: 'The Lovers',
    image: '/cards/the-lovers.webp',
    keywords: 'union, choice, harmony, values',
  },
  {
    id: 'the-sun',
    name: 'The Sun',
    image: '/cards/the-sun.webp',
    keywords: 'joy, clarity, success, vitality',
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    image: '/cards/wheel-of-fortune.webp',
    keywords: 'cycles, fate, turning points, change',
  },
  {
    id: 'the-high-priestess',
    name: 'The High Priestess',
    image: '/cards/the-high-priestess.webp',
    keywords: 'mystery, inner voice, secrets, patience',
  },
  {
    id: 'the-hermit',
    name: 'The Hermit',
    image: '/cards/the-hermit.webp',
    keywords: 'introspection, solitude, inner guidance, wisdom',
  },
  {
    id: 'the-empress',
    name: 'The Empress',
    image: '/cards/the-empress.webp',
    keywords: 'abundance, nurturing, growth, sensuality',
  },
  {
    id: 'the-chariot',
    name: 'The Chariot',
    image: '/cards/the-chariot.webp',
    keywords: 'determination, willpower, victory, momentum',
  },
  {
    id: 'the-tower',
    name: 'The Tower',
    image: '/cards/the-tower.webp',
    keywords: 'sudden change, revelation, upheaval, liberation',
  },
]

export function drawCards(spread: SpreadKey): DrawnCard[] {
  const positions = SPREADS[spread].positions
  const shuffled = [...TAROT_DECK]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return positions.map((position, index) => ({
    ...shuffled[index],
    position,
    reversed: Math.random() < 0.3,
  }))
}
