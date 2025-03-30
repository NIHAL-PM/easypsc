
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoveLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-7xl font-bold rounded-2xl w-32 h-32 flex items-center justify-center"
          >
            404
          </motion.div>
          
          <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Page Not Found
          </h1>
          
          <p className="text-muted-foreground">
            The page you are looking for might have been removed or is temporarily unavailable.
          </p>
          
          <Button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all rounded-lg shadow-md hover:shadow-xl"
          >
            <MoveLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
