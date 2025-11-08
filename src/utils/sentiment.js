// Simple sentiment analysis for emotion detection
export function detectEmotion(text) {
  if (!text) return 'neutral'
  
  const lowerText = text.toLowerCase()
  
  // Positive indicators
  const positiveWords = [
    'happy', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic',
    'good', 'nice', 'love', 'like', 'enjoy', 'pleased', 'delighted',
    'smile', 'laugh', 'joy', 'excited', 'awesome', 'perfect', 'brilliant'
  ]
  
  // Negative indicators
  const negativeWords = [
    'sad', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry',
    'frustrated', 'disappointed', 'worried', 'concerned', 'upset',
    'frown', 'cry', 'unhappy', 'horrible', 'worst', 'problem', 'error'
  ]
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++
  })
  
  // Determine emotion
  if (positiveCount > negativeCount && positiveCount > 0) {
    return 'happy'
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    return 'sad'
  }
  
  return 'neutral'
}

