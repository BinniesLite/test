import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import React from 'react'
import Link from "next/link";

const CompletionPage = () => {
  return (
    <div className='completion'>
        <div className='completion__content'>
            <div className='completion__icon'>
                <Check className='w-16 h-16'/>

            </div>
            <h1 className='completion__title'>COMPLETED</h1>
            <p className='completion__message'>You have made a course purchase successfully! </p>
        </div>
        <div className='completion__support'>
            <p>
                Need help? Contact our {" "} 
                <Button variant="link" asChild className='p-0 m-0 text-primary-700'>
                    <a href="mailto:support@example.com">Customer Support</a>
                </Button>
            </p>

        </div>
        
        <div className='completion__action'> 
            <Link href="user/courses">
                Go To Courses
            </Link>
        </div>
    </div>
  )
}

export default CompletionPage