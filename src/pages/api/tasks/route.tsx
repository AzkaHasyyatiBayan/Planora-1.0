import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });

      res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, priority, status, category, important, urgent, due_date } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            priority: priority || 'LOW',
            status: status || 'TODO',
            category: category || 'OTHER',
            is_completed: false,
            important: important || false,
            urgent: urgent || false,
            due_date: due_date || null,
          },
        ])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      res.status(201).json(data);
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}