// payment.tsx
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

const StripeProvider = dynamic(
  () => import('./stripe-provider'),
  { ssr: false }
);

const PaymentPageContent: ComponentType = dynamic(
  () => import('./payment-content').then(mod => mod.PaymentContent),
  { ssr: false }
);

const PaymentPage = () => {
  return (
    <StripeProvider>
      <PaymentPageContent />
    </StripeProvider>
  )
}

export default PaymentPage