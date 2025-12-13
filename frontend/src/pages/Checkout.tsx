import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AddressSelection from '@/components/checkout/AddressSelection';
import OrderSummary from '@/components/checkout/OrderSummary';
import QRCodePayment from '@/components/checkout/QRCodePayment';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';
import AnimatedPage from '@/components/ui/AnimatedPage';

const Checkout = () => {
    const { items, totalPrice, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<'address' | 'payment'>('address');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
        // Pre-select default address if available
        if (user?.address && user.address.length > 0 && !selectedAddressId) {
            const defaultAddr = user.address.find(a => a.isDefault) || user.address[0];
            setSelectedAddressId(defaultAddr.id);
        }
    }, [items, navigate, user, selectedAddressId]);

    const handleProceedToPayment = () => {
        if (!selectedAddressId) {
            toast.error('Please select a shipping address');
            return;
        }
        setStep('payment');
    };

    const handlePaymentComplete = async () => {
        if (!isAuthenticated || !user) return;

        setIsProcessing(true);
        try {
            const orderItems = items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            }));

            const token = localStorage.getItem('token');
            const response = await fetch(API_ENDPOINTS.ORDERS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: orderItems,
                    total: totalPrice,
                    status: 'completed',
                    addressId: selectedAddressId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const orderResult = await response.json();
            toast.success('Order placed successfully!');
            clearCart();

            navigate('/checkout-success', {
                state: {
                    orderId: orderResult.order._id,
                    orderTotal: totalPrice
                }
            });

        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="section-container py-8">
                <h1 className="text-3xl font-serif text-sawatsya-wood mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {step === 'address' ? (
                            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                                <AddressSelection
                                    selectedAddressId={selectedAddressId}
                                    onSelectAddress={setSelectedAddressId}
                                />
                                <div className="mt-6 flex justify-end">
                                    <Button onClick={handleProceedToPayment} size="lg">
                                        Proceed to Payment
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-serif font-medium">Payment</h2>
                                    <Button variant="ghost" onClick={() => setStep('address')}>Change Address</Button>
                                </div>
                                <QRCodePayment
                                    amount={totalPrice}
                                    onPaymentComplete={handlePaymentComplete}
                                    onCancel={() => setStep('address')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <OrderSummary />
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Checkout;
