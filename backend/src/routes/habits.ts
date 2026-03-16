import { Router } from 'express';
import { Habit } from '../models/Habit';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const habits = await Habit.find({ userId: req.user.id, isArchived: false }).exec();
  return res.json(habits);
});

router.post('/', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { name, description, frequency } = req.body as {
    name?: string;
    description?: string;
    frequency?: 'daily' | 'weekly' | 'custom';
  };

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const habit = await Habit.create({
    userId: req.user.id,
    name,
    description,
    frequency: frequency || 'daily',
  });

  return res.status(201).json(habit);
});

router.put('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id } = req.params;

  const habit = await Habit.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    req.body,
    { new: true },
  ).exec();

  if (!habit) {
    return res.status(404).json({ message: 'Habit not found' });
  }

  return res.json(habit);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id } = req.params;

  const habit = await Habit.findOneAndDelete({ _id: id, userId: req.user.id }).exec();

  if (!habit) {
    return res.status(404).json({ message: 'Habit not found' });
  }

  return res.status(204).send();
});

router.post('/:id/complete', async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id } = req.params;
  const { date } = req.body as { date?: string };

  const today = date || new Date().toISOString().slice(0, 10);

  const habit = await Habit.findOne({ _id: id, userId: req.user.id }).exec();

  if (!habit) {
    return res.status(404).json({ message: 'Habit not found' });
  }

  if (!habit.completedDates.includes(today)) {
    habit.completedDates.push(today);
  }

  // Simple streak calculation: count consecutive days up to today
  const sortedDates = [...habit.completedDates].sort();
  let currentStreak = 0;
  const todayDate = new Date(today);

  for (let i = sortedDates.length - 1; i >= 0; i -= 1) {
    const d = new Date(sortedDates[i]);
    const diffDays = Math.floor(
      (todayDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === currentStreak) {
      currentStreak += 1;
    } else if (diffDays > currentStreak) {
      break;
    }
  }

  habit.streak = currentStreak;
  habit.longestStreak = Math.max(habit.longestStreak, currentStreak);

  await habit.save();

  return res.json(habit);
});

export default router;

