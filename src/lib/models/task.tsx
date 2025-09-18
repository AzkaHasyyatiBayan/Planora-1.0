import mongoose, { Schema, Document, Model } from 'mongoose'

/**
 * ENUMS
 */
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  STUDY = 'study',
  HEALTH = 'health',
  SHOPPING = 'shopping',
  OTHER = 'other'
}

/**
 * INTERFACES
 */
export interface ISubTask {
  _id?: mongoose.Types.ObjectId
  title: string
  isCompleted: boolean
  completedAt?: Date
  createdAt: Date
}

export interface IAttachment {
  _id?: mongoose.Types.ObjectId
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: Date
}

export interface IReminder {
  _id?: mongoose.Types.ObjectId
  type: 'email' | 'push' | 'sms'
  reminderTime: Date
  message?: string
  isActive: boolean
  isSent: boolean
  sentAt?: Date
  createdAt: Date
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  dueDate?: Date
  priority: PriorityLevel
  status: TaskStatus
  category: TaskCategory
  isCompleted: boolean
  completedAt?: Date
  estimatedDuration?: number
  actualDuration?: number
  tags?: string[]
  subtasks?: ISubTask[]
  attachments?: IAttachment[]
  reminders?: IReminder[]
  important: boolean
  urgent: boolean
  createdAt: Date
  updatedAt: Date

  markAsCompleted(): Promise<ITask>
  markAsIncomplete(): Promise<ITask>
  isOverdue(): boolean
  getDaysUntilDue(): number | null
  addSubtask(subtask: Partial<ISubTask>): Promise<ITask>
  removeSubtask(subtaskId: string): Promise<ITask>
  getCompletionPercentage(): number
  addReminder(reminder: Partial<IReminder>): Promise<ITask>
}

export interface ITaskStatistics {
  total: number
  completed: number
  pending: number
  overdue: number
  byPriority: Record<PriorityLevel, number>
  byCategory: Record<TaskCategory, number>
  byStatus: Record<TaskStatus, number>
  completionRate: number
  averageDuration: number | null
}

export interface ITaskModel extends Model<ITask> {
  findByUserId(userId: string): Promise<ITask[]>
  findOverdueTasks(userId?: string): Promise<ITask[]>
  findByPriority(priority: PriorityLevel, userId?: string): Promise<ITask[]>
  findByStatus(status: TaskStatus, userId?: string): Promise<ITask[]>
  findByCategory(category: TaskCategory, userId?: string): Promise<ITask[]>
  getTaskStatistics(userId: string): Promise<ITaskStatistics>
  findTasksDueToday(userId?: string): Promise<ITask[]>
  findTasksDueThisWeek(userId?: string): Promise<ITask[]>
  searchTasks(query: string, userId?: string): Promise<ITask[]>
}

/**
 * SCHEMAS
 */
const SubTaskSchema = new Schema<ISubTask>({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
})

const ReminderSchema = new Schema<IReminder>({
  type: { type: String, enum: ['email', 'push', 'sms'], required: true },
  reminderTime: { type: Date, required: true },
  message: { type: String },
  isActive: { type: Boolean, default: true },
  isSent: { type: Boolean, default: false },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
})

const TaskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  priority: { type: String, enum: Object.values(PriorityLevel), default: PriorityLevel.LOW },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
  category: { type: String, enum: Object.values(TaskCategory), default: TaskCategory.OTHER },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  estimatedDuration: Number,
  actualDuration: Number,
  tags: [String],
  subtasks: [SubTaskSchema],
  attachments: [AttachmentSchema],
  reminders: [ReminderSchema],
  important: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

/**
 * VIRTUALS
 */
TaskSchema.virtual('eisenhowerQuadrant').get(function (this: ITask) {
  if (this.important && this.urgent) return 'do'
  if (this.important && !this.urgent) return 'decide'
  if (!this.important && this.urgent) return 'delegate'
  return 'delete'
})

/**
 * INSTANCE METHODS
 */
TaskSchema.methods.markAsCompleted = function () {
  this.isCompleted = true
  this.completedAt = new Date()
  this.status = TaskStatus.COMPLETED
  return this.save()
}

