import React from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useCheckoutNavigation } from '@/hooks/useCheckoutNavigation';
import { useCurrentCourse } from '@/hooks/useCurrentCourse';
import { useClerk, useUser } from '@clerk/nextjs';
import CoursePreview from '@/components/course-preview';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateTransactionMutation } from '@/state/api';
import { toast } from 'sonner';


export const PaymentContent = () => {

      // Your existing PaymentPageContent code
      const stripe = useStripe();
      const elements = useElements();
  
      // const [createTransaction] = useCreateTransactionMutation();
      const { navigateStep } = useCheckoutNavigation();
  
      const [createTransaction] = useCreateTransactionMutation();
  
      const { course, courseId } = useCurrentCourse();
      const { user } = useUser();
  
      const { signOut } = useClerk();
  
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
  
        if (!stripe || !elements) {
          toast.error("Stripe service is not available");
          return;
        }
  
        const result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_STRIPE_REDIRECT_URL}?id=${courseId}`
          },
          redirect: "if_required"
        });
  
        if (result.paymentIntent?.status === "succeeded") {
          const transactionData: Partial<Transaction> = {
            transactionId: result.paymentIntent.id,
            userId: user?.id,
            courseId: courseId,
            paymentProvider: "stripe",
            amount: course?.price || 0
          }
  
          await createTransaction(transactionData);
          navigateStep(3);
  
        }
  
  
      }
  
      const handleSignOutAndNavigate = async () => {
        await signOut();
        navigateStep(1);
      }
  
      if (!course) return null;
  
      return <div className='payment'>
        <div className='payment__container'>
          {/* ORDER SUMMARY */}
          <div className='payment__preview'>
            <CoursePreview course={course} />
          </div>
  
          {/* PAYMENT FORM */}
          <div className='payment__form-container'>
            <form
              className='payment-form'
              id="payment-form"
              onSubmit={handleSubmit}
            >
              <div className='payment__content'>
                <h1 className='payment__title'>Checkout</h1>
                <p className='payment__subtitle'>Fill out the payment detail below to complete your purchase.</p>
              </div>
  
              <div className='payment__method'>
                <h3 className='payment__method-title'>Payment Method</h3>
  
                <div className='payment__card-container'>
                  <div className='payment__card-header'>
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <div className='payment__card-element'>
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
  
        {/* NAVIGATION BUTTON */}
        <div className='payment__action'>
          <Button
            className='hover:bg-white-50/30'
            variant="outline"
            type="button"
            onClick={handleSignOutAndNavigate}
          >
            Switch Account
          </Button>
  
          <Button
            form="payment-form"
            className='payment__submit'
            variant="outline"
            type="submit"
            disabled={!stripe || !elements}
          >
            Pay with Credit Card
          </Button>
        </div>
  
      </div>
  
}

