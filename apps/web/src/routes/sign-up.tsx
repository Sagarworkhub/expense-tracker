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
    <div className='h-screen w-screen flex items-center justify-center'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Create an account</CardTitle>
          <CardDescription>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer'
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
                className='w-full cursor-pointer'
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
  );
}

export const Route = createFileRoute('/sign-up')({
  component: SignUpForm,
});
