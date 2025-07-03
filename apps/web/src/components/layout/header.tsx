import { SidebarTrigger } from '@/components/ui/sidebar';
import { AddExpense } from '@/components/dashboard/add-expense';
import { ModeToggle } from '../mode-toggle';

export const Header = () => {
  return (
    <header className='sticky bg-secondary top-0 z-10 w-full flex h-16 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger className='-ml-1' />
      <div className='flex items-center gap-2'>
        <h1 className='text-lg font-semibold'>Dashboard</h1>
      </div>
      <div className='ml-auto flex items-center gap-4'>
        <AddExpense />
        <ModeToggle />
      </div>
    </header>
  );
};
