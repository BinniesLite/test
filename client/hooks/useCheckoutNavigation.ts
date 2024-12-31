"use client"

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect } from 'react'

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParam = useSearchParams(); 
  const { isLoaded, isSignedIn} = useUser();

  const courseId = searchParam.get("id") ?? "";

  const checkoutStep = parseInt(searchParam.get("step") ?? "1", 10)
  
  const navigateStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3);
      const showSignUp = isSignedIn ? "true" : "false";

      router.push(
        `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`
      )
    },
    [courseId, isSignedIn, router]
  )

  // Make sure the user sign in
  useEffect(() => {
    if (isLoaded && !isSignedIn && checkoutStep > 1) {
      navigateStep(1)
    }
  }, [isLoaded, isSignedIn, checkoutStep, navigateStep])
  
  return { checkoutStep, navigateStep }; 
}
