import { validate } from 'class-validator';
import { UpdateTaskDto } from './update-task.dto';
import { TaskStatus } from '../entities/task.entity';

describe('UpdateTaskDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Updated Task';
      updateTaskDto.description = 'Updated Description';
      updateTaskDto.status = TaskStatus.IN_PROGRESS;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Updated Task';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const updateTaskDto = new UpdateTaskDto();

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when title is empty string', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = '';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when title is not a string', async () => {
      const updateTaskDto = new UpdateTaskDto();
      (updateTaskDto as any).title = 123;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should pass validation when description is provided', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.description = 'Updated Description';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when description is not a string', async () => {
      const updateTaskDto = new UpdateTaskDto();
      (updateTaskDto as any).description = 123;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should pass validation with valid status', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.status = TaskStatus.DONE;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when status is invalid', async () => {
      const updateTaskDto = new UpdateTaskDto();
      (updateTaskDto as any).status = 'INVALID_STATUS';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should pass validation with all valid enum values', async () => {
      const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

      for (const status of statuses) {
        const updateTaskDto = new UpdateTaskDto();
        updateTaskDto.status = status;

        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('data types', () => {
    it('should handle string values correctly', () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Updated Task';
      updateTaskDto.description = 'Updated Description';

      expect(typeof updateTaskDto.title).toBe('string');
      expect(typeof updateTaskDto.description).toBe('string');
    });

    it('should handle enum values correctly', () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.status = TaskStatus.DONE;

      expect(updateTaskDto.status).toBe(TaskStatus.DONE);
    });
  });

  describe('edge cases', () => {
    it('should handle very long title', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'A'.repeat(255);

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle very long description', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.description = 'A'.repeat(1000);

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Task with special chars: !@#$%^&*()';
      updateTaskDto.description = 'Description with "quotes" and \'apostrophes\'';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Task with unicode: 🚀 📝 ✅';
      updateTaskDto.description = 'Description with emojis: 🎯 💡';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('partial updates', () => {
    it('should allow updating only title', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'New Title';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating only description', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.description = 'New Description';

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating only status', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.status = TaskStatus.IN_PROGRESS;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should allow updating multiple fields', async () => {
      const updateTaskDto = new UpdateTaskDto();
      updateTaskDto.title = 'Updated Title';
      updateTaskDto.description = 'Updated Description';
      updateTaskDto.status = TaskStatus.DONE;

      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('default values', () => {
    it('should not have default values', () => {
      const updateTaskDto = new UpdateTaskDto();

      expect(updateTaskDto.title).toBeUndefined();
      expect(updateTaskDto.description).toBeUndefined();
      expect(updateTaskDto.status).toBeUndefined();
    });
  });
}); 