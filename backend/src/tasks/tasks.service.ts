import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, ILike, MoreThanOrEqual } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { PaginatedResponse, PaginationMeta } from './interfaces/pagination.interface';
import { 
  AiServiceException, 
  AiServiceTimeoutException, 
  AiServiceUnavailableException 
} from './exceptions/ai-service.exception';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  private formatTaskDates(task: Task): Task {
    if (task.createdAt) {
      task.createdAt = new Date(task.createdAt);
    }
    if (task.updatedAt) {
      task.updatedAt = new Date(task.updatedAt);
    }
    return task;
  }

  private formatTaskDatesArray(tasks: Task[]): Task[] {
    return tasks.map(task => this.formatTaskDates(task));
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);
    const savedTask = await this.tasksRepository.save(task);
    return this.formatTaskDates(savedTask);
  }

  async findAll(queryDto: QueryTaskDto): Promise<PaginatedResponse<Task>> {
    const { status, search, limit = 5, page = 1, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
    
    const queryBuilder = this.tasksRepository.createQueryBuilder('task');
    
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`task.${sortField}`, sortOrder);
    
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
    
    return { data: this.formatTaskDatesArray(data), meta };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.formatTaskDates(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);
    return this.formatTaskDates(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async generateAiNote(id: string): Promise<Task> {
    const task = await this.findOne(id);
    
    this.logger.log(`Generating AI note for task: ${id}`);
    
    try {
      const aiNote = await this.generateSimulatedAiNoteWithRetry(task, 3);
      
      task.aiNote = aiNote;
      const savedTask = await this.tasksRepository.save(task);
      
      this.logger.log(`AI note generated successfully for task: ${id}`);
      return this.formatTaskDates(savedTask);
    } catch (error) {
      this.logger.error(`Failed to generate AI note for task: ${id}`, error.stack);
      throw error;
    }
  }

  private async generateSimulatedAiNoteWithRetry(task: Task, maxRetries: number): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`AI generation attempt ${attempt}/${maxRetries} for task: ${task.id}`);
        
        // Simulate network delay and potential failures
        const delay = Math.random() * 3000 + 1000; // 1-4 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simulate failure scenarios (20% chance of failure on each attempt)
        const shouldFail = Math.random() < 0.2;
        if (shouldFail && attempt < maxRetries) {
          const errorType = Math.random();
          if (errorType < 0.5) {
            throw new AiServiceTimeoutException('AI service request timed out');
          } else {
            throw new AiServiceUnavailableException('AI service is temporarily unavailable');
          }
        }
        
        return this.generateSimulatedAiNote(task);
        
      } catch (error) {
        this.logger.warn(`AI generation attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const backoffDelay = Math.pow(2, attempt) * 1000;
        this.logger.log(`Retrying in ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
    
    throw new AiServiceException('Failed to generate AI note after maximum retries');
  }

  private generateSimulatedAiNote(task: Task): string {
    const statusBasedNotes = {
      [TaskStatus.TODO]: [
        `AI Analysis: "${task.title}" is ready to start. Consider breaking it down into smaller, actionable steps for better progress tracking.`,
        `AI Insight: This new task looks well-defined. I recommend allocating focused time blocks to tackle it efficiently.`,
        `AI Suggestion: Before starting "${task.title}", gather all necessary resources and clarify any dependencies.`,
        `AI Tip: This task appears straightforward. Consider using the Pomodoro technique to maintain focus while working on it.`,
      ],
      [TaskStatus.IN_PROGRESS]: [
        `AI Analysis: Great progress on "${task.title}"! Stay focused and maintain the momentum you've built.`,
        `AI Insight: You're actively working on this task. Consider documenting your progress to track what's been accomplished.`,
        `AI Recommendation: Since this task is in progress, set specific milestones to measure completion and avoid scope creep.`,
        `AI Observation: This task is moving forward. Take short breaks to maintain productivity and avoid burnout.`,
      ],
      [TaskStatus.DONE]: [
        `AI Analysis: Excellent work completing "${task.title}"! Take a moment to document any lessons learned for future reference.`,
        `AI Insight: Task completed successfully! Consider reviewing the process to identify what worked well for similar future tasks.`,
        `AI Celebration: Well done on finishing this task! Your consistent effort has paid off.`,
        `AI Reflection: Completed task detected. Consider if any follow-up actions or related tasks need to be created.`,
      ],
    };

    const baseNotes = [
      `AI Analysis: This task "${task.title}" appears to be well-structured and achievable. Consider breaking it down into smaller subtasks for better progress tracking.`,
      `AI Insight: Based on the task description, this seems like a high-priority item. I recommend focusing on this task when you have uninterrupted time.`,
      `AI Suggestion: This task could benefit from collaboration. Consider involving team members who have expertise in this area.`,
      `AI Recommendation: Given the current status, I suggest setting specific milestones to track progress effectively.`,
      `AI Observation: This task aligns well with your overall project goals. Keep up the good work!`,
      `AI Tip: Consider using time-blocking techniques to complete this task more efficiently.`,
      `AI Analysis: This task has clear deliverables. Make sure to document your progress for future reference.`,
      `AI Insight: The complexity of this task suggests it might take longer than initially estimated. Plan accordingly.`,
    ];
    
    const relevantNotes = statusBasedNotes[task.status] || baseNotes;
    const randomIndex = Math.floor(Math.random() * relevantNotes.length);
    
    return relevantNotes[randomIndex];
  }

  async getTaskStats(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }> {
    const total = await this.tasksRepository.count();
    
    const todoCount = await this.tasksRepository.count({ where: { status: TaskStatus.TODO } });
    const inProgressCount = await this.tasksRepository.count({ where: { status: TaskStatus.IN_PROGRESS } });
    const doneCount = await this.tasksRepository.count({ where: { status: TaskStatus.DONE } });
    
    return {
      total,
      todo: todoCount,
      inProgress: inProgressCount,
      done: doneCount,
    };
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return await this.tasksRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}