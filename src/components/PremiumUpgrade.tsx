import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2Icon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';

interface PremiumUpgradeProps {
  onClose?: () => void;
}

const PremiumUpgrade = ({ onClose }: PremiumUpgradeProps = {}) => {
  const { user, upgradeUserToPremium } = useAppStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to upgrade.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      upgradeUserToPremium(user.id);
      
      setIsProcessing(false);
      
      toast({
        title: "Upgrade Successful!",
        description: "You now have access to premium features.",
      });
      
      if (onClose) {
        onClose();
      } else {
        navigate('/');
      }
    }, 2000);
  };
  
  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-12 px-4 max-w-md"
    >
      <Card className="bg-card/95 backdrop-blur-sm border border-border/40 shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Upgrade to Premium
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Unlock unlimited access to all features and content.
          </p>
          
          <div className="space-y-4">
            {/* Pricing Card */}
            <div className="border rounded-lg p-4 bg-secondary/50 border-secondary/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Premium Plan</h3>
                <Badge variant="secondary">Most Popular</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Unlimited questions, detailed analytics, and priority support.
              </p>
              <div className="text-2xl font-bold">$9.99/month</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-3">
                <li>Unlimited question generation</li>
                <li>Detailed performance analytics</li>
                <li>Priority customer support</li>
                <li>Ad-free experience</li>
              </ul>
              <Button 
                className="w-full mt-4" 
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            </div>
            
            {/* Confirmation/Error Message */}
            {isProcessing && (
              <div className="text-center text-muted-foreground">
                <Loader2Icon className="inline-block mr-2 h-5 w-5 animate-spin" />
                Processing your upgrade...
              </div>
            )}
            
            {user && user.isPremium && (
              <div className="text-center text-green-500">
                <CheckCircle2Icon className="inline-block mr-2 h-5 w-5" />
                You are already a premium member!
              </div>
            )}
            
            {/* Back Button */}
            <Button variant="ghost" className="w-full" onClick={handleGoBack}>
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PremiumUpgrade;
