
const Habit = ({
  habit,
  changeHabit,
  index,
  tikHabit,
}: {
  habit: {
    habit: string;
    checkboxes: boolean[];
  };
  changeHabit: (index: number, habit: string) => void;
  index: number;
  tikHabit: (index: number, day: number) => void;
}) => {
  return (
    <div className="bg-slate-500 flex flex-col md:flex-row items-start p-4 rounded-md">
      <input
        className="mb-4 md:mb-0 md:mr-4 flex-grow rounded-md px-2 py-1 h-10"
        placeholder="Enter Habit"
        value={habit.habit}
        onChange={(e) => changeHabit(index, e.target.value)}
      />
      <div className="flex flex-wrap gap-2 md:gap-1 overflow-x-auto">
        {habit.checkboxes.map((val, d) => (
          <div key={d} className="text-center">
            <label className="block text-sm">{d + 1}</label>
            <input
              onClick={() => tikHabit(index, d)}
              checked={val}
              type="checkbox"
              className="w-5 h-5"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Habit;
