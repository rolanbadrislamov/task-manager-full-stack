import { createAction, props } from '@ngrx/store';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskQueryParams, 
  TaskResponse,
  TaskStats 
} from '../models/task.model';

export const loadTasks = createAction(
  '[Task] Load Tasks',
  props<{ params?: TaskQueryParams }>()
);

export const loadTasksSuccess = createAction(
  '[Task] Load Tasks Success',
  props<{ response: TaskResponse }>()
);

export const loadTasksFailure = createAction(
  '[Task] Load Tasks Failure',
  props<{ error: string }>()
);

export const loadTask = createAction(
  '[Task] Load Task',
  props<{ id: string }>()
);

export const loadTaskSuccess = createAction(
  '[Task] Load Task Success',
  props<{ task: Task }>()
);

export const loadTaskFailure = createAction(
  '[Task] Load Task Failure',
  props<{ error: string }>()
);

export const createTask = createAction(
  '[Task] Create Task',
  props<{ task: CreateTaskRequest }>()
);

export const createTaskSuccess = createAction(
  '[Task] Create Task Success',
  props<{ task: Task }>()
);

export const createTaskFailure = createAction(
  '[Task] Create Task Failure',
  props<{ error: string }>()
);

export const updateTask = createAction(
  '[Task] Update Task',
  props<{ id: string; task: UpdateTaskRequest }>()
);

export const updateTaskSuccess = createAction(
  '[Task] Update Task Success',
  props<{ task: Task }>()
);

export const updateTaskFailure = createAction(
  '[Task] Update Task Failure',
  props<{ error: string }>()
);

export const deleteTask = createAction(
  '[Task] Delete Task',
  props<{ id: string }>()
);

export const deleteTaskSuccess = createAction(
  '[Task] Delete Task Success',
  props<{ id: string }>()
);

export const deleteTaskFailure = createAction(
  '[Task] Delete Task Failure',
  props<{ error: string }>()
);

export const generateAiNote = createAction(
  '[Task] Generate AI Note',
  props<{ id: string }>()
);

export const generateAiNoteSuccess = createAction(
  '[Task] Generate AI Note Success',
  props<{ id: string; aiNote: string }>()
);

export const generateAiNoteFailure = createAction(
  '[Task] Generate AI Note Failure',
  props<{ id: string; error: string }>()
);

export const loadTaskStats = createAction('[Task] Load Task Stats');

export const loadTaskStatsSuccess = createAction(
  '[Task] Load Task Stats Success',
  props<{ stats: TaskStats }>()
);

export const loadTaskStatsFailure = createAction(
  '[Task] Load Task Stats Failure',
  props<{ error: string }>()
);

export const clearTasks = createAction('[Task] Clear Tasks');
export const clearCurrentTask = createAction('[Task] Clear Current Task'); 