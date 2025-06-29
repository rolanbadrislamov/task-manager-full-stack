import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { taskReducer, initialState, TaskState } from './task.reducer';
import * as TaskActions from './task.actions';
import { Task, TaskStatus } from '../models/task.model';

describe('Task Reducer', () => {
  let reducer: typeof taskReducer;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    aiNote: undefined,
  };

  const mockTaskResponse = {
    data: [mockTask],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            tasks: [],
            currentTask: null,
            loading: false,
            error: null,
            filters: {},
            stats: null,
            pagination: {
              total: 0,
              page: 1,
              limit: 5,
              totalPages: 0,
            },
            aiNoteLoading: [],
          },
        }),
      ],
    });

    reducer = taskReducer;
  });

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = { type: 'Unknown' };
      const state = reducer(initialState, action);
      expect(state).toBe(initialState);
    });
  });

  describe('loadTasks', () => {
    it('should set loading to true', () => {
      const action = TaskActions.loadTasks({});
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTasksSuccess', () => {
    it('should update state with tasks and set loading to false', () => {
      const action = TaskActions.loadTasksSuccess({ response: mockTaskResponse });
      const state = reducer(initialState, action);
      expect(state.tasks).toEqual(mockTaskResponse.data);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTasksFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to load tasks';
      const action = TaskActions.loadTasksFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('loadTask', () => {
    it('should set loading to true', () => {
      const action = TaskActions.loadTask({ id: '1' });
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTaskSuccess', () => {
    it('should update currentTask and set loading to false', () => {
      const action = TaskActions.loadTaskSuccess({ task: mockTask });
      const state = reducer(initialState, action);
      expect(state.currentTask).toEqual(mockTask);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTaskFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to load task';
      const action = TaskActions.loadTaskFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('createTask', () => {
    it('should set loading to true', () => {
      const action = TaskActions.createTask({ task: { title: 'New Task' } });
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('createTaskSuccess', () => {
    it('should add new task to tasks array and set loading to false', () => {
      const existingTask: Task = {
        id: '2',
        title: 'Existing Task',
        description: 'Existing Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const newTask: Task = {
        id: '1',
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithTasks: TaskState = {
        ...initialState,
        tasks: [existingTask],
      };

      const action = TaskActions.createTaskSuccess({ task: newTask });
      const state = reducer(initialStateWithTasks, action);
      expect(state.tasks).toEqual([newTask, existingTask]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('createTaskFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to create task';
      const action = TaskActions.createTaskFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('updateTask', () => {
    it('should set loading to true', () => {
      const action = TaskActions.updateTask({ id: '1', task: { title: 'Updated Task' } });
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('updateTaskSuccess', () => {
    it('should update task in tasks array and set loading to false', () => {
      const existingTask: Task = {
        id: '1',
        title: 'Existing Task',
        description: 'Existing Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithTasks: TaskState = {
        ...initialState,
        tasks: [existingTask],
      };

      const action = TaskActions.updateTaskSuccess({ task: updatedTask });
      const state = reducer(initialStateWithTasks, action);
      expect(state.tasks).toEqual([updatedTask]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should update currentTask if it matches the updated task', () => {
      const existingTask: Task = {
        id: '1',
        title: 'Existing Task',
        description: 'Existing Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithCurrentTask: TaskState = {
        ...initialState,
        currentTask: existingTask,
        tasks: [existingTask],
      };

      const action = TaskActions.updateTaskSuccess({ task: updatedTask });
      const state = reducer(initialStateWithCurrentTask, action);
      expect(state.currentTask).toEqual(updatedTask);
      expect(state.tasks).toEqual([updatedTask]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should not update currentTask if it does not match the updated task', () => {
      const currentTask: Task = {
        id: '2',
        title: 'Current Task',
        description: 'Current Description',
        status: TaskStatus.DONE,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const existingTask: Task = {
        id: '1',
        title: 'Existing Task',
        description: 'Existing Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithCurrentTask: TaskState = {
        ...initialState,
        currentTask,
        tasks: [existingTask],
      };

      const action = TaskActions.updateTaskSuccess({ task: updatedTask });
      const state = reducer(initialStateWithCurrentTask, action);
      expect(state.currentTask).toEqual(currentTask);
      expect(state.tasks).toEqual([updatedTask]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('updateTaskFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to update task';
      const action = TaskActions.updateTaskFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('deleteTask', () => {
    it('should set loading to true', () => {
      const action = TaskActions.deleteTask({ id: '1' });
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('deleteTaskSuccess', () => {
    it('should remove task from tasks array and set loading to false', () => {
      const task1: Task = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const task2: Task = {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithTasks: TaskState = {
        ...initialState,
        tasks: [task1, task2],
      };

      const action = TaskActions.deleteTaskSuccess({ id: '1' });
      const state = reducer(initialStateWithTasks, action);
      expect(state.tasks).toEqual([task2]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should clear currentTask if it matches the deleted task', () => {
      const task: Task = {
        id: '1',
        title: 'Task to Delete',
        description: 'Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithCurrentTask: TaskState = {
        ...initialState,
        currentTask: task,
        tasks: [task],
      };

      const action = TaskActions.deleteTaskSuccess({ id: '1' });
      const state = reducer(initialStateWithCurrentTask, action);
      expect(state.currentTask).toBe(null);
      expect(state.tasks).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should not clear currentTask if it does not match the deleted task', () => {
      const task1: Task = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const task2: Task = {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithCurrentTask: TaskState = {
        ...initialState,
        currentTask: task2,
        tasks: [task1, task2],
      };

      const action = TaskActions.deleteTaskSuccess({ id: '1' });
      const state = reducer(initialStateWithCurrentTask, action);
      expect(state.currentTask).toEqual(task2);
      expect(state.tasks).toEqual([task2]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('deleteTaskFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to delete task';
      const action = TaskActions.deleteTaskFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const filters = { status: TaskStatus.TODO, search: 'test' };
      const action = TaskActions.loadTasks({ params: filters });

      const result = reducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const stateWithError = { ...initialState, error: 'Test error' };
      const action = TaskActions.loadTasks({ params: {} });

      const result = reducer(stateWithError, action);

      expect(result.error).toBeNull();
    });
  });

  describe('generateAiNote', () => {
    it('should add task id to aiNoteLoading array', () => {
      const action = TaskActions.generateAiNote({ id: '1' });
      const state = reducer(initialState, action);
      expect(state.aiNoteLoading).toEqual(['1']);
      expect(state.error).toBe(null);
    });
  });

  describe('generateAiNoteSuccess', () => {
    it('should update task with AI note and remove from loading array', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        aiNote: undefined,
      };

      const initialStateWithTask: TaskState = {
        ...initialState,
        tasks: [task],
        aiNoteLoading: ['1'],
      };

      const action = TaskActions.generateAiNoteSuccess({ id: '1', aiNote: 'AI generated note' });
      const state = reducer(initialStateWithTask, action);
      expect(state.tasks[0].aiNote).toBe('AI generated note');
      expect(state.aiNoteLoading).toEqual([]);
      expect(state.error).toBe(null);
    });
  });

  describe('generateAiNoteFailure', () => {
    it('should remove task id from loading array and set error', () => {
      const error = 'Failed to generate AI note';
      const action = TaskActions.generateAiNoteFailure({ id: '1', error });
      const state = reducer({ ...initialState, aiNoteLoading: ['1'] }, action);
      expect(state.aiNoteLoading).toEqual([]);
      expect(state.error).toBe(error);
    });
  });

  describe('loadTaskStats', () => {
    it('should set loading to true', () => {
      const action = TaskActions.loadTaskStats();
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTaskStatsSuccess', () => {
    it('should update stats and set loading to false', () => {
      const stats = {
        total: 10,
        todo: 3,
        inProgress: 4,
        done: 3,
      };

      const action = TaskActions.loadTaskStatsSuccess({ stats });
      const state = reducer(initialState, action);
      expect(state.stats).toEqual(stats);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('loadTaskStatsFailure', () => {
    it('should set error and set loading to false', () => {
      const error = 'Failed to load stats';
      const action = TaskActions.loadTaskStatsFailure({ error });
      const state = reducer(initialState, action);
      expect(state.error).toBe(error);
      expect(state.loading).toBe(false);
    });
  });
}); 