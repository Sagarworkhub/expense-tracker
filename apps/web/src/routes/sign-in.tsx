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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import Loader from '@/components/loader';
import { toast } from 'sonner';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

function SignInForm() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: SignInFormValues) {
    setIsSubmitting(true);
    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: '/dashboard',
            });
            toast.success('Sign in successful');
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    } catch (error) {
      toast.error('Failed to sign in');
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
    <div className='h-screen w-screen flex items-center justify-center'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
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
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer'
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
              <Button
                type='submit'
                className='w-full cursor-pointer'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='animate-spin' />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>
          <div className='text-center text-sm mt-4'>
            Don&apos;t have an account?{' '}
            <Link
              to='/sign-up'
              className='underline underline-offset-4'
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/sign-in')({
  component: SignInForm,
});
