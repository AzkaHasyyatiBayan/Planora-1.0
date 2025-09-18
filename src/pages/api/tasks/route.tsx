import { NextApiRequest, NextApiResponse } from 'next';
import { Task, PriorityLevel, TaskStatus, TaskCategory } from '@/lib/models/task';
import connectToDatabase from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, priority, status, category, important, urgent } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const newTask = new Task({
        userId: null, // TODO: Replace with actual user ID from auth
        title,
        description,
        priority: priority && Object.values(PriorityLevel).includes(priority) ? priority : PriorityLevel.LOW,
        status: status && Object.values(TaskStatus).includes(status) ? status : TaskStatus.TODO,
        category: category && Object.values(TaskCategory).includes(category) ? category : TaskCategory.OTHER,
        isCompleted: false,
        important: important || false,
        urgent: urgent || false,
      });

      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
