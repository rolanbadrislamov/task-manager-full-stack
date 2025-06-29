import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, TaskStatus, CreateTaskRequest, UpdateTaskRequest, TaskQueryParams, TaskResponse, TaskStats } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

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
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };

  const mockTaskStats: TaskStats = {
    total: 10,
    todo: 3,
    inProgress: 4,
    done: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTasks', () => {
    it('should return tasks with default parameters', () => {
      service.getTasks().subscribe(response => {
        expect(response).toEqual(mockTaskResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.toString()).toBe('');
      req.flush(mockTaskResponse);
    });

    it('should return tasks with custom parameters', () => {
      const params = {
        status: TaskStatus.IN_PROGRESS,
        search: 'test',
        page: 2,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'ASC' as const
      };

      service.getTasks(params).subscribe(response => {
        expect(response).toEqual(mockTaskResponse);
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/tasks?status=IN_PROGRESS&search=test&page=2&limit=10&sortBy=title&sortOrder=ASC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTaskResponse);
    });

    it('should handle HTTP errors', () => {
      const errorResponse = { message: 'Server error' };
      
      service.getTasks().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.flush(errorResponse, { status: 500, statusText: 'Server Error' });
    });

    it('should retry on failure', () => {
      service.getTasks().subscribe(response => {
        expect(response).toEqual(mockTaskResponse);
      });

      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.flush('Error', { status: 500, statusText: 'Server Error' });

      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.flush('Error', { status: 500, statusText: 'Server Error' });

      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.flush('Error', { status: 500, statusText: 'Server Error' });

      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.flush(mockTaskResponse);
    });

    it('should handle server-side errors without custom message', () => {
      service.getTasks().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Expect 3 retries + 1 original request = 4 total requests
      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.flush({}, { status: 500, statusText: 'Server Error' });
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.flush({}, { status: 500, statusText: 'Server Error' });
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.flush({}, { status: 500, statusText: 'Server Error' });
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.flush({}, { status: 500, statusText: 'Server Error' });
    });

    it('should handle specific HTTP status codes', () => {
      service.getTasks().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Expect 3 retries + 1 original request = 4 total requests
      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.flush({ message: 'Error Code: 500' }, { status: 500, statusText: 'Server Error' });
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.flush({ message: 'Error Code: 500' }, { status: 500, statusText: 'Server Error' });
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.flush({ message: 'Error Code: 500' }, { status: 500, statusText: 'Server Error' });
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.flush({ message: 'Error Code: 500' }, { status: 500, statusText: 'Server Error' });
    });

    it('should handle server-side errors with custom message', () => {
      service.getTasks().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Expect 3 retries + 1 original request = 4 total requests
      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle client-side errors', () => {
      service.getTasks().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Expect 3 retries + 1 original request = 4 total requests
      const req1 = httpMock.expectOne('http://localhost:3000/tasks');
      req1.error(new ErrorEvent('Network error'));
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks');
      req2.error(new ErrorEvent('Network error'));
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks');
      req3.error(new ErrorEvent('Network error'));
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks');
      req4.error(new ErrorEvent('Network error'));
    });
  });

  describe('getTask', () => {
    it('should return a single task', () => {
      const taskId = mockTask.id;

      service.getTask(taskId).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });

    it('should handle HTTP errors for getTask', () => {
      const taskId = 'non-existent-id';
      const errorResponse = { message: 'Task not found' };
      
      service.getTask(taskId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      // Expect 3 retries + 1 original request = 4 total requests
      const req1 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req1.flush(errorResponse, { status: 404, statusText: 'Not Found' });
      
      const req2 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req2.flush(errorResponse, { status: 404, statusText: 'Not Found' });
      
      const req3 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req3.flush(errorResponse, { status: 404, statusText: 'Not Found' });
      
      const req4 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req4.flush(errorResponse, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const createTaskRequest: CreateTaskRequest = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      const createdTask = { ...mockTask, ...createTaskRequest };

      service.createTask(createTaskRequest).subscribe(task => {
        expect(task).toEqual(createdTask);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createTaskRequest);
      req.flush(createdTask);
    });

    it('should handle HTTP errors for createTask', () => {
      const createTaskRequest: CreateTaskRequest = {
        title: 'New Task',
        status: TaskStatus.TODO,
      };

      const errorMessage = 'Validation error';

      service.createTask(createTaskRequest).subscribe({
        next: () => fail('should have failed with validation error'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      const taskId = mockTask.id;
      const updateTaskRequest: UpdateTaskRequest = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = { ...mockTask, ...updateTaskRequest };

      service.updateTask(taskId, updateTaskRequest).subscribe(task => {
        expect(task).toEqual(updatedTask);
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateTaskRequest);
      req.flush(updatedTask);
    });

    it('should handle HTTP errors for updateTask', () => {
      const taskId = 'non-existent-id';
      const updateTaskRequest: UpdateTaskRequest = {
        title: 'Updated Task',
      };

      const errorMessage = 'Task not found';

      service.updateTask(taskId, updateTaskRequest).subscribe({
        next: () => fail('should have failed with not found error'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const taskId = mockTask.id;

      service.deleteTask(taskId).subscribe(() => {
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP errors for deleteTask', () => {
      const taskId = 'non-existent-id';
      const errorMessage = 'Task not found';

      service.deleteTask(taskId).subscribe({
        next: () => fail('should have failed with not found error'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      req.flush({ message: errorMessage }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('generateAiNote', () => {
    it('should generate AI note for a task', () => {
      const taskId = mockTask.id;
      const aiNoteResponse = { aiNote: 'AI generated note' };

      service.generateAiNote(taskId).subscribe(response => {
        expect(response).toEqual(aiNoteResponse);
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(aiNoteResponse);
    });

    it('should handle AI service timeout', () => {
      const taskId = mockTask.id;
      const errorResponse = { message: 'AI service timeout' };
      
      service.generateAiNote(taskId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req1 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req1.flush(errorResponse, { status: 408, statusText: 'Request Timeout' });
      
      const req2 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req2.flush(errorResponse, { status: 408, statusText: 'Request Timeout' });
      
      const req3 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req3.flush(errorResponse, { status: 408, statusText: 'Request Timeout' });
    });

    it('should handle AI service unavailable', () => {
      const taskId = mockTask.id;
      const errorResponse = { message: 'AI service unavailable' };
      
      service.generateAiNote(taskId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req1 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req1.flush(errorResponse, { status: 503, statusText: 'Service Unavailable' });
      
      const req2 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req2.flush(errorResponse, { status: 503, statusText: 'Service Unavailable' });
      
      const req3 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req3.flush(errorResponse, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should retry on failure', () => {
      const taskId = mockTask.id;
      const errorResponse = { message: 'AI service timeout' };
      
      service.generateAiNote(taskId).subscribe({
        next: (result) => {
          expect(result).toBeTruthy();
          expect(result.aiNote).toBeDefined();
        },
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req1 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req1.flush(errorResponse, { status: 408, statusText: 'Request Timeout' });

      const req2 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req2.flush(errorResponse, { status: 408, statusText: 'Request Timeout' });

      const req3 = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}/generate-note`);
      req3.flush({ aiNote: 'AI generated note' });
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', () => {
      service.getTaskStats().subscribe(stats => {
        expect(stats).toEqual(mockTaskStats);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockTaskStats);
    });

    it('should handle HTTP errors for getTaskStats', () => {
      const errorResponse = { message: 'Server error' };
      
      service.getTaskStats().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req1 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req1.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req2 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req2.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req3 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req3.flush(errorResponse, { status: 500, statusText: 'Server Error' });
      
      const req4 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req4.flush(errorResponse, { status: 500, statusText: 'Server Error' });
    });

    it('should retry on failure', () => {
      service.getTaskStats().subscribe(stats => {
        expect(stats).toEqual(mockTaskStats);
      });

      const req1 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req1.flush('Error', { status: 500, statusText: 'Server Error' });

      const req2 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req2.flush('Error', { status: 500, statusText: 'Server Error' });

      const req3 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req3.flush('Error', { status: 500, statusText: 'Server Error' });

      const req4 = httpMock.expectOne('http://localhost:3000/tasks/stats');
      req4.flush(mockTaskStats);
    });
  });
}); 