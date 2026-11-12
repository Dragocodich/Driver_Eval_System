import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Eye, EyeOff, Mail, Lock, LogIn, CheckCircle2, BarChart3, Users, Gauge } from 'lucide-react';
import { AuthService } from '../lib/auth-service';
import { toast } from 'sonner';
import { BrandMark } from './BrandMark';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_32px_80px_rgba(2,8,23,0.35)] lg:grid-cols-[1.08fr_0.92fr]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="relative hidden overflow-hidden bg-[#0a2342] p-10 text-white lg:flex lg:flex-col lg:justify-between" variants={logoVariants}>
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <div className="mb-14 flex items-center gap-3">
              <BrandMark className="h-12 w-12 rounded-2xl ring-1 ring-white/20" />
              <div>
                <div className="text-xl font-bold tracking-[0.2em]">TRISTAR</div>
                <div className="text-xs text-slate-300">Driver Assessment System</div>
              </div>
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Safety intelligence</p>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.15] tracking-tight">
              Better insight for safer drivers.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Monitor performance, identify coaching opportunities, and manage every assessment from one secure workspace.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, label: 'Live KPIs' },
              { icon: Users, label: 'Driver records' },
              { icon: Gauge, label: 'Clear outcomes' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <Icon className="mb-3 h-5 w-5 text-cyan-300" />
                <span className="text-xs text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="relative p-7 sm:p-10 lg:p-12" variants={itemVariants}>
          <Card className="border-0 bg-transparent p-0 shadow-none">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <BrandMark className="h-11 w-11 rounded-xl" iconClassName="h-5 w-5" />
              <div>
                <div className="font-bold tracking-[0.18em] text-slate-900">TRISTAR</div>
                <div className="text-xs text-slate-500">Driver Assessment System</div>
              </div>
            </div>
            
            <motion.div 
              className="mb-8 text-left"
              variants={itemVariants}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Secure access
              </div>
              <h2 className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h2>
              <p className="text-sm leading-6 text-slate-500">Enter your credentials to continue to your workspace.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 pr-11 text-slate-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    placeholder="Enter your password"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  className="h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.99]"
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
      </motion.div>
    </div>
  );
}
