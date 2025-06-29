import { createReducer, on } from '@ngrx/store';
import { Task, TaskStats, TaskQueryParams } from '../models/task.model';
import * as TaskActions from './task.actions';

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  aiNoteLoading: string[];
  error: string | null;
  stats: TaskStats | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: TaskQueryParams;
}

export const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  aiNoteLoading: [],
  error: null,
  stats: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  }
};

export const taskReducer = createReducer(
  initialState,
  
  on(TaskActions.loadTasks, (state, { params }) => ({
    ...state,
    loading: true,
    error: null,
    filters: { ...state.filters, ...params }
  })),
  
  on(TaskActions.loadTasksSuccess, (state, { response }) => ({
    ...state,
    tasks: response.data,
    loading: false,
    error: null,
    pagination: {
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.limit,
      totalPages: response.meta.totalPages,
    }
  })),
  
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TaskActions.loadTask, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.loadTaskSuccess, (state, { task }) => ({
    ...state,
    currentTask: task,
    loading: false,
    error: null
  })),
  
  on(TaskActions.loadTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TaskActions.createTask, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [task, ...state.tasks],
    loading: false,
    error: null
  })),
  
  on(TaskActions.createTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TaskActions.updateTask, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
    currentTask: state.currentTask?.id === task.id ? task : state.currentTask,
    loading: false,
    error: null
  })),
  
  on(TaskActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TaskActions.deleteTask, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== id),
    currentTask: state.currentTask?.id === id ? null : state.currentTask,
    loading: false,
    error: null
  })),
  
  on(TaskActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Generate AI Note
  on(TaskActions.generateAiNote, (state, { id }) => ({
    ...state,
    aiNoteLoading: [...state.aiNoteLoading, id],
    error: null
  })),
  
  on(TaskActions.generateAiNoteSuccess, (state, { id, aiNote }) => ({
    ...state,
    tasks: state.tasks.map(t => 
      t.id === id ? { ...t, aiNote } : t
    ),
    currentTask: state.currentTask?.id === id 
      ? { ...state.currentTask, aiNote } 
      : state.currentTask,
    aiNoteLoading: state.aiNoteLoading.filter(taskId => taskId !== id),
    error: null
  })),
  
  on(TaskActions.generateAiNoteFailure, (state, { id, error }) => ({
    ...state,
    aiNoteLoading: state.aiNoteLoading.filter(taskId => taskId !== id),
    error
  })),
  
  on(TaskActions.loadTaskStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.loadTaskStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loading: false,
    error: null
  })),
  
  on(TaskActions.loadTaskStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(TaskActions.clearTasks, (state) => ({
    ...state,
    tasks: [],
    pagination: initialState.pagination
  })),
  
  on(TaskActions.clearCurrentTask, (state) => ({
    ...state,
    currentTask: null
  }))
); 