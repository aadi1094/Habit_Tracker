import { useEffect, useState } from 'react';
import './App.css';
import Habit from './component/Habit';

function App() {
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<{
    habit: string;
    checkboxes: boolean[];
  }[]>([
    ...Array(6).fill({
      habit: "",
      checkboxes: new Array(31).fill(false),
    }),
  ]);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    const habitsdata = localStorage.getItem('habits');
    const yeardata = localStorage.getItem('year');
    const monthdata = localStorage.getItem('month');
    if (habitsdata) {
      const habitsarray = JSON.parse(habitsdata || "");
      setHabits(habitsarray);
    }
    setYear(yeardata || "");
    setMonth(monthdata || "");
  }, []);

  const changeHabit = (index: number, habit: string) => {
    setHabits(
      habits.map((item, i) => {
        if (i === index) {
          return { ...item, habit }; // Create a new object for the updated habit
        }
        return item; // Return the other habits unchanged
      })
    );
  };
  

  const tikHabit = (index: number, day: number) => {
    setHabits(
      habits.map((item, i) => {
        if (i === index) {
          const updatedCheckboxes = item.checkboxes.map((checkbox, d) => {
            if (d === day) {
              return !checkbox;
            }
            return checkbox;
          });

          return { ...item, checkboxes: updatedCheckboxes };
        }
        return item;
      })
    );
  };

  const saveHabits = () => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('year', year);
    localStorage.setItem('month', month);
  };

  const loadingFunction = () => {
    setLoading(true);
    saveHabits();

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-300 grid place-items-center">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-b-transparent animate-spin"></div>
      </div>
    );
  }

  const addHabit=()=>{
    const newHabit={
      habit: "",
      checkboxes:new Array(31).fill(false)
    }
    setHabits([...habits, newHabit])
  }

  const deleteHabit = (index:number) => {
    setHabits(habits.filter((_, i)=>{
      return i != index
    }))
  }

  return (
    <>
      <div className="w-full  px-4 sm:px-6 lg:px-8 bg-blue-800 py-3">
        <div className="bg-slate-200 flex flex-col md:flex-row justify-between items-center py-4 px-4 md:px-8 rounded-md">
          <h1 className="text-black text-4xl md:text-6xl font-serif text-center md:text-left mb-4 md:mb-0">Habit Tracker</h1>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <label className="mr-2">Year:</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-sm border border-blue-400 w-20 md:w-24 px-2 py-1"
                type="text"
              />
            </div>
            <div className="flex items-center">
              <label className="mr-2">Month:</label>
              <input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-sm border border-blue-400 w-28 md:w-32 px-2 py-1"
                type="text"
              />
            </div>
          </div>
          <button
            className="p-2 md:p-3 text-white bg-green-500 rounded-lg mt-4 md:mt-0"
            onClick={loadingFunction}
          >
            Save
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit, index) => (
            <Habit
              tikHabit={tikHabit}
              key={index}
              index={index}
              changeHabit={changeHabit}
              habit={habit}
              deleteHabit={deleteHabit}
            />
          ))}
          
        <div className='flex justify-center items-center  w-full '>
          <button className='text text-white bg-indigo-500 px-6 py-4 rounded-md text-2xl'onClick={addHabit}>Add Habit</button>
        </div>
        </div>
      </div>
    </>
  );
}

export default App;
