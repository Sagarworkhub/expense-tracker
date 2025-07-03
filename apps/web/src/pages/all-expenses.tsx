import { trpc } from '@/utils/trpc';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filters } from '@/components/expense/filters';
import { ExpensesTable } from '@/components/expense/expenses-table';
import { Skeleton } from '@/components/ui/skeleton';
import { categories } from '@/lib/constants/expense-categories';
import { statuses } from '@/lib/constants/expense-status';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define types for the categories and statuses
type Category = (typeof categories)[number] | 'All';
type Status = (typeof statuses)[number] | 'all';

// Number of items per page
const PAGE_SIZE = 10;

export const AllExpenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedStatus, setSelectedStatus] = useState<Status>('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(0);

  // Add debounce for search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, selectedStatus, debouncedSearchTerm, dateFrom, dateTo]);

  // Get current page of expenses
  const { data, isLoading } = useQuery({
    ...trpc.expense.getAll.queryOptions({
      sortBy: 'date',
      sortDirection: 'desc',
      status: selectedStatus,
      category: selectedCategory,
      searchTerm: debouncedSearchTerm,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      limit: PAGE_SIZE,
      offset: currentPage * PAGE_SIZE,
    }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const expenses = data?.data || [];
  const totalCount = data?.pagination.total || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages - 1;

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Calculate the range of items being displayed
  const startItem = totalCount === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endItem = Math.min((currentPage + 1) * PAGE_SIZE, totalCount);

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>All Expenses</h1>
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory as (category: string) => void}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus as (status: string) => void}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      {isLoading ? (
        <div className='space-y-2'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      ) : expenses && expenses.length > 0 ? (
        <>
          <ExpensesTable expenses={expenses} />

          {/* Pagination */}
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Showing {startItem}-{endItem} of {totalCount}
            </p>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className='h-4 w-4' />
                <span className='sr-only'>Previous Page</span>
              </Button>
              <div className='text-sm'>
                Page {currentPage + 1} of {totalPages}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleNextPage}
                disabled={!hasNextPage}
              >
                <ChevronRight className='h-4 w-4' />
                <span className='sr-only'>Next Page</span>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className='text-center py-10'>
          <p className='text-muted-foreground'>No expenses found</p>
        </div>
      )}
    </div>
  );
};
