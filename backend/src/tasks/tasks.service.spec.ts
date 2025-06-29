import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { NotFoundException } from '@nestjs/common';
import { 
  AiServiceException, 
  AiServiceTimeoutException, 
} from './exceptions/ai-service.exception';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    aiNote: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      const createdTask = { ...mockTask, ...createTaskDto };
      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(createdTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result).toEqual(createdTask);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with default parameters', async () => {
      const queryDto: QueryTaskDto = {};
      const mockTasks = [mockTask];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTasks, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(queryDto);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.data).toEqual(mockTasks);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should apply status filter', async () => {
      const queryDto: QueryTaskDto = { status: TaskStatus.IN_PROGRESS };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', { status: TaskStatus.IN_PROGRESS });
    });

    it('should apply search filter', async () => {
      const queryDto: QueryTaskDto = { search: 'test' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: '%test%' }
      );
    });

    it('should apply custom pagination and sorting', async () => {
      const queryDto: QueryTaskDto = {
        page: 2,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'ASC',
      };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.title', 'ASC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTask.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTask.id } });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(mockTask.id, updateTaskDto);

      expect(mockRepository.save).toHaveBeenCalledWith(updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { title: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await service.remove(mockTask.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTask.id } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException when removing non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateAiNote', () => {
    it('should generate AI note for a task', async () => {
      const taskWithAiNote = { ...mockTask, aiNote: 'AI generated note' };
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(taskWithAiNote);

      const generateAiNoteSpy = jest.spyOn(service as any, 'generateSimulatedAiNoteWithRetry')
        .mockResolvedValue('AI generated note');

      const result = await service.generateAiNote(mockTask.id);

      expect(generateAiNoteSpy).toHaveBeenCalledWith(mockTask, 3);
      expect(mockRepository.save).toHaveBeenCalledWith({ ...mockTask, aiNote: 'AI generated note' });
      expect(result).toEqual(taskWithAiNote);

      generateAiNoteSpy.mockRestore();
    });

    it('should throw NotFoundException when generating AI note for non-existent task', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.generateAiNote('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateSimulatedAiNoteWithRetry', () => {
    it('should retry on timeout and eventually succeed', async () => {
      const mockTaskWithDates = { 
        id: '123', 
        title: 'Test Task', 
        status: TaskStatus.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        aiNote: undefined
      };
      
      const generateAiNoteSpy = jest.spyOn(service as any, 'generateSimulatedAiNote')
        .mockResolvedValue('AI note');

      const result = await service['generateSimulatedAiNoteWithRetry'](mockTaskWithDates, 3);

      expect(generateAiNoteSpy).toHaveBeenCalledWith(mockTaskWithDates);
      expect(result).toBe('AI note');

      generateAiNoteSpy.mockRestore();
    });

    it('should throw AiServiceException after max retries', async () => {
      const mockTaskWithDates = { 
        id: '123', 
        title: 'Test Task', 
        status: TaskStatus.TODO,
        createdAt: new Date(),
        updatedAt: new Date(),
        aiNote: undefined
      };
      
      const generateAiNoteSpy = jest.spyOn(service as any, 'generateSimulatedAiNote')
        .mockRejectedValue(new AiServiceTimeoutException('Timeout'));

      await expect(service['generateSimulatedAiNoteWithRetry'](mockTaskWithDates, 1))
        .rejects.toThrow(AiServiceException);

      generateAiNoteSpy.mockRestore();
    });
  });

  describe('generateSimulatedAiNote', () => {
    it('should generate appropriate AI note based on task status', () => {
      const todoTask = { ...mockTask, status: TaskStatus.TODO };
      const inProgressTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      const doneTask = { ...mockTask, status: TaskStatus.DONE };

      const todoNote = service['generateSimulatedAiNote'](todoTask);
      const inProgressNote = service['generateSimulatedAiNote'](inProgressTask);
      const doneNote = service['generateSimulatedAiNote'](doneTask);

      expect(todoNote).toMatch(/^AI/);
      expect(inProgressNote).toMatch(/^AI/);
      expect(doneNote).toMatch(/^AI/);
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3);

      const result = await service.getTaskStats();

      expect(result).toEqual({
        total: 10,
        todo: 3,
        inProgress: 4,
        done: 3,
      });
    });
  });

  describe('findByStatus', () => {
    it('should return tasks by status', async () => {
      const mockTasks = [mockTask];
      mockRepository.find.mockResolvedValue(mockTasks);

      const result = await service.findByStatus(TaskStatus.TODO);

      expect(mockRepository.find).toHaveBeenCalledWith({ 
        where: { status: TaskStatus.TODO },
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('formatTaskDates', () => {
    it('should format task dates correctly', () => {
      const taskWithStringDates = {
        ...mockTask,
        createdAt: '2024-01-01T10:00:00Z' as any,
        updatedAt: '2024-01-01T11:00:00Z' as any,
      };

      const result = service['formatTaskDates'](taskWithStringDates);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle tasks without dates', () => {
      const taskWithoutDates = { ...mockTask, createdAt: null as any, updatedAt: null as any };

      const result = service['formatTaskDates'](taskWithoutDates);

      expect(result.createdAt).toBeNull();
      expect(result.updatedAt).toBeNull();
    });
  });

  describe('formatTaskDatesArray', () => {
    it('should format dates for array of tasks', () => {
      const tasksWithStringDates = [
        { ...mockTask, createdAt: '2024-01-01T10:00:00Z' as any, updatedAt: '2024-01-01T11:00:00Z' as any },
        { ...mockTask, id: '456', createdAt: '2024-01-02T10:00:00Z' as any, updatedAt: '2024-01-02T11:00:00Z' as any },
      ];

      const result = service['formatTaskDatesArray'](tasksWithStringDates);

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
      expect(result[1].createdAt).toBeInstanceOf(Date);
      expect(result[1].updatedAt).toBeInstanceOf(Date);
    });
  });
}); 