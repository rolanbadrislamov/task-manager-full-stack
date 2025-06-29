import * as TaskActions from './task.actions';
import { Task, TaskStatus } from '../models/task.model';

interface TaskResponse {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

describe('Task Actions', () => {
  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    aiNote: undefined,
  };

  const mockTaskResponse: TaskResponse = {
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

  const mockTaskStats = {
    total: 10,
    todo: 3,
    inProgress: 4,
    done: 3,
  };

  describe('Load Tasks Actions', () => {
    it('should create loadTasks action with params', () => {
      const params = { status: TaskStatus.TODO, page: 1 };
      const action = TaskActions.loadTasks({ params });

      expect(action.type).toBe('[Task] Load Tasks');
      expect(action.params).toEqual(params);
    });

    it('should create loadTasks action without params', () => {
      const action = TaskActions.loadTasks({});

      expect(action.type).toBe('[Task] Load Tasks');
      expect(action.params).toBeUndefined();
    });

    it('should create loadTasksSuccess action', () => {
      const action = TaskActions.loadTasksSuccess({ response: mockTaskResponse });

      expect(action.type).toBe('[Task] Load Tasks Success');
      expect(action.response).toEqual(mockTaskResponse);
    });

    it('should create loadTasksFailure action', () => {
      const error = 'Failed to load tasks';
      const action = TaskActions.loadTasksFailure({ error });

      expect(action.type).toBe('[Task] Load Tasks Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Load Task Actions', () => {
    it('should create loadTask action', () => {
      const id = '123';
      const action = TaskActions.loadTask({ id });

      expect(action.type).toBe('[Task] Load Task');
      expect(action.id).toBe(id);
    });

    it('should create loadTaskSuccess action', () => {
      const action = TaskActions.loadTaskSuccess({ task: mockTask });

      expect(action.type).toBe('[Task] Load Task Success');
      expect(action.task).toEqual(mockTask);
    });

    it('should create loadTaskFailure action', () => {
      const error = 'Failed to load task';
      const action = TaskActions.loadTaskFailure({ error });

      expect(action.type).toBe('[Task] Load Task Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Create Task Actions', () => {
    it('should create createTask action', () => {
      const createTaskRequest = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: 'high',
        dueDate: new Date('2024-01-01'),
      };
      const action = TaskActions.createTask({ task: createTaskRequest });

      expect(action.type).toBe('[Task] Create Task');
      expect(action.task).toEqual(createTaskRequest);
    });

    it('should create createTaskSuccess action', () => {
      const action = TaskActions.createTaskSuccess({ task: mockTask });

      expect(action.type).toBe('[Task] Create Task Success');
      expect(action.task).toEqual(mockTask);
    });

    it('should create createTaskFailure action', () => {
      const error = 'Failed to create task';
      const action = TaskActions.createTaskFailure({ error });

      expect(action.type).toBe('[Task] Create Task Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Update Task Actions', () => {
    it('should create updateTask action', () => {
      const id = '123';
      const updateTaskRequest = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const action = TaskActions.updateTask({ id, task: updateTaskRequest });

      expect(action.type).toBe('[Task] Update Task');
      expect(action.id).toBe(id);
      expect(action.task).toEqual(updateTaskRequest);
    });

    it('should create updateTaskSuccess action', () => {
      const action = TaskActions.updateTaskSuccess({ task: mockTask });

      expect(action.type).toBe('[Task] Update Task Success');
      expect(action.task).toEqual(mockTask);
    });

    it('should create updateTaskFailure action', () => {
      const error = 'Failed to update task';
      const action = TaskActions.updateTaskFailure({ error });

      expect(action.type).toBe('[Task] Update Task Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Delete Task Actions', () => {
    it('should create deleteTask action', () => {
      const id = '123';
      const action = TaskActions.deleteTask({ id });

      expect(action.type).toBe('[Task] Delete Task');
      expect(action.id).toBe(id);
    });

    it('should create deleteTaskSuccess action', () => {
      const id = '123';
      const action = TaskActions.deleteTaskSuccess({ id });

      expect(action.type).toBe('[Task] Delete Task Success');
      expect(action.id).toBe(id);
    });

    it('should create deleteTaskFailure action', () => {
      const error = 'Failed to delete task';
      const action = TaskActions.deleteTaskFailure({ error });

      expect(action.type).toBe('[Task] Delete Task Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Generate AI Note Actions', () => {
    it('should create generateAiNote action', () => {
      const id = '123';
      const action = TaskActions.generateAiNote({ id });

      expect(action.type).toBe('[Task] Generate AI Note');
      expect(action.id).toBe(id);
    });

    it('should create generateAiNoteSuccess action', () => {
      const id = '123';
      const aiNote = 'AI generated note';
      const action = TaskActions.generateAiNoteSuccess({ id, aiNote });

      expect(action.type).toBe('[Task] Generate AI Note Success');
      expect(action.id).toBe(id);
      expect(action.aiNote).toBe(aiNote);
    });

    it('should create generateAiNoteFailure action', () => {
      const id = '123';
      const error = 'Failed to generate AI note';
      const action = TaskActions.generateAiNoteFailure({ id, error });

      expect(action.type).toBe('[Task] Generate AI Note Failure');
      expect(action.id).toBe(id);
      expect(action.error).toBe(error);
    });
  });

  describe('Load Task Stats Actions', () => {
    it('should create loadTaskStats action', () => {
      const action = TaskActions.loadTaskStats();

      expect(action.type).toBe('[Task] Load Task Stats');
    });

    it('should create loadTaskStatsSuccess action', () => {
      const action = TaskActions.loadTaskStatsSuccess({ stats: mockTaskStats });

      expect(action.type).toBe('[Task] Load Task Stats Success');
      expect(action.stats).toEqual(mockTaskStats);
    });

    it('should create loadTaskStatsFailure action', () => {
      const error = 'Failed to load task stats';
      const action = TaskActions.loadTaskStatsFailure({ error });

      expect(action.type).toBe('[Task] Load Task Stats Failure');
      expect(action.error).toBe(error);
    });
  });

  describe('Clear Actions', () => {
    it('should create clearTasks action', () => {
      const action = TaskActions.clearTasks();

      expect(action.type).toBe('[Task] Clear Tasks');
    });

    it('should create clearCurrentTask action', () => {
      const action = TaskActions.clearCurrentTask();

      expect(action.type).toBe('[Task] Clear Current Task');
    });
  });

  describe('Action Properties', () => {
    it('should have correct action types', () => {
      expect(TaskActions.loadTasks.type).toBe('[Task] Load Tasks');
      expect(TaskActions.loadTasksSuccess.type).toBe('[Task] Load Tasks Success');
      expect(TaskActions.loadTasksFailure.type).toBe('[Task] Load Tasks Failure');
      expect(TaskActions.loadTask.type).toBe('[Task] Load Task');
      expect(TaskActions.loadTaskSuccess.type).toBe('[Task] Load Task Success');
      expect(TaskActions.loadTaskFailure.type).toBe('[Task] Load Task Failure');
      expect(TaskActions.createTask.type).toBe('[Task] Create Task');
      expect(TaskActions.createTaskSuccess.type).toBe('[Task] Create Task Success');
      expect(TaskActions.createTaskFailure.type).toBe('[Task] Create Task Failure');
      expect(TaskActions.updateTask.type).toBe('[Task] Update Task');
      expect(TaskActions.updateTaskSuccess.type).toBe('[Task] Update Task Success');
      expect(TaskActions.updateTaskFailure.type).toBe('[Task] Update Task Failure');
      expect(TaskActions.deleteTask.type).toBe('[Task] Delete Task');
      expect(TaskActions.deleteTaskSuccess.type).toBe('[Task] Delete Task Success');
      expect(TaskActions.deleteTaskFailure.type).toBe('[Task] Delete Task Failure');
      expect(TaskActions.generateAiNote.type).toBe('[Task] Generate AI Note');
      expect(TaskActions.generateAiNoteSuccess.type).toBe('[Task] Generate AI Note Success');
      expect(TaskActions.generateAiNoteFailure.type).toBe('[Task] Generate AI Note Failure');
      expect(TaskActions.loadTaskStats.type).toBe('[Task] Load Task Stats');
      expect(TaskActions.loadTaskStatsSuccess.type).toBe('[Task] Load Task Stats Success');
      expect(TaskActions.loadTaskStatsFailure.type).toBe('[Task] Load Task Stats Failure');
      expect(TaskActions.clearTasks.type).toBe('[Task] Clear Tasks');
      expect(TaskActions.clearCurrentTask.type).toBe('[Task] Clear Current Task');
    });
  });
}); 