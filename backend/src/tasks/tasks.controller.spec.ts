import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto';
import { Task, TaskStatus } from './entities/task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: jest.Mocked<TasksService>;

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
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  beforeEach(async () => {
    const mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      generateAiNote: jest.fn(),
      getTaskStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      service.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(service.create).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const queryTaskDto: QueryTaskDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      service.findAll.mockResolvedValue(mockTaskResponse);

      const result = await controller.findAll(queryTaskDto);

      expect(service.findAll).toHaveBeenCalledWith(queryTaskDto);
      expect(result).toEqual(mockTaskResponse);
    });

    it('should handle empty query parameters', async () => {
      const queryTaskDto: QueryTaskDto = {};

      service.findAll.mockResolvedValue(mockTaskResponse);

      const result = await controller.findAll(queryTaskDto);

      expect(service.findAll).toHaveBeenCalledWith(queryTaskDto);
      expect(result).toEqual(mockTaskResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';

      service.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId);

      expect(service.findOne).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      service.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, updateTaskDto);

      expect(service.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(result).toEqual(updatedTask);
    });

    it('should handle partial updates', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const updatedTask = { ...mockTask, title: 'Updated Task' };
      service.update.mockResolvedValue(updatedTask);

      const result = await controller.update(taskId, updateTaskDto);

      expect(service.update).toHaveBeenCalledWith(taskId, updateTaskDto);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(taskId);

      expect(service.remove).toHaveBeenCalledWith(taskId);
      expect(result).toBeUndefined();
    });
  });

  describe('generateAiNote', () => {
    it('should generate AI note for a task', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const aiNoteResponse = { ...mockTask, aiNote: 'AI generated note' };

      service.generateAiNote.mockResolvedValue(aiNoteResponse);

      const result = await controller.generateAiNote(taskId);

      expect(service.generateAiNote).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(aiNoteResponse);
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const mockStats = {
        total: 10,
        todo: 3,
        inProgress: 4,
        done: 3,
      };

      service.getTaskStats.mockResolvedValue(mockStats);

      const result = await controller.getTaskStats();

      expect(service.getTaskStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
}); 