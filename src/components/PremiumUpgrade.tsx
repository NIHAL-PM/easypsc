
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';

interface PremiumUpgradeProps {
  onClose?: () => void;
}

const PremiumUpgrade = ({ onClose }: PremiumUpgradeProps = {}) => {
  const { user, setUser } = useAppStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  
  if (!user) return null;
  
  // Don't show if already premium
  if (user.isPremium && !isSuccess) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      toast({
        title: 'Invalid form',
        description: 'Please fill in all the payment details',
        variant: 'destructive'
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Update user to premium
      setUser({
        ...user,
        isPremium: true
      });
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast({
        title: 'Payment successful',
        description: 'Welcome to Premium! You now have unlimited access.',
      });
    }, 2000);
  };
  
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto mt-10"
      >
        <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-6 pt-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="mx-auto mb-4 bg-green-100 w-16 h-16 flex items-center justify-center rounded-full"
            >
              <CheckCircle2Icon className="h-8 w-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl">Upgrade Complete!</CardTitle>
            <CardDescription>
              You are now a premium member with unlimited access
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              Thank you for supporting EasyPSC. Enjoy unlimited questions, personalized analytics, and more!
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto mt-10"
    >
      <Card className="overflow-hidden border border-border/40 shadow-md bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            Get unlimited questions for just ₹20/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-accent/20 p-4 mb-4">
            <h3 className="font-medium mb-2">Premium Benefits</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                <span>Unlimited questions every month</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                <span>Personalized performance analytics</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                <span>Access to all difficulty levels</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                <span>No ads or interruptions</span>
              </li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input 
                id="name" 
                placeholder="John Smith"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <Input 
                id="card" 
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                  id="cvv" 
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full mt-6"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ₹20 - Upgrade Now</>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <p className="text-xs text-muted-foreground">
            Your payment information is securely processed. Cancel anytime.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PremiumUpgrade;
