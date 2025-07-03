import { CalendarIcon, Search } from 'lucide-react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { categories } from '@/lib/constants/expense-categories';
import { statuses } from '@/lib/constants/expense-status';

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export const Filters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: FiltersProps) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Search</label>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search expenses...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Category</label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='All'>All</SelectItem>
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
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Status</label>
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            {statuses.map((status) => (
              <SelectItem
                key={status}
                value={status}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>From Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={dateFrom}
              onSelect={setDateFrom}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>To Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-full justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {dateTo ? format(dateTo, 'MMM dd') : 'To'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0'>
            <Calendar
              mode='single'
              selected={dateTo}
              onSelect={setDateTo}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
