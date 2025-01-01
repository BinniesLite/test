"use client"

import React, { useEffect, useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Loading from '@/components/loading';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/app-sidebar';
import Navbar from '@/components/navbar';
import ChaptersSidebar from '@/app/(dashboard)/user/courses/[courseId]/chapter-sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const [courseId, setCourseId] = useState<string | null>(null);
    const { user, isLoaded } = useUser();

    const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(
        pathname
    );
    
    useEffect(() => {
        if (isCoursePage) {
            const match = pathname.match(/\/user\/courses\/([^\/]+)/);
            setCourseId(match ? match[1] : null);
          } else {
            setCourseId(null);
          }
    }, [pathname, courseId])

    if (!isLoaded) return <Loading />
    if (!user) return <div>please sign in</div>

    return (
        <SidebarProvider>
            <div className='dashboard'>
                {/* SIDEBAR */}
                <AppSidebar />

                <div className='dashboard__content'>
                    {courseId && <ChaptersSidebar/>}
                    {/* chapter sidebar will go */}
                    <div
                        className={cn("dashboard__main"
                        )}
                        style={{ height: "100vh" }}
                    >
                        <Navbar isCoursePage={false}/>
                        <main className="dashboard__body">{children}</main>
                    </div>


                </div>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout;