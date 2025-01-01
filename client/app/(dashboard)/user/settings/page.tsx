"use client"

import React from 'react'
import SharedNotificationSettings from '@/components/shared-notification-setting'

const UserSettings = () => {
  return (
    <div className='w-3/5'>
        <SharedNotificationSettings
            title="User Settings"
        />
    </div>
  )
}

export default UserSettings