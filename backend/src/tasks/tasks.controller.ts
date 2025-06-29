import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { TaskStatus } from './entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false, description: 'Filter by task status' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Items per page (default: 5, max: 100)' })
  @ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Sort field (createdAt, updatedAt, title, status)' })
  @ApiQuery({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false, description: 'Sort direction' })
  findAll(@Query() queryDto: QueryTaskDto) {
    return this.tasksService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({ status: 200, description: 'Task statistics retrieved successfully' })
  getTaskStats() {
    return this.tasksService.getTaskStats();
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get tasks by specific status' })
  @ApiParam({ name: 'status', enum: TaskStatus, description: 'Task status' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/generate-note')
  @ApiOperation({ summary: 'Generate AI note for a task' })
  @ApiParam({ name: 'id', type: String, description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'AI note generated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 408, description: 'AI service timeout' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  generateAiNote(@Param('id') id: string) {
    return this.tasksService.generateAiNote(id);
  }
} 