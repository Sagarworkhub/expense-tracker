import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import Loader from '@/components/loader';

const signUpSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

function SignUpForm() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    setIsSubmitting(true);
    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: '/dashboard',
            });
            toast.success('Sign up successful');
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    } catch (error) {
      toast.error('Failed to sign up');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPending) {
    return <Loader />;
  }

  if (session !== null) {
    navigate({ to: '/dashboard' });
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4'>
      <div className='w-full max-w-md'>
        <Card className='border-0 shadow-2xl shadow-purple-400/50 bg-white/80 backdrop-blur-sm w-full max-w-md'>
          <CardHeader className='space-y-2 text-center pb-8'>
            <div className='mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4'>
              <UserPlus className='size-6 text-white' />
            </div>
            <CardTitle className='text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
              Create your account
            </CardTitle>
            <CardDescription className='text-slate-600'>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid gap-6'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-slate-700'>
                        Name
                      </FormLabel>
                      <div className='relative'>
                        <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
                        <FormControl>
                          <Input
                            type='text'
                            className='pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-slate-700'>
                        Email
                      </FormLabel>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
                        <FormControl>
                          <Input
                            type='email'
                            className='pl-10 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-slate-700'>
                        Password
                      </FormLabel>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            className='pl-10 pr-12 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                          <span className='sr-only'>
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-slate-700'>
                        Confirm Password
                      </FormLabel>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' />
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className='pl-10 pr-12 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors'
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                          <span className='sr-only'>
                            {showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='animate-spin' />
                      Signing up...
                    </div>
                  ) : (
                    'Sign up'
                  )}
                </Button>
                <div className='text-center text-sm'>
                  Already have an account?{' '}
                  <Link
                    to='/sign-in'
                    className='underline underline-offset-4'
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/sign-up')({
  component: SignUpForm,
});
