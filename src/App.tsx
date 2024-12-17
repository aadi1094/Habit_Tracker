import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Habit from './component/Habit'

function App() {
  const [habits, setHabits] = useState<{
    habit:string,
    checkboxes:boolean[]
  }[]>([
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
    {
      habit:"",
      checkboxes:new Array(31).fill(false)
    },
  ])


  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");


  useEffect(()=>{
    const habitsdata = localStorage.getItem('habits')
    const yeardata = localStorage.getItem('year')
    const monthdata = localStorage.getItem('month')
    const habitsarray = JSON.parse(habitsdata || "");
    setYear(yeardata || "")
    setMonth(monthdata || "")
    setHabits(habitsarray)
  },[])

  const changeHabit = (index:number, habit:string) => {
      setHabits(habits.map((item, i) => {
        if(i == index){
          item.habit = habit
        }
        return item
      }))  
  }

  const tikHabit = (index:number, day: number) => {
    setHabits(habits.map((item, i) => {
      if(i == index){
        const updatedCheckboxes = item.checkboxes.map((checkbox, d) => {
          if(d == day){
            return !checkbox
          }
          console.log(item.checkboxes);          
          return checkbox
        })

        return {...item, checkboxes: updatedCheckboxes}
      }
      return item
    })) 
  }

  const saveHabits = () => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('year', year);
    localStorage.setItem('month', month);
  }

  return (
    <>
      <div>
        <div className='bg-slate-200 flex justify-between items-center pr-44'>
          <div>
            <h1 className='text text-black text-6xl font-serif'>Habit Tracker</h1>
          </div>
          <div className='space-y-1'>
            <div className=''>
              <h1>Year:
                 <input value={year} className='m-2 rounded-sm border border-blue-400 w-24' type="text" onChange={(e)=>{
                  setYear(e.target.value)
                 }} /> 
              </h1>
            </div>
            <div>
              <h1>Month:
                <input value={month} onChange={(e)=>{
                  setMonth(e.target.value)
                 }} className='m-2 rounded-sm border border-blue-400 w-32' type="text" />
              </h1>
            </div>
          </div>
          <button className='p-3 text-white bg-green-500 rounded-lg' onClick={saveHabits}>Save</button>
        </div>
        
        {
          habits.map((habit, index)=>{
            return (
              <Habit tikHabit={tikHabit} key={index} index={index} changeHabit={changeHabit} habit={habit} />
            )
          })
        }
        
        
      </div>
    </>
  )
}



export default App
