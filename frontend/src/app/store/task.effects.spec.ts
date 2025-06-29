import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { TaskStatus, TaskQueryParams, Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { TaskEffects } from './task.effects';
import * as TaskActions from './task.actions';
import * as TaskSelectors from './task.selectors';

describe('TaskEffects', () => {
  let effects: TaskEffects;
  let actions$: Actions;
  let taskService: jasmine.SpyObj<TaskService>;

  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
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
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  const mockTaskStats = {
    total: 10,
    todo: 3,
    inProgress: 4,
    done: 3,
  };

  const mockFilters: TaskQueryParams = {
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'ASC' as const,
  };

  beforeEach(() => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'getTask',
      'createTask',
      'updateTask',
      'deleteTask',
      'generateAiNote',
      'getTaskStats',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TaskEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: TaskSelectors.selectFilters,
              value: mockFilters,
            },
          ],
        }),
        { provide: TaskService, useValue: taskServiceSpy },
      ],
    });

    effects = TestBed.inject(TaskEffects);
    actions$ = TestBed.inject(Actions);
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
  });

  describe('loadTasks$', () => {
    it('should load tasks successfully', (done) => {
      const action = TaskActions.loadTasks({ params: mockFilters });
      const successAction = TaskActions.loadTasksSuccess({ response: mockTaskResponse });

      actions$ = of(action);
      taskService.getTasks.and.returnValue(of(mockTaskResponse));

      effects.loadTasks$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.getTasks).toHaveBeenCalledWith(mockFilters);
        done();
      });
    });

    it('should handle load tasks failure', (done) => {
      const action = TaskActions.loadTasks({ params: mockFilters });
      const errorMessage = 'Failed to load tasks';
      const failureAction = TaskActions.loadTasksFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.getTasks.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.loadTasks$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });

    it('should merge filters with action params', (done) => {
      const action = TaskActions.loadTasks({ params: { page: 2, limit: 10 } });
      const successAction = TaskActions.loadTasksSuccess({ response: mockTaskResponse });

      actions$ = of(action);
      taskService.getTasks.and.returnValue(of(mockTaskResponse));

      effects.loadTasks$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.getTasks).toHaveBeenCalledWith({
          ...mockFilters,
          page: 2,
          limit: 10,
        });
        done();
      });
    });
  });

  describe('loadTask$', () => {
    it('should load single task successfully', (done) => {
      const action = TaskActions.loadTask({ id: '123' });
      const successAction = TaskActions.loadTaskSuccess({ task: mockTask });

      actions$ = of(action);
      taskService.getTask.and.returnValue(of(mockTask));

      effects.loadTask$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.getTask).toHaveBeenCalledWith('123');
        done();
      });
    });

    it('should handle load task failure', (done) => {
      const action = TaskActions.loadTask({ id: '123' });
      const errorMessage = 'Failed to load task';
      const failureAction = TaskActions.loadTaskFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.getTask.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.loadTask$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('createTask$', () => {
    it('should create task successfully', (done) => {
      const createTaskRequest = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };
      const action = TaskActions.createTask({ task: createTaskRequest });
      const successAction = TaskActions.createTaskSuccess({ task: mockTask });

      actions$ = of(action);
      taskService.createTask.and.returnValue(of(mockTask));

      effects.createTask$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.createTask).toHaveBeenCalledWith(createTaskRequest);
        done();
      });
    });

    it('should handle create task failure', (done) => {
      const createTaskRequest = { title: 'New Task', status: TaskStatus.TODO };
      const action = TaskActions.createTask({ task: createTaskRequest });
      const errorMessage = 'Failed to create task';
      const failureAction = TaskActions.createTaskFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.createTask.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.createTask$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('updateTask$', () => {
    it('should update task successfully', (done) => {
      const updateTaskRequest = { title: 'Updated Task' };
      const action = TaskActions.updateTask({ id: '123', task: updateTaskRequest });
      const successAction = TaskActions.updateTaskSuccess({ task: mockTask });

      actions$ = of(action);
      taskService.updateTask.and.returnValue(of(mockTask));

      effects.updateTask$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.updateTask).toHaveBeenCalledWith('123', updateTaskRequest);
        done();
      });
    });

    it('should handle update task failure', (done) => {
      const updateTaskRequest = { title: 'Updated Task' };
      const action = TaskActions.updateTask({ id: '123', task: updateTaskRequest });
      const errorMessage = 'Failed to update task';
      const failureAction = TaskActions.updateTaskFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.updateTask.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.updateTask$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('deleteTask$', () => {
    it('should delete task successfully', (done) => {
      const action = TaskActions.deleteTask({ id: '123' });
      const successAction = TaskActions.deleteTaskSuccess({ id: '123' });

      actions$ = of(action);
      taskService.deleteTask.and.returnValue(of(void 0));

      effects.deleteTask$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.deleteTask).toHaveBeenCalledWith('123');
        done();
      });
    });

    it('should handle delete task failure', (done) => {
      const action = TaskActions.deleteTask({ id: '123' });
      const errorMessage = 'Failed to delete task';
      const failureAction = TaskActions.deleteTaskFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.deleteTask.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.deleteTask$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('generateAiNote$', () => {
    it('should generate AI note successfully', (done) => {
      const action = TaskActions.generateAiNote({ id: '123' });
      const aiNoteResponse = { aiNote: 'AI generated note' };
      const successAction = TaskActions.generateAiNoteSuccess({ id: '123', aiNote: 'AI generated note' });

      actions$ = of(action);
      taskService.generateAiNote.and.returnValue(of(aiNoteResponse));

      effects.generateAiNote$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.generateAiNote).toHaveBeenCalledWith('123');
        done();
      });
    });

    it('should handle generate AI note failure', (done) => {
      const action = TaskActions.generateAiNote({ id: '123' });
      const errorMessage = 'AI service unavailable';
      const failureAction = TaskActions.generateAiNoteFailure({ id: '123', error: errorMessage });

      actions$ = of(action);
      taskService.generateAiNote.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.generateAiNote$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('loadTaskStats$', () => {
    it('should load task stats successfully', (done) => {
      const action = TaskActions.loadTaskStats();
      const successAction = TaskActions.loadTaskStatsSuccess({ stats: mockTaskStats });

      actions$ = of(action);
      taskService.getTaskStats.and.returnValue(of(mockTaskStats));

      effects.loadTaskStats$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(taskService.getTaskStats).toHaveBeenCalled();
        done();
      });
    });

    it('should handle load task stats failure', (done) => {
      const action = TaskActions.loadTaskStats();
      const errorMessage = 'Failed to load stats';
      const failureAction = TaskActions.loadTaskStatsFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.getTaskStats.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.loadTaskStats$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('refreshTasksAfterMutation$', () => {
    it('should refresh tasks after create task success', (done) => {
      const action = TaskActions.createTaskSuccess({ task: mockTask });
      const refreshAction = TaskActions.loadTasks({ params: mockFilters });

      actions$ = of(action);

      effects.refreshTasksAfterMutation$.subscribe((result) => {
        expect(result).toEqual(refreshAction);
        done();
      });
    });

    it('should refresh tasks after update task success', (done) => {
      const action = TaskActions.updateTaskSuccess({ task: mockTask });
      const refreshAction = TaskActions.loadTasks({ params: mockFilters });

      actions$ = of(action);

      effects.refreshTasksAfterMutation$.subscribe((result) => {
        expect(result).toEqual(refreshAction);
        done();
      });
    });

    it('should refresh tasks after delete task success', (done) => {
      const action = TaskActions.deleteTaskSuccess({ id: '123' });
      const refreshAction = TaskActions.loadTasks({ params: mockFilters });

      actions$ = of(action);

      effects.refreshTasksAfterMutation$.subscribe((result) => {
        expect(result).toEqual(refreshAction);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should handle service errors with proper error messages', (done) => {
      const action = TaskActions.loadTasks({});
      const errorMessage = 'Network error';
      const failureAction = TaskActions.loadTasksFailure({ error: errorMessage });

      actions$ = of(action);
      taskService.getTasks.and.returnValue(throwError(() => new Error(errorMessage)));

      effects.loadTasks$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });

    it('should handle errors without message property', (done) => {
      const action = TaskActions.loadTasks({});
      const failureAction = TaskActions.loadTasksFailure({ error: 'Http failure response for http://localhost:3000/tasks: 500 Server Error' });

      actions$ = of(action);
      taskService.getTasks.and.returnValue(throwError(() => ({
        status: 500,
        statusText: 'Server Error',
        error: {},
        message: 'Http failure response for http://localhost:3000/tasks: 500 Server Error'
      })));

      effects.loadTasks$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
}); 