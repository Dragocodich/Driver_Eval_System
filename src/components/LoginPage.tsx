import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Eye, EyeOff, Mail, Lock, LogIn, Info, AlertCircle } from 'lucide-react';
import { AuthService } from '../lib/auth-service';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@tristar.com',
    password: 'tristar123'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.signIn(formData.email, formData.password);
      toast.success('Login successful!');
      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More helpful error messages
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message.includes('invalid-credential') || error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.25, 0, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Section */}
        <motion.div 
          className="text-center mb-8"
          variants={logoVariants}
        >
          <motion.div 
            className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-2xl border border-white/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl text-white">📋</div>
          </motion.div>
          <motion.h1 
            className="text-3xl text-white mb-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            TRISTAR
          </motion.h1>
          <motion.p 
            className="text-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Driver Assessment System
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl p-8 relative overflow-hidden">
            {/* Background decoration */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            
            <motion.div 
              className="mb-6 text-center"
              variants={itemVariants}
            >
              <h2 className="text-2xl text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access the dashboard</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="block mb-2 text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-12 h-12 bg-gray-50/50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label htmlFor="password" className="block mb-2 text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-12 pr-12 h-12 bg-gray-50/50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Signing In...</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </form>

           
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8"
          variants={itemVariants}
        >
          <p className="text-white/80 text-sm">
            © 2025 TRISTAR. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}