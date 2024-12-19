
const Habit = ({
  habit,
  changeHabit,
  index,
  tikHabit,
  deleteHabit
}: {
  habit: {
    habit: string;
    checkboxes: boolean[];
  };
  changeHabit: (index: number, habit: string) => void;
  index: number;
  tikHabit: (index: number, day: number) => void;
  
  deleteHabit: (index: number) => void;
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 border shadow-xl flex flex-col items-start p-4 rounded-md">
      <input
        className="mb-4  md:mr-4 flex-grow rounded-md px-2 py-1 h-10 text-blue-950"
        placeholder="Enter Habit"
        value={habit.habit}
        onChange={(e) => changeHabit(index, e.target.value)}
      />
      <div className="flex flex-wrap gap-2 md:gap-1 overflow-x-auto">
        {habit.checkboxes.map((val, d) => (
          <div key={d} className="text-center">
            <label className="block text-sm ">{d + 1}</label>
            <input
              onChange={() => tikHabit(index, d)}
              checked={val}
              type="checkbox"
              className="w-5 h-5 accent-black"
            />
          </div>  
        ))}
      </div>
      
      <div className="flex justify-center items-center  w-full ">
      <button onClick={()=>{
        deleteHabit(index)
      }} className="px-4 py-2 bg-red-500 rounded-md ">Delete</button>
      </div>
      
    </div>
  );
};

export default Habit;
