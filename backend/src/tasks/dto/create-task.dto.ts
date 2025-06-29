import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
    maxLength: 255
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive README and API documentation for the project'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.TODO,
    example: TaskStatus.TODO
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
} 