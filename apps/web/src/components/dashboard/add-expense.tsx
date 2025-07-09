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
import {
  CalendarIcon,
  DollarSign,
  FileText,
  Loader2,
  MessageCircle,
  Plus,
  Receipt,
  Tag,
} from 'lucide-react';
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
      await createMutation.mutateAsync({
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    setOpen(open);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button className='bg-emerald-primary hover:bg-emerald-secondary text-emerald-primary-foreground shadow-lg transition-all duration-200 transform hover:scale-[1.02]'>
          <Plus className='size-4' />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] border-0 shadow-2xl shadow-slate-200/50 bg-card backdrop-blur-sm'>
        <DialogHeader className='space-y-3 pb-6'>
          <div className='flex items-center gap-3'>
            <div className='size-10 bg-emerald-primary rounded-lg flex items-center justify-center'>
              <Receipt className='size-5 text-emerald-primary-foreground' />
            </div>
            <div>
              <DialogTitle className='text-xl font-semibold text-card-foreground'>
                Add New Expense
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                Track your spending by adding expense details below
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='amount'>
                  <DollarSign className='size-4 text-emerald-secondary' />
                  Amount *
                </Label>
                <Input
                  id='amount'
                  type='number'
                  step='1'
                  placeholder='0.00'
                  className={cn(
                    'h-11 border-slate-200 focus-visible:border-emerald-accent focus-visible:ring-emerald-accent/20 transition-all duration-200 bg-white/95 backdrop-blur-sm'
                  )}
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
                <Label htmlFor='category'>
                  <Tag className='size-4 text-emerald-secondary' />
                  Category *
                </Label>
                <Controller
                  name='category'
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-full h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200',
                          errors.category &&
                            'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        )}
                      >
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent className='max-h-60 bg-popover border-border'>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className='flex items-center gap-2 focus:bg-accent focus:text-accent-foreground'
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
              <Label>
                <CalendarIcon className='size-4 text-emerald-secondary' />
                Date *
              </Label>
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
                          'w-full h-11 justify-start text-left font-normal border-slate-200 hover:border-emerald-300 transition-all duration-200',
                          !field.value && 'text-muted-foreground',
                          errors.date && 'border-red-300 focus:border-red-500'
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
                        className='rounded-lg border border-slate-200'
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
              <Label htmlFor='description'>
                <FileText className='size-4 text-emerald-secondary' />
                Description *
              </Label>
              <Textarea
                id='description'
                placeholder='Describe your expense...'
                className='min-h-20 border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 transition-all duration-200 resize-none bg-white/95 backdrop-blur-sm'
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

            <DialogFooter className='gap-3'>
              <DialogClose asChild>
                <Button
                  variant='outline'
                  type='button'
                  className='h-11 bg-background border-border hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='h-11 bg-gradient-to-r from-emerald-primary to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] min-w-[120px]'
              >
                {isSubmitting ? (
                  <div className='flex items-center gap-2'>Saving...</div>
                ) : (
                  <div className='flex items-center gap-2'>Save</div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
