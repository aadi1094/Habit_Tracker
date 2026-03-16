import mongoose, { Schema, Document, Types } from 'mongoose';

export interface HabitDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  completedDates: string[];
  streak: number;
  longestStreak: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<HabitDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    completedDates: {
      type: [String],
      default: [],
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Habit = mongoose.model<HabitDocument>('Habit', habitSchema);

