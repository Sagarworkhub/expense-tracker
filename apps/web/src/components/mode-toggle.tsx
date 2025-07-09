import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light',
    icon: Sun,
    description: 'Light mode',
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode',
  },
  {
    value: 'system' as const,
    label: 'System',
    icon: Monitor,
    description: 'Follow system preference',
  },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='relative bg-background border-border hover:bg-accent hover:border-emerald-accent/30 transition-all duration-200 group'
        >
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:text-amber-600' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-slate-700 dark:text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-200' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        side='bottom'
        avoidCollisions
        className='w-48 border-border shadow-xl backdrop-blur-sm bg-popover/95'
      >
        <div className='px-2 py-1.5'>
          <p className='text-sm font-medium text-popover-foreground'>Theme</p>
          <p className='text-xs text-muted-foreground'>
            Choose your preferred theme
          </p>
        </div>
        <DropdownMenuSeparator className='bg-border' />

        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className='flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent focus:bg-accent group transition-colors'
            >
              <div
                className={cn(
                  'flex items-center justify-center size-8 rounded-lg transition-all duration-200',
                  isSelected
                    ? 'bg-emerald-primary shadow-sm'
                    : 'bg-accent/50 group-hover:bg-accent'
                )}
              >
                <Icon className='size-4 text-popover-foreground' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <div>
                    <span className='font-medium text-popover-foreground'>
                      {option.label}
                    </span>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className='size-4 text-emerald-primary transition-all duration-200' />
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className='bg-border' />
        <div className='px-3 py-2'>
          <p className='text-xs text-muted-foreground'>
            Current:{' '}
            <span className='font-medium capitalize text-popover-foreground'>
              {theme}
            </span>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
