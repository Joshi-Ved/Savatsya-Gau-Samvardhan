import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const OrderSummary = () => {
    const { items, totalPrice } = useCart();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                            <div className="flex-1 pr-4">
                                <span className="font-medium">{item.product.name}</span>
                                <span className="text-muted-foreground ml-2">x {item.quantity}</span>
                            </div>
                            <span>₹{item.product.price * item.quantity}</span>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSummary;
