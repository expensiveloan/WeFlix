export const getAvatarDisplay = (avatar: string) => {
  const avatarMap: Record<string, { bg: string; content: string }> = {
    default: { bg: 'bg-gradient-to-br from-red-500 to-red-600', content: 'W' },
    avatar1: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', content: '🎬' },
    avatar2: { bg: 'bg-gradient-to-br from-green-500 to-green-600', content: '🍿' },
    avatar3: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', content: '🎭' },
    avatar4: { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', content: '⭐' },
    avatar5: { bg: 'bg-gradient-to-br from-pink-500 to-pink-600', content: '🎪' },
    avatar6: { bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', content: '🎨' },
    avatar7: { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', content: '🎵' },
    avatar8: { bg: 'bg-gradient-to-br from-teal-500 to-teal-600', content: '🎯' },
    avatar9: { bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600', content: '🎲' }
  }
  
  return avatarMap[avatar] || avatarMap.default
}
