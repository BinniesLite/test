"use client";

import Link from 'next/link'
import React from 'react'
import { Bell, BookOpen } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

import { useState } from 'react';

import { UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { SidebarTrigger } from './ui/sidebar';
import { cn } from '@/lib/utils';

const Navbar = ({ isCoursePage }: { isCoursePage: boolean }) => {

    const [isDarkMode, setIsDarkMode] = useState(false);

    const { user } = useUser();
    const userRole = user?.publicMetadata?.userType as "student" | "teacher";

    return (
        <nav className="dashboard-navbar">
            <div className="flex justify-between items-center w-3/4 py-8">
                <div className='dashboard-navbar__search'>
                    <div className='md:hidden'>
                        <SidebarTrigger className='dashboard-navbar__sidebar-trigger'/>

                       
                    </div>
                    <div className="flex items-center gap-4"> {/* or !hidden for forcing it */}
                        <div className="relative group">
                            <Link href="/search" className={cn('dashboard-navbar__search-input', isCoursePage && "!bg-customgreys-secondarybg")}>
                                <span className="hidden sm:inline">Search Courses</span>
                                <span className="sm:hidden">Search</span>
                            </Link>
                            <BookOpen
                                className='dashboard-navbar__search-icon'
                                size={10}
                            />
                        </div>
                    </div>
                </div>

                <div className="dashboard-navbar__actions">
                        <button className="relative w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="absolute top-0 right-0 bg-blue-500 h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full">
                        </span>
                        <Bell className="dashboard-navbar__notification-icon" />
                    </button>

                    {/* SIGN-IN BUTTONS */}
                    
                        <UserButton
                            appearance={{
                                baseTheme: dark,
                                elements: {
                                    userButtonOuterIdentifier: "text-customgreys-dirtygreys",
                                    userButtonBox: "scale-90 sm:scale-100"
                                }
                            }}
                            showName={true}
                            userProfileMode='navigation'
                            userProfileUrl={
                                userRole === "teacher" ? "/teacher/profile" : "/user/profile"
                            }

                        />
                   
                </div>
            </div>
        </nav>
    )
}

export default Navbar