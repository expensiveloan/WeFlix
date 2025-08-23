import alienAvatar from '../assets/avatars/alien.png'
import astrobotAvatar from '../assets/avatars/astrobot.png'
import bighero6Avatar from '../assets/avatars/bighero6.png'
import boyAvatar from '../assets/avatars/boy.png'
import boy2Avatar from '../assets/avatars/boy2.png'
import boy3Avatar from '../assets/avatars/boy3.png'
import boy4Avatar from '../assets/avatars/boy4.png'
import girlAvatar from '../assets/avatars/girl.png'
import girl2Avatar from '../assets/avatars/girl2.png'
import girlKidAvatar from '../assets/avatars/girl_kid.png'

export const getAvatarDisplay = (avatar: string) => {
  const avatarMap: Record<string, { image: string; shadow: string }> = {
    default: { 
      image: boyAvatar, 
      shadow: 'shadow-lg shadow-red-500/30'
    },
    avatar1: { 
      image: girlAvatar, 
      shadow: 'shadow-lg shadow-blue-500/30'
    },
    avatar2: { 
      image: boy2Avatar, 
      shadow: 'shadow-lg shadow-emerald-500/30'
    },
    avatar3: { 
      image: girl2Avatar, 
      shadow: 'shadow-lg shadow-purple-500/30'
    },
    avatar4: { 
      image: boy3Avatar, 
      shadow: 'shadow-lg shadow-amber-500/30'
    },
    avatar5: { 
      image: girlKidAvatar, 
      shadow: 'shadow-lg shadow-pink-500/30'
    },
    avatar6: { 
      image: alienAvatar, 
      shadow: 'shadow-lg shadow-indigo-500/30'
    },
    avatar7: { 
      image: astrobotAvatar, 
      shadow: 'shadow-lg shadow-orange-500/30'
    },
    avatar8: { 
      image: bighero6Avatar, 
      shadow: 'shadow-lg shadow-teal-500/30'
    },
    avatar9: { 
      image: boy4Avatar, 
      shadow: 'shadow-lg shadow-cyan-500/30'
    }
  }
  
  return avatarMap[avatar] || avatarMap.default
}
