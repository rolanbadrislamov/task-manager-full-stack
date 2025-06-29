import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';

describe('CreateTaskDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.description = 'Test Description';
      createTaskDto.status = TaskStatus.TODO;

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimal data', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when title is missing', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.description = 'Test Description';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail validation when title is empty', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = '';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when title is not a string', async () => {
      const createTaskDto = new CreateTaskDto();
      (createTaskDto as any).title = 123;

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should pass validation when description is optional', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation when description is provided', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.description = 'Test Description';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when description is not a string', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      (createTaskDto as any).description = 123;

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should pass validation with valid status', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.status = TaskStatus.IN_PROGRESS;

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when status is invalid', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      (createTaskDto as any).status = 'INVALID_STATUS';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should pass validation with all valid enum values', async () => {
      const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

      for (const status of statuses) {
        const createTaskDto = new CreateTaskDto();
        createTaskDto.title = 'Test Task';
        createTaskDto.status = status;

        const errors = await validate(createTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('data types', () => {
    it('should handle string values correctly', () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.description = 'Test Description';

      expect(typeof createTaskDto.title).toBe('string');
      expect(typeof createTaskDto.description).toBe('string');
    });

    it('should handle enum values correctly', () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.status = TaskStatus.DONE;

      expect(createTaskDto.status).toBe(TaskStatus.DONE);
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'A'.repeat(255);

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle very long description', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Test Task';
      createTaskDto.description = 'A'.repeat(1000);

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Task with special chars: !@#$%^&*()';
      createTaskDto.description = 'Description with "quotes" and \'apostrophes\'';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      const createTaskDto = new CreateTaskDto();
      createTaskDto.title = 'Task with unicode: 🚀 📝 ✅';
      createTaskDto.description = 'Description with emojis: 🎯 💡';

      const errors = await validate(createTaskDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('default values', () => {
    it('should not have default values for required fields', () => {
      const createTaskDto = new CreateTaskDto();

      expect(createTaskDto.title).toBeUndefined();
      expect(createTaskDto.description).toBeUndefined();
      expect(createTaskDto.status).toBeUndefined();
    });
  });
}); 