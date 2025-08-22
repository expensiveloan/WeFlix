import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    // Get profile data from user metadata
    const userMetadata = user.user_metadata || {}
    const profileData: UserProfile = {
      id: user.id,
      first_name: userMetadata.first_name || '',
      last_name: userMetadata.last_name || '',
      full_name: userMetadata.full_name || `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim(),
      email: user.email || ''
    }

    setProfile(profileData)
    setLoading(false)
  }, [user])

  return { profile, loading }
}
