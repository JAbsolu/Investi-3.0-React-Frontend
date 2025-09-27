import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Mail, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [customerId, setCustomerId] = useState(null);
    const [paymentMethodId, setPaymentMethodId] = useState(null);
    const { email } = useAuth();

    const location = useLocation();

    useEffect(() => {
       setFormData(prev => ({
                ...prev,
                stripePriceId: location.state?.stripePriceId
            }));
    }, [location.state.stripePriceId]);

    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        stripePriceId: ''   
    });

    useEffect(() => {
        if (email) {
            setFormData(prev => ({
                ...prev,
                email: email
            }));
        }
    }, [email]);

    const createCustomer = async (form, paymentMethodId) => {
        if (!form.email || !form.fullName) {
            console.error('Email and full name are required to create a customer.');
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/stripe/create-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    paymentMethodId
                }),
            })

            if (!response.ok) {
                console.error('Failed to create customer:', response.statusText);      
                return null;
            }

            const data = await response.json();
            setCustomerId(data.customerStripeId);

            setTimeout(() => {
                    setPaymentSuccess(true);
                    setIsProcessing(false);
            }, 2000);
        } catch (error) {
            console.error('Error creating customer:', error);
            return null;
        }
    }

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        console.log('Validating form data:', formData, email);
        
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
                console.log('Payment method created:', paymentMethod);
                await createCustomer(formData, paymentMethod.paymentMethod.id);
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
                color: '#1f2937',
                fontFamily: '"Inter", "system-ui", sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: '#9ca3af',
                },
                iconColor: '#6b7280',
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
            },
        },
        hidePostalCode: false,
    };

    if (paymentSuccess) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
                    <p className="text-gray-600">Secure checkout powered by Stripe</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
                    <div onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                                Full Name (as it appears on card)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
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
                                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    }`}
                                    placeholder="John Smith"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-sm text-red-600 flex items-center">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
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
                                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    }`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600 flex items-center">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Card Element */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Card Information
                            </label>
                            <div className="p-4 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                            <Lock className="w-4 h-4" />
                            <span>Your payment information is secure and encrypted</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={!stripe || isProcessing}
                            className={`w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white transition-all duration-200 ${
                                !stripe || isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105 shadow-lg hover:shadow-xl'
                            }`}
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
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Protected by 256-bit SSL encryption
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                            <Lock className="w-3 h-3 mr-1" />
                            SSL Secured
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div>256-bit Encryption</div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div>PCI Compliant</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;