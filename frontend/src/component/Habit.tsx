
import type { HabitDto } from '../api/client';

type HabitProps = {
  habit: HabitDto;
  changeHabit: (index: number, name: string) => void;
  index: number;
  tikHabit: (index: number, day: number) => void;
  deleteHabit: (index: number) => void;
  daysInMonth: number;
  year: number;
  month: number;
};

const Habit = ({
  habit,
  changeHabit,
  index,
  tikHabit,
  deleteHabit,
  daysInMonth,
  year,
  month,
}: HabitProps) => {
  const isDayCompleted = (dayIndex: number) => {
    const date = new Date(year, month - 1, dayIndex + 1).toISOString().slice(0, 10);
    return habit.completedDates.includes(date);
  };

  return (
    <div className="hidden">
      {/* This component's logic is now inlined in App.tsx for a spreadsheet-style layout.
          Kept for type sharing and potential future reuse. */}
      {Array.from({ length: daysInMonth }).map((_, d) => (
        <button
          key={d}
          type="button"
          onClick={() => tikHabit(index, d)}
          className={isDayCompleted(d) ? 'bg-emerald-500' : 'bg-slate-200'}
        >
          {d + 1}
        </button>
      ))}
      <button type="button" onClick={() => deleteHabit(index)}>
        Delete
      </button>
    </div>
  );
};

export default Habit;
