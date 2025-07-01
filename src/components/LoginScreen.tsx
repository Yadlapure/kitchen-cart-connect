
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/hooks/redux';
import { login } from '@/store/authSlice';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Login form submitted');
    
    try {
      const result = dispatch(login({ email, password }));
      
      toast.success('Login successful!');
      
      // Get redirect path from URL params
      const redirectPath = searchParams.get('redirect');
      
      // Navigate to home page by default, or use redirect path
      const targetPath = redirectPath || '/';
      
      console.log('Login successful, navigating to:', targetPath);
      
      // Navigate to the appropriate path
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-kitchen-500">
            KitchenCart Connect
          </CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-kitchen-500 hover:bg-kitchen-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-sm mb-2">Test Credentials:</h4>
            <div className="text-xs space-y-1">
              <div><strong>Customer:</strong> customer@test.com / customer123</div>
              <div><strong>Merchant:</strong> merchant@test.com / merchant123</div>
              <div><strong>Admin:</strong> admin@test.com / admin123</div>
              <div><strong>Delivery Boy:</strong> delivery@test.com / delivery123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
