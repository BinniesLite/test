"use client"

import React from 'react'
import SharedNotificationSettings from '@/components/shared-notification-setting'

const TeacherSettings = () => {
  return (
    <div className='w-3/5'>
        <SharedNotificationSettings
            title="Teacher Settings"
            subtitle="Manage Teacher Settings"
        />
    </div>
  )
}

export default TeacherSettings