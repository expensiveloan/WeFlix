import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { User, Lock, Monitor, Globe, Shield, Trash2, Save, AlertTriangle, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface UserSettings {
  autoplay: boolean
  quality: 'auto' | 'high' | 'medium' | 'low'
  language: string
  notifications: boolean
  mature_content: boolean
  subtitle_language: string
  audio_language: string
  avatar: string
}

const Settings: React.FC = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    autoplay: true,
    quality: 'auto',
    language: 'en',
    notifications: true,
    mature_content: false,
    subtitle_language: 'en',
    audio_language: 'en',
    avatar: 'default'
  })
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data && !error && data.settings) {
          setSettings({
            autoplay: data.settings.autoplay ?? true,
            quality: data.settings.quality ?? 'auto',
            language: data.settings.language ?? 'en',
            notifications: data.settings.notifications ?? true,
            mature_content: data.settings.mature_content ?? false,
            subtitle_language: data.settings.subtitle_language ?? 'en',
            audio_language: data.settings.audio_language ?? 'en',
            avatar: data.settings.avatar ?? 'default'
          })
        }
      } catch {
        console.log('No existing settings found, using defaults')
      }
    }

    loadUserSettings()
  }, [user])

  const saveSettings = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('Saving settings:', settings) // Debug log
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Settings saved successfully:', data) // Debug log
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Error saving settings. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return

    setDeleteLoading(true)
    try {
      // Delete user data from our tables first
      await supabase.from('user_settings').delete().eq('user_id', user.id)
      await supabase.from('watchlist').delete().eq('user_id', user.id)
      
      // Delete the user account from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) {
        throw error
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setSaveMessage('Error deleting account. Please try again.')
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
      setDeleteConfirmText('')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-24 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {saveMessage}
            </div>
          )}

          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Account Information</h2>
              </div>
              
              {/* Avatar Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-4">Profile Avatar</label>
                <div className="grid grid-cols-6 gap-4">
                  {['default', 'avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6', 'avatar7', 'avatar8', 'avatar9'].map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSettings(prev => ({ ...prev, avatar }))}
                      className={`relative w-16 h-16 rounded-full border-2 transition-all duration-200 ${
                        settings.avatar === avatar 
                          ? 'border-red-500 ring-2 ring-red-500/30 scale-110' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        avatar === 'default' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        avatar === 'avatar1' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        avatar === 'avatar2' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        avatar === 'avatar3' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                        avatar === 'avatar4' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                        avatar === 'avatar5' ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                        avatar === 'avatar6' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                        avatar === 'avatar7' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                        avatar === 'avatar8' ? 'bg-gradient-to-br from-teal-500 to-teal-600' :
                        'bg-gradient-to-br from-cyan-500 to-cyan-600'
                      }`}>
                        {avatar === 'default' ? 'W' :
                         avatar === 'avatar1' ? '🎬' :
                         avatar === 'avatar2' ? '🍿' :
                         avatar === 'avatar3' ? '🎭' :
                         avatar === 'avatar4' ? '⭐' :
                         avatar === 'avatar5' ? '🎪' :
                         avatar === 'avatar6' ? '🎨' :
                         avatar === 'avatar7' ? '🎵' :
                         avatar === 'avatar8' ? '🎯' :
                         '🎲'}
                      </div>
                      {settings.avatar === avatar && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                  <input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Playback Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <Monitor className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Playback Settings</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Autoplay</h3>
                    <p className="text-gray-400 text-sm">Automatically play the next episode</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoplay: !prev.autoplay }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoplay ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoplay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Video Quality</label>
                  <select
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as UserSettings['quality'] }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="auto">Auto</option>
                    <option value="high">High (1080p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="low">Low (480p)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Language & Audio */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Language & Audio</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Interface Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Subtitle Language</label>
                  <select
                    value={settings.subtitle_language}
                    onChange={(e) => setSettings(prev => ({ ...prev, subtitle_language: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="off">Off</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Privacy & Security</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive updates about new content and features</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Mature Content</h3>
                    <p className="text-gray-400 text-sm">Show content rated for mature audiences</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, mature_content: !prev.mature_content }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.mature_content ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.mature_content ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-semibold text-white">Account Actions</h2>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </button>
                
                <div className="border-t border-gray-700 pt-6">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-red-300 font-medium mb-1">Danger Zone</h3>
                        <p className="text-red-200/80 text-sm">
                          Once you delete your account, there is no going back. This will permanently delete your account and remove all your data.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600/20 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Delete Account</h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-300 text-sm font-medium mb-2">This will delete:</p>
                <ul className="text-red-200/80 text-sm space-y-1">
                  <li>• Your account and profile</li>
                  <li>• Your watchlist and preferences</li>
                  <li>• All your settings and data</li>
                </ul>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Please type <strong className="text-red-400">DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {deleteLoading ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