TaskSchema.methods.markAsIncomplete = function () {
  this.isCompleted = false
  this.completedAt = undefined
  this.status = TaskStatus.TODO
  return this.save()
}

TaskSchema.methods.isOverdue = function () {
  return !!this.dueDate && !this.isCompleted && new Date() > this.dueDate
}

TaskSchema.methods.getDaysUntilDue = function () {
  if (!this.dueDate) return null
  return Math.ceil((this.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

TaskSchema.methods.getCompletionPercentage = function () {
  const total = this.subtasks?.length || 0
  const done = this.subtasks?.filter((sub: ISubTask) => sub.isCompleted).length || 0
  return total ? Math.round((done / total) * 100) : this.isCompleted ? 100 : 0
}

TaskSchema.methods.addSubtask = function (subtask: Partial<ISubTask>) {
  this.subtasks?.push({
    title: subtask.title!,
    isCompleted: subtask.isCompleted ?? false,
    createdAt: new Date()
  })
  return this.save()
}

TaskSchema.methods.removeSubtask = function (subtaskId: string) {
  this.subtasks = this.subtasks?.filter((sub: ISubTask) => sub._id?.toString() !== subtaskId)
  return this.save()
}

TaskSchema.methods.addReminder = function (reminder: Partial<IReminder>) {
  this.reminders?.push({
    type: reminder.type!,
    reminderTime: reminder.reminderTime!,
    isActive: reminder.isActive ?? true,
    isSent: false,
    createdAt: new Date()
  })
  return this.save()
}

/**
 * STATIC METHODS
 */
TaskSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

TaskSchema.statics.findOverdueTasks = function (userId?: string) {
  const query = { isCompleted: false, dueDate: { $lt: new Date() } }
  if (userId) Object.assign(query, { userId })
  return this.find(query)
}

TaskSchema.statics.getTaskStatistics = async function (userId: string) {
  const tasks: ITask[] = await this.find({ userId })
  const stats: ITaskStatistics = {
    total: tasks.length,
    completed: tasks.filter(t => t.isCompleted).length,
    pending: tasks.filter(t => !t.isCompleted).length,
    overdue: tasks.filter(t => t.isOverdue()).length,
    byPriority: {
      [PriorityLevel.LOW]: 0,
      [PriorityLevel.MEDIUM]: 0,
      [PriorityLevel.HIGH]: 0,
      [PriorityLevel.URGENT]: 0
    },
    byCategory: {
      [TaskCategory.WORK]: 0,
      [TaskCategory.PERSONAL]: 0,
      [TaskCategory.STUDY]: 0,
      [TaskCategory.HEALTH]: 0,
      [TaskCategory.SHOPPING]: 0,
      [TaskCategory.OTHER]: 0
    },
    byStatus: {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
      [TaskStatus.CANCELLED]: 0
    },
    completionRate: 0,
    averageDuration: null
  }

  for (const task of tasks) {
    stats.byPriority[task.priority]++
    stats.byCategory[task.category]++
    stats.byStatus[task.status]++
  }

  stats.completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const withDur = tasks.filter(t => t.actualDuration)
  if (withDur.length)
    stats.averageDuration = Math.round(withDur.reduce((sum, t) => sum + (t.actualDuration ?? 0), 0) / withDur.length)

  return stats
}

/**
 * SAFE MODEL CREATION - Fixed the issue here
 */
let Task: ITaskModel

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // In browser, create a mock model or handle gracefully
  Task = {} as ITaskModel
} else {
  // In server environment, create the actual model
  try {
    Task = (mongoose.models?.Task || mongoose.model<ITask, ITaskModel>('Task', TaskSchema)) as ITaskModel
  } catch (error) {
    console.error('Error creating Task model:', error)
    Task = {} as ITaskModel
  }
}

export { Task }

export const getAllTasks = async (): Promise<ITask[]> => {
  try {
    if (typeof window !== 'undefined') {
      // In browser, return empty array or handle API call
      return []
    }
    return await Task.find().sort({ createdAt: -1 })
  } catch (error) {
    console.error('Error getting all tasks:', error)
    return []
  }
}