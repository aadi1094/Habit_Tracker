

const Habit = ({habit, changeHabit, index, tikHabit}:{
    habit: {
        habit: string;
        checkboxes: boolean[];
    },
    changeHabit: (index: number, habit: string) => void,
    index:number,
    tikHabit: (index: number, day: number) => void
}) => {
  return (
    <div className='bg-slate-500 flex h-24 p-4'>
          <div className=''>
            <input className='h-16' placeholder='Enter Habit' value={habit.habit} onChange={(e)=>{
                changeHabit(index, e.target.value)
            }} />
          </div>
          <div className='mx-2 flex'>
            {
              habit.checkboxes.map((val, d)=>(
                <div key={d} className='text-center'>
                  <label>{d+1}</label>
                  <input onClick={()=>{
                    tikHabit(index, d)
                    
                  }} checked={val} key={index} type='checkbox' className='w-5 h-5 m-1'/>
                </div>
              ))
            }
          </div>
        </div>
  )
}

export default Habit