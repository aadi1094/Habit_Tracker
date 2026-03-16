import { useEffect, useState } from 'react';
import './App.css';
import Auth from './Auth';
import {
  HabitDto,
  fetchHabits,
  createHabitApi,
  deleteHabitApi,
  completeHabitApi,
} from './api/client';

const getDaysInMonth = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('auth_token')),
  );
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<HabitDto[]>([]);

  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');

  useEffect(() => {
    const storedYear = localStorage.getItem('year');
    const storedMonth = localStorage.getItem('month');

    setYear(storedYear || '');
    setMonth(storedMonth || '');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    fetchHabits()
      .then(setHabits)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const changeHabit = (index: number, name: string) => {
    setHabits((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name } : item)),
    );
  };

  const tikHabit = async (index: number, day: number) => {
    const habit = habits[index];
    if (!habit) return;

    const numericYear = Number(year) || new Date().getFullYear();
    const numericMonth = Number(month) || new Date().getMonth() + 1;
    const date = new Date(numericYear, numericMonth - 1, day + 1)
      .toISOString()
      .slice(0, 10);

    try {
      const updated = await completeHabitApi(habit._id, date);
      setHabits((prev) => prev.map((item, i) => (i === index ? updated : item)));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to complete habit', error);
    }
  };

  const loadingFunction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const numericYear = Number(year) || new Date().getFullYear();
  const numericMonth = Number(month) || new Date().getMonth() + 1;
  const daysInMonth = getDaysInMonth(numericYear, numericMonth - 1);

  const dailyCompletions = Array.from({ length: daysInMonth }).map((_, d) => {
    const date = new Date(numericYear, numericMonth - 1, d + 1).toISOString().slice(0, 10);
    return habits.reduce(
      (count, habit) => (habit.completedDates.includes(date) ? count + 1 : count),
      0,
    );
  });

  const totalCells = habits.length * daysInMonth || 1;
  const completedCells = dailyCompletions.reduce((sum, v) => sum + v, 0);
  const completionRate = Math.round((completedCells / totalCells) * 100);

  const longestStreakEver = habits.reduce(
    (max, habit) => Math.max(max, habit.longestStreak ?? 0),
    0,
  );

  const weekdayStats = Array.from({ length: 7 }).map(() => ({
    completed: 0,
    total: 0,
  }));

  for (let d = 0; d < daysInMonth; d += 1) {
    const dateObj = new Date(numericYear, numericMonth - 1, d + 1);
    const weekday = dateObj.getDay(); // 0-6
    const dateStr = dateObj.toISOString().slice(0, 10);

    habits.forEach((habit) => {
      weekdayStats[weekday].total += 1;
      if (habit.completedDates.includes(dateStr)) {
        weekdayStats[weekday].completed += 1;
      }
    });
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weekdayRates = weekdayStats.map((stat, index) => {
    if (stat.total === 0) {
      return { label: weekdayNames[index], rate: 0 };
    }
    return {
      label: weekdayNames[index],
      rate: Math.round((stat.completed / stat.total) * 100),
    };
  });

  const mostMissedDay =
    weekdayRates.length > 0
      ? weekdayRates.reduce((min, current) => (current.rate < min.rate ? current : min))
      : null;
  const bestDay =
    weekdayRates.length > 0
      ? weekdayRates.reduce((max, current) => (current.rate > max.rate ? current : max))
      : null;

  const weeklyBuckets: { label: string; completed: number; total: number }[] = [];
  const maxWeeks = Math.ceil(daysInMonth / 7);

  for (let w = 0; w < maxWeeks; w += 1) {
    weeklyBuckets.push({
      label: `Week ${w + 1}`,
      completed: 0,
      total: 0,
    });
  }

  for (let d = 0; d < daysInMonth; d += 1) {
    const weekIndex = Math.floor(d / 7);
    const dateObj = new Date(numericYear, numericMonth - 1, d + 1);
    const dateStr = dateObj.toISOString().slice(0, 10);

    habits.forEach((habit) => {
      weeklyBuckets[weekIndex].total += 1;
      if (habit.completedDates.includes(dateStr)) {
        weeklyBuckets[weekIndex].completed += 1;
      }
    });
  }

  const weeklyRates = weeklyBuckets.map((week) => ({
    label: week.label,
    rate: week.total === 0 ? 0 : Math.round((week.completed / week.total) * 100),
  }));

  const monthlyDates = Array.from({ length: daysInMonth }).map(
    (_, d) => new Date(numericYear, numericMonth - 1, d + 1).toISOString().slice(0, 10),
  );

  const firstHalfDates = monthlyDates.slice(0, Math.floor(daysInMonth / 2));
  const secondHalfDates = monthlyDates.slice(Math.floor(daysInMonth / 2));

  const habitTrends = habits.map((habit) => {
    const firstHalfCompleted = firstHalfDates.filter((date) =>
      habit.completedDates.includes(date),
    ).length;
    const secondHalfCompleted = secondHalfDates.filter((date) =>
      habit.completedDates.includes(date),
    ).length;

    let trend: 'improving' | 'declining' | 'steady' = 'steady';
    if (secondHalfCompleted > firstHalfCompleted) {
      trend = 'improving';
    } else if (secondHalfCompleted < firstHalfCompleted) {
      trend = 'declining';
    }

    return {
      id: habit._id,
      name: habit.name,
      firstHalfCompleted,
      secondHalfCompleted,
      trend,
    };
  });

  const donutRadius = 32;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset =
    donutCircumference - (Math.min(Math.max(completionRate, 0), 100) / 100) * donutCircumference;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-300 grid place-items-center">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-b-transparent animate-spin"></div>
      </div>
    );
  }

  const addHabit = async () => {
    try {
      const created = await createHabitApi('New habit');
      setHabits((prev) => [...prev, created]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create habit', error);
    }
  };

  const deleteHabit = async (index: number) => {
    const habit = habits[index];
    if (!habit) return;

    try {
      await deleteHabitApi(habit._id);
      setHabits((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete habit', error);
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#fef6f6]">
      <header className="border-b border-rose-200 bg-[#f7d7d7]">
        <div className="w-full px-6 lg:px-10 py-5 flex flex-col gap-3">
          <div className="text-center">
            <p className="text-xs tracking-[0.25em] uppercase text-rose-700">
              Daily Habit Tracker
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-rose-900">
              Your habits will determine your future!
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-[#fde9e9] rounded-md px-3 py-2 border border-rose-200">
              <span className="text-xs font-medium text-rose-700">Year</span>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded border border-rose-300 bg-white px-2 py-1 text-xs w-20 focus:outline-none focus:ring-2 focus:ring-rose-300"
                type="number"
              />
              <span className="text-xs font-medium text-rose-700">Month</span>
              <input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded border border-rose-300 bg-white px-2 py-1 text-xs w-16 focus:outline-none focus:ring-2 focus:ring-rose-300"
                type="number"
                min={1}
                max={12}
              />
            </div>
            <button
              className="px-4 py-2 rounded-md bg-rose-500 text-white text-xs font-semibold shadow-sm hover:bg-rose-600 transition-colors"
              onClick={loadingFunction}
            >
              Save period
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-6 lg:px-10 py-6">
        <section className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 border-r border-rose-200 pr-0 lg:pr-6 lg:mr-6">
            <div className="border border-rose-200 rounded-md px-4 py-3 mb-6 text-center bg-white">
              <p className="text-xs text-rose-700">Month</p>
              <p className="mt-1 text-base font-semibold text-rose-900">
                {new Date(numericYear, numericMonth - 1).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="mb-6 bg-white border border-rose-200 rounded-md px-4 py-4">
              <p className="text-xs font-semibold text-rose-800 mb-3">Monthly Overview</p>
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 80 80"
                  className="w-20 h-20 text-rose-200"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r={donutRadius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-rose-100"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={donutRadius}
                    stroke="#f97373"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={donutOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px]"
                    fill="#b91c1c"
                  >
                    {completionRate}%
                  </text>
                </svg>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>
                    <span className="inline-block w-2 h-2 rounded-full bg-[#f97373] mr-1" />
                    Completed days
                  </p>
                  <p>
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-100 mr-1" />
                    Remaining days
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-700 space-y-1">
              <p>
                <span className="font-semibold text-rose-900">Total habits:</span> {habits.length}
              </p>
              <p>
                <span className="font-semibold text-rose-900">Days in month:</span> {daysInMonth}
              </p>
              <p>
                <span className="font-semibold text-rose-900">Longest streak ever:</span>{' '}
                {longestStreakEver} days
              </p>
            </div>

            <div className="mt-6 border border-rose-200 rounded-md bg-white px-4 py-4">
              <p className="text-xs font-semibold text-rose-800 mb-2">Habit Analytics</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Most consistent day</span>
                  <span className="font-semibold text-emerald-600">
                    {bestDay ? `${bestDay.label} (${bestDay.rate}%)` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Most missed day</span>
                  <span className="font-semibold text-rose-600">
                    {mostMissedDay ? `${mostMissedDay.label} (${mostMissedDay.rate}%)` : '—'}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-medium text-rose-700 mb-1">Weekly success rate</p>
                  <div className="flex gap-2">
                    {weeklyRates.map((week) => (
                      <div key={week.label} className="flex flex-col items-center flex-1">
                        <div className="relative w-full h-10 bg-rose-50 rounded">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded"
                            style={{ height: `${week.rate}%` }}
                          />
                        </div>
                        <span className="mt-1 text-[9px] text-slate-600">{week.label}</span>
                        <span className="text-[9px] text-rose-700 font-medium">
                          {week.rate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {habitTrends.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-rose-700 mb-1">
                      Habit improvement (first vs second half)
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {habitTrends.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between text-[10px] text-slate-600"
                        >
                          <span className="truncate max-w-[90px]" title={h.name}>
                            {h.name || 'Untitled habit'}
                          </span>
                          <span>
                            <span
                              className={
                                h.trend === 'improving'
                                  ? 'text-emerald-600'
                                  : h.trend === 'declining'
                                  ? 'text-rose-600'
                                  : 'text-slate-600'
                              }
                            >
                              {h.trend === 'improving'
                                ? '▲'
                                : h.trend === 'declining'
                                ? '▼'
                                : '•'}
                            </span>{' '}
                            {h.firstHalfCompleted} → {h.secondHalfCompleted}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="flex-1 flex flex-col bg-white border border-rose-200 rounded-md shadow-sm px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-rose-900">Tracker</h2>
              <button
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium shadow-sm hover:bg-emerald-600 transition-colors"
                onClick={addHabit}
              >
                + Add habit
              </button>
            </div>

            <div className="border border-rose-100 rounded-md overflow-hidden tracker-container overflow-x-auto max-h-[420px] overflow-y-auto">
              <div className="bg-[#fbe2e2] border-b border-rose-200 text-[10px] text-rose-900 tracker-header">
                <div className="grid grid-cols-[minmax(110px,0.6fr)_1fr_auto] min-w-max">
                  <div className="px-3 py-2 font-semibold border-r border-rose-200">Habit</div>
                  <div
                    className="px-2 py-2 grid gap-[2px]"
                    style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1.25rem)` }}
                  >
                    {Array.from({ length: daysInMonth }).map((_, d) => {
                      const dateObj = new Date(numericYear, numericMonth - 1, d + 1);
                      const weekday = dateObj
                        .toLocaleDateString('default', { weekday: 'short' })
                        .slice(0, 3);
                      return (
                        <div key={d} className="text-center leading-tight flex flex-col items-center">
                          <div className="text-[9px] text-rose-700 leading-none">{weekday}</div>
                          <div className="text-[10px] leading-none mt-[1px]">{d + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-3 py-2" />
                </div>
              </div>

              <div className="bg-white">
                {habits.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No habits yet. Use &ldquo;Add habit&rdquo; to start tracking.
                  </div>
                )}

                {habits.map((habit, index) => (
                  <div
                    key={habit._id}
                    className="grid grid-cols-[minmax(110px,0.6fr)_1fr_auto] min-w-max border-t border-rose-100 text-[11px]"
                  >
                    <div className="px-3 py-1 flex flex-col justify-center gap-1 border-r border-rose-100">
                      <input
                        className="rounded border border-rose-200 bg-[#fff9f9] px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-300"
                        placeholder="Habit name"
                        value={habit.name}
                        onChange={(e) => changeHabit(index, e.target.value)}
                      />
                    </div>
                    <div
                      className="px-2 py-1 grid gap-[2px]"
                      style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1.25rem)` }}
                    >
                      {Array.from({ length: daysInMonth }).map((_, d) => {
                        const date = new Date(
                          numericYear,
                          numericMonth - 1,
                          d + 1,
                        )
                          .toISOString()
                          .slice(0, 10);
                        const isChecked = habit.completedDates.includes(date);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => tikHabit(index, d)}
                            className={`w-5 h-5 border rounded-sm flex items-center justify-center text-[9px] ${
                              isChecked
                                ? 'bg-[#f9a8a8] border-[#f97373] text-white'
                                : 'bg-white border-rose-200 text-transparent hover:bg-rose-50'
                            }`}
                          >
                            ✓
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-3 py-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => deleteHabit(index)}
                        className="px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-[10px] text-rose-700 hover:bg-rose-100 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
