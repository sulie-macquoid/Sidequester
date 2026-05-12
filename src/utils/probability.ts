import type { Quest } from '../types'

export function pickWeighted(quests: Quest[], weights: Record<string, number>): Quest | null {
  if (quests.length === 0) return null

  const totalWeight = quests.reduce((sum, q) => sum + (weights[q.id] ?? 1), 0)
  let random = Math.random() * totalWeight

  for (const q of quests) {
    const w = weights[q.id] ?? 1
    random -= w
    if (random <= 0) return q
  }

  return quests[quests.length - 1]
}

export function updateWeightOnDiscard(
  weights: Record<string, number>,
  questId: string
): Record<string, number> {
  return { ...weights, [questId]: (weights[questId] ?? 1) / 2 }
}

export function resetWeightsIfCycleComplete(
  weights: Record<string, number>,
  deckQuestIds: string[],
  drawnQuestIds: string[]
): Record<string, number> {
  const allDrawn = deckQuestIds.every(id => drawnQuestIds.includes(id))
  if (allDrawn) {
    return Object.fromEntries(deckQuestIds.map(id => [id, 1]))
  }
  return weights
}
