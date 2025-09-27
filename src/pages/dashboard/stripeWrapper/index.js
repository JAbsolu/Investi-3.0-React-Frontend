import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const stripePromise = loadStripe("pk_test_51S2FEnFUQWEqeOOpmidiPPLfeWgDqF6NG07g6QATwrOvtQUBCiLA0RKeY2aF7nVYwxxqN8VkUG0w8I5fIgb9ttak00JNfiyfFT");

const StripeWrapper = ({children}) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeWrapper;