import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';

const categories = [
  'Travel',
  'Utility',
  'Grocery',
  'Food',
  'Shopping',
  'Entertainment',
  'Medical',
  'Fitness',
  'Services',
  'Other',
] as const;

type ExpenseCategory = (typeof categories)[number];

type ExpenseFormValues = {
  amount: string;
  category: string;
  description: string;
  date: Date | undefined;
};

export const AddExpense = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    defaultValues: {
      amount: '',
      category: '',
      description: '',
      date: undefined,
    },
  });

  const createMutation = useMutation({
    ...trpc.expense.create.mutationOptions({
      onSuccess: () => {
        reset();
        setOpen(false);
        toast.success('Expense added successfully');

        // Invalidate all expense-related queries to refresh data across the dashboard
        queryClient.invalidateQueries({ queryKey: [['expense']] });
      },
      onError: (error) => {
        toast.error(`Failed to add expense: ${error.message}`);
      },
    }),
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      createMutation.mutate({
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category as ExpenseCategory,
        date: data.date?.toISOString() || new Date().toISOString(),
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error('Failed to add expense');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button className='w-full'>
          <Plus className='h-4 w-4' />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to your account.
          </DialogDescription>
        </DialogHeader>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='amount'>Amount *</Label>
                <Input
                  id='amount'
                  type='number'
                  step='1'
                  placeholder='0.00'
                  {...register('amount', {
                    required: 'Amount is required',
                    min: {
                      value: 0.01,
                      message: 'Amount must be greater than 0',
                    },
                  })}
                  aria-invalid={errors.amount ? 'true' : 'false'}
                />
                {errors.amount && (
                  <p className='text-sm text-red-500'>
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Controller
                  name='category'
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className='text-sm text-red-500'>
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Date *</Label>
              <Controller
                name='date'
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        type='button'
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {field.value
                          ? format(field.value, 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className='text-sm text-red-500'>{errors.date.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description *</Label>
              <Textarea
                id='description'
                placeholder='Describe your expense...'
                {...register('description', {
                  required: 'Description is required',
                })}
                aria-invalid={errors.description ? 'true' : 'false'}
              />
              {errors.description && (
                <p className='text-sm text-red-500'>
                  {errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant='outline'
                  type='button'
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Submitting...
                  </div>
                ) : (
                  'Submit'
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
