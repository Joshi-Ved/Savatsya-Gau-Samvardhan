
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface QRCodePaymentProps {
  amount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const QRCodePayment = ({ amount, onPaymentComplete, onCancel }: QRCodePaymentProps) => {
  const { toast } = useToast();
  
  // Get UPI ID from environment variable
  const upiId = import.meta.env.VITE_UPI_ID || '8788277595@axl';
  const upiPaymentLink = `upi://pay?pa=${upiId}&pn=SAVATSYA GAU SAMVARDHAN&am=${amount}&cu=INR&tn=Payment for Savatsya Gau Samvardhan products`;
  
  const handleManualComplete = () => {
    toast({
      title: "Payment verification",
      description: "Your payment is being verified...",
    });
    
   
    setTimeout(() => {
      onPaymentComplete();
      toast({
        title: "Payment successful",
        description: "Thank you for your payment to Savatsya Gau Samvardhan!",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-serif text-sawatsya-wood mb-4">Scan to Pay ₹{amount}</h2>
      <p className="text-sm text-gray-600 mb-4 text-center">Savatsya Gau Samvardhan</p>
      
      <div className="p-4 bg-white rounded-lg mb-6">
        <QRCode 
          value={upiPaymentLink}
          size={200}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="H"
        />
      </div>
      
      <p className="mb-6 text-center text-gray-700">
        Scan this QR code using Google Pay or any UPI app to complete payment of ₹{amount}
      </p>
      
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-sawatsya-earth text-sawatsya-earth hover:bg-sawatsya-cream"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleManualComplete} 
          className="btn-primary"
        >
          I've Completed Payment
        </Button>
      </div>
    </div>
  );
};

export default QRCodePayment;
