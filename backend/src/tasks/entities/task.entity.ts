import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Unique task identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
    maxLength: 255
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Write comprehensive README and API documentation',
    nullable: true
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Current task status',
    enum: TaskStatus,
    example: TaskStatus.TODO
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'AI-generated note for the task',
    example: 'AI Analysis: This task appears to be well-structured...',
    nullable: true
  })
  @Column({ type: 'text', nullable: true })
  aiNote?: string;

  @ApiProperty({
    description: 'Task creation timestamp',
    example: '2025-06-28T10:30:00.000Z'
  })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty({
    description: 'Task last update timestamp',
    example: '2025-06-28T10:30:00.000Z'
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
} 