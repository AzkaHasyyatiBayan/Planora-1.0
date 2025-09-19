import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface RouteParams {
  params: { id: string };
}

// GET task by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching task:', err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// UPDATE task by ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('tasks')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error updating task:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE task by ID
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}