"use client"

import Loading from '@/components/loading';
import { useUser } from '@clerk/nextjs'
import WizardStepper from '@/components/wizard-stepper';
import { useEffect, useState } from 'react';

import { useCheckoutNavigation } from '@/hooks/useCheckoutNavigation';

import CheckoutDetailsPage from './components/checkout-details';
import PaymentPage from './components/payment';
import CompletionPage from './components/completion';

const CheckoutPage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { isLoaded } = useUser();
    const { checkoutStep } = useCheckoutNavigation();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;
    if (!isLoaded) return <Loading/>;

    const renderStep = () => {
        switch (checkoutStep) {
            case 1:
                return <CheckoutDetailsPage />
            case 2:
                return <PaymentPage/>
            case 3:
                return <CompletionPage/>
            default:
                return <CheckoutDetailsPage/>
        }

    }
    return (
        <div className='checkout'>
            <WizardStepper currentStep={checkoutStep}/>
            <div className='checkout__content'>
                {renderStep()}
            </div>
        </div>
    )
}

export default CheckoutPage