import { NextRequest, NextResponse } from 'next/server';
import { Task, PriorityLevel, TaskStatus, TaskCategory } from '@/lib/models/task';
import connectToDatabase from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const { title, description, priority, status, category, important, urgent, isCompleted, dueDate } = body;

    const updateData: Partial<{
      title?: string;
      description?: string;
      priority?: PriorityLevel;
      status?: TaskStatus;
      category?: TaskCategory;
      important?: boolean;
      urgent?: boolean;
      isCompleted?: boolean;
      completedAt?: Date;
      dueDate?: Date;
    }> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined && Object.values(PriorityLevel).includes(priority)) updateData.priority = priority;
    if (status !== undefined && Object.values(TaskStatus).includes(status)) updateData.status = status;
    if (category !== undefined && Object.values(TaskCategory).includes(category)) updateData.category = category;
    if (important !== undefined) updateData.important = important;
    if (urgent !== undefined) updateData.urgent = urgent;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
        updateData.status = TaskStatus.COMPLETED;
      } else {
        updateData.completedAt = undefined;
        updateData.status = TaskStatus.TODO;
      }
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : undefined;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
