import { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Mail, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { teal, indigo, grey, green, red } from '@mui/material/colors';
import { database } from '../../../firebaseConfig';
import { ref, set } from 'firebase/database';

const API_URL = process.env.REACT_APP_API_URL;
const darkGradient = 'linear-gradient(135deg, #181c20 0%, #0d0d0d 100%)';

const CheckoutModal = ({ open, onClose, stripePriceId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const { email } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const { userId } = useAuth();

    const saveSubscribtionToFireDB = async (userId, customerId, subscriptionId, paymentMethodId) => {
        try {
            await set(ref(database, `users/${userId}/subscriptions`), {
                "customerId": customerId,
                "subscriptionId": subscriptionId,
                "paymentMethodId": paymentMethodId,
                "status": 'active'
            });
            console.info('Subscription saved to Firestore');
            return true;
        } catch (error) {
            console.error('Error saving subscription to Firestore:', error);
            return false;
        }
    };

    const [formData, setFormData] = useState({
        fullName: '',
        email: ''
    });

    useEffect(() => {
        if (email) {
            setFormData(prev => ({
                ...prev,
                email: email
            }));
        }
    }, [email]);

    const createCustomer = async (form, paymentMethodId, stripePriceId) => {
        if (!form.email || !form.fullName) {
            console.error('Email and full name are required to create a customer.');
            return null;
        }

        alert(`stripe price id: ${stripePriceId}`)

        try {
            const response = await fetch(`${API_URL}/stripe/subscription-flow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    stripePriceId,
                    paymentMethodId
                }),
            });

            if (!response.ok) {
                console.error(response);
                setErrorMessage(response.error?.raw?.message || 'There was an issue subscribing, you have not been charged. Please try again.');
                setIsProcessing(false);
                return null;
            }

            const data = await response.json();

            // save subscription info to Firebase
            const isSaved = await saveSubscribtionToFireDB(userId, data.customer.id, data.subscription.id, paymentMethodId);
            
            if (!isSaved) {
                setIsProcessing(false);
                return;
            }

            setTimeout(() => {
                setPaymentSuccess(true);
                setIsProcessing(false);
            }, 2000);

            setTimeout(() => {
                navigate('/dashboard', { replace: true, state: { from: location } });
            }, 2000);
        } catch (error) {
            console.error(error.message);
            setErrorMessage(error.message || 'There was an issue subscribing, you have not been charged. Please try again.');
            setIsProcessing(false);
            return null;
        }
    };

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName?.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (!formData.email?.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setIsProcessing(true);

        const card = elements.getElement(CardElement);

        try {
            const paymentMethod = await stripe.createPaymentMethod({
                type: 'card',
                card: card,
                billing_details: {
                    name: formData.fullName,
                    email: formData.email,
                }
            });

            if (paymentMethod.error) {
                console.error('Payment method creation failed:', paymentMethod.error);
            } else {
                await createCustomer(formData, paymentMethod.paymentMethod.id, stripePriceId);
                return;
            }
        } catch (error) {
            console.error('Payment processing error:', error);
        }
        setIsProcessing(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#fff',
                fontFamily: '"Inter", "system-ui", sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: grey[500],
                },
                iconColor: teal[400],
            },
            invalid: {
                color: red[400],
                iconColor: red[400],
            },
        },
        hidePostalCode: false,
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
            sx: {
                background: darkGradient,
                border: `1.5px solid ${teal[600]}`,
                borderRadius: 4,
                boxShadow: 24,
                p: 0,
            }
        }}>
            <DialogContent sx={{ p: { xs: 2, sm: 4 }, position: 'relative' }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: grey[400],
                        zIndex: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                {paymentSuccess ? (
                    <div className="max-w-md mx-auto rounded-2xl shadow-2xl p-8" style={{ background: `linear-gradient(135deg, ${teal[900]}, ${teal[700]})` }}>
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16" style={{ background: green[100], borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <CheckCircle className="w-8 h-8" style={{ color: green[600] }} />
                            </div>
                            <h2 className="text-2xl font-bold" style={{ color: teal[100], marginBottom: 8 }}>Payment Successful!</h2>
                            <p style={{ color: grey[300] }}>Thank you for subscribing</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12" style={{ background: teal[800], borderRadius: '9999px', marginBottom: 16 }}>
                                <CreditCard className="w-6 h-6" style={{ color: teal[300] }} />
                            </div>
                            <p className="text-xl font-bold" style={{ color: teal[100], marginBottom: 8 }}>Enter your card information to subscribe!</p>
                            <p style={{ color: grey[400] }}>Secure checkout powered by Stripe</p>
                        </div>
                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-semibold" style={{ color: teal[200] }}>
                                Full Name (as it appears on card)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5" style={{ color: teal[300] }} />
                                </div>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.fullName 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : ''
                                    }`}
                                    style={{
                                        background: '#23272b',
                                        color: '#fff',
                                        borderColor: errors.fullName ? red[400] : teal[700],
                                        fontWeight: 500,
                                        letterSpacing: '0.01em'
                                    }}
                                    placeholder="John Smith"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-sm flex items-center" style={{ color: red[400] }}>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold" style={{ color: teal[200] }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5" style={{ color: teal[300] }} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                        errors.email 
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                            : ''
                                    }`}
                                    style={{
                                        background: '#23272b',
                                        color: '#fff',
                                        borderColor: errors.email ? red[400] : teal[700],
                                        fontWeight: 500,
                                        letterSpacing: '0.01em'
                                    }}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm flex items-center" style={{ color: red[400] }}>
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        {/* Card Element */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold" style={{ color: teal[200] }}>
                                Card Information
                            </label>
                            <div className="p-4 border rounded-xl focus-within:ring-2 transition-all duration-200"
                                style={{
                                    background: '#23272b',
                                    borderColor: teal[700]
                                }}>
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>
                        {/* Security Notice */}
                        <div className="flex items-center justify-center space-x-2 text-sm rounded-xl p-3"
                            style={{ color: teal[200], background: teal[800] }}>
                            <Lock className="w-4 h-4" />
                            <span>Your payment information is secure and encrypted</span>
                        </div>
                        {/* Submit Button */}
                        <p className="text-sm text-red-500">{errorMessage}</p>
                        <button
                            type="submit"
                            disabled={!stripe || isProcessing}
                            className={`w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl transition-all duration-200 ${
                                !stripe || isProcessing
                                    ? ''
                                    : 'transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
                            style={{
                                background: !stripe || isProcessing
                                    ? grey[700]
                                    : `linear-gradient(90deg, ${teal[500]}, ${indigo[500]})`,
                                color: 'white',
                                cursor: !stripe || isProcessing ? 'not-allowed' : 'pointer',
                                fontWeight: 700,
                                letterSpacing: '0.02em'
                            }}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5 mr-2" />
                                    Complete Purchase
                                </>
                            )}
                        </button>
                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-xs" style={{ color: teal[200] }}>
                                Protected by 256-bit SSL encryption
                            </p>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutModal;