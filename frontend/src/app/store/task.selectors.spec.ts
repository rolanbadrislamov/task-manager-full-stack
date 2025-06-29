import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import * as TaskSelectors from './task.selectors';
import { TaskState, initialState } from './task.reducer';
import { Task, TaskStatus } from '../models/task.model';

describe('Task Selectors', () => {
  let store: MockStore<TaskState>;

  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    aiNote: undefined,
  };

  const mockTaskWithAiNote: Task = {
    id: '2',
    title: 'Task with AI Note',
    description: 'Description with AI Note',
    status: TaskStatus.IN_PROGRESS,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    aiNote: 'AI generated note',
  };

  const mockState: TaskState = {
    ...initialState,
    tasks: [mockTask, mockTaskWithAiNote],
    currentTask: mockTask,
    loading: false,
    error: null,
    filters: {},
    stats: null,
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    aiNoteLoading: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: mockState,
        }),
      ],
    });

    store = TestBed.inject(MockStore);
  });

  describe('selectTasks', () => {
    it('should select all tasks', () => {
      const result = TaskSelectors.selectTasks.projector(mockState);
      expect(result).toEqual([mockTask, mockTaskWithAiNote]);
    });

    it('should return empty array when no tasks', () => {
      const emptyState = { ...mockState, tasks: [] };
      const result = TaskSelectors.selectTasks.projector(emptyState);
      expect(result).toEqual([]);
    });
  });

  describe('selectCurrentTask', () => {
    it('should select current task', () => {
      const result = TaskSelectors.selectCurrentTask.projector(mockState);
      expect(result).toEqual(mockTask);
    });

    it('should return null when no current task', () => {
      const stateWithoutCurrentTask = { ...mockState, currentTask: null };
      const result = TaskSelectors.selectCurrentTask.projector(stateWithoutCurrentTask);
      expect(result).toBe(null);
    });
  });

  describe('selectLoading', () => {
    it('should select loading state', () => {
      const result = TaskSelectors.selectLoading.projector(mockState);
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const loadingState = { ...mockState, loading: true };
      const result = TaskSelectors.selectLoading.projector(loadingState);
      expect(result).toBe(true);
    });
  });

  describe('selectError', () => {
    it('should select error state', () => {
      const result = TaskSelectors.selectError.projector(mockState);
      expect(result).toBe(null);
    });

    it('should return error message when error exists', () => {
      const errorState = { ...mockState, error: 'Test error' };
      const result = TaskSelectors.selectError.projector(errorState);
      expect(result).toBe('Test error');
    });
  });

  describe('selectFilters', () => {
    it('should select filters', () => {
      const result = TaskSelectors.selectFilters.projector(mockState);
      expect(result).toEqual({});
    });

    it('should return filters when they exist', () => {
      const filters = { status: TaskStatus.TODO, search: 'test' };
      const stateWithFilters = { ...mockState, filters };
      const result = TaskSelectors.selectFilters.projector(stateWithFilters);
      expect(result).toEqual(filters);
    });
  });

  describe('selectStats', () => {
    it('should select stats', () => {
      const result = TaskSelectors.selectStats.projector(mockState);
      expect(result).toBe(null);
    });

    it('should return stats when they exist', () => {
      const stats = { total: 10, todo: 3, inProgress: 4, done: 3 };
      const stateWithStats = { ...mockState, stats };
      const result = TaskSelectors.selectStats.projector(stateWithStats);
      expect(result).toEqual(stats);
    });
  });

  describe('selectPagination', () => {
    it('should select pagination', () => {
      const result = TaskSelectors.selectPagination.projector(mockState);
      expect(result).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return pagination when it exists', () => {
      const pagination = { total: 10, page: 1, limit: 5, totalPages: 2 };
      const stateWithPagination = { ...mockState, pagination };
      const result = TaskSelectors.selectPagination.projector(stateWithPagination);
      expect(result).toEqual(pagination);
    });
  });

  describe('selectAiNoteLoading', () => {
    it('should return true when specific task is loading AI note', () => {
      const stateWithLoading = { ...mockState, aiNoteLoading: ['1'] };
      const result = TaskSelectors.selectAiNoteLoading('1').projector(stateWithLoading);
      expect(result).toBe(true);
    });

    it('should return false when specific task is not loading AI note', () => {
      const stateWithLoading = { ...mockState, aiNoteLoading: ['1'] };
      const result = TaskSelectors.selectAiNoteLoading('2').projector(stateWithLoading);
      expect(result).toBe(false);
    });

    it('should return true when any task is loading AI note (no taskId provided)', () => {
      const stateWithLoading = { ...mockState, aiNoteLoading: ['1'] };
      const result = TaskSelectors.selectAiNoteLoading().projector(stateWithLoading);
      expect(result).toBe(true);
    });

    it('should return false when no tasks are loading AI notes', () => {
      const result = TaskSelectors.selectAiNoteLoading().projector(mockState);
      expect(result).toBe(false);
    });
  });

  describe('selectTasksByStatus', () => {
    it('should select tasks grouped by status', () => {
      const tasksWithDifferentStatuses = [
        { ...mockTask, id: '1', status: TaskStatus.TODO },
        { ...mockTask, id: '2', status: TaskStatus.TODO },
        { ...mockTask, id: '3', status: TaskStatus.IN_PROGRESS },
        { ...mockTask, id: '4', status: TaskStatus.DONE },
      ];
      const result = TaskSelectors.selectTasksByStatus.projector(tasksWithDifferentStatuses);
      
      expect(result.TODO.length).toBe(2);
      expect(result.IN_PROGRESS.length).toBe(1);
      expect(result.DONE.length).toBe(1);
    });

    it('should return empty arrays when no tasks', () => {
      const result = TaskSelectors.selectTasksByStatus.projector([]);
      
      expect(result.TODO).toEqual([]);
      expect(result.IN_PROGRESS).toEqual([]);
      expect(result.DONE).toEqual([]);
    });
  });

  describe('selectTaskById', () => {
    it('should select task by id', () => {
      const result = TaskSelectors.selectTaskById('123e4567-e89b-12d3-a456-426614174000').projector(mockState.tasks);
      
      expect(result).toEqual(mockTask);
    });

    it('should return undefined when task not found', () => {
      const result = TaskSelectors.selectTaskById('non-existent-id').projector(mockState.tasks);
      
      expect(result).toBeUndefined();
    });
  });

  describe('selectHasTasks', () => {
    it('should return true when tasks exist', () => {
      const result = TaskSelectors.selectHasTasks.projector(mockState.tasks);
      
      expect(result).toBe(true);
    });

    it('should return false when no tasks', () => {
      const result = TaskSelectors.selectHasTasks.projector([]);
      
      expect(result).toBe(false);
    });
  });

  describe('selectTasksCount', () => {
    it('should return correct task count', () => {
      const result = TaskSelectors.selectTasksCount.projector(mockState.tasks);
      
      expect(result).toBe(2);
    });
  });

  describe('selectTasksWithAiNotes', () => {
    it('should return tasks with AI notes', () => {
      const result = TaskSelectors.selectTasksWithAiNotes.projector(mockState.tasks);
      
      expect(result.length).toBe(1);
    });
  });

  describe('selectTasksWithoutAiNotes', () => {
    it('should return tasks without AI notes', () => {
      const result = TaskSelectors.selectTasksWithoutAiNotes.projector(mockState.tasks);
      
      expect(result.length).toBe(1);
    });
  });
}); 