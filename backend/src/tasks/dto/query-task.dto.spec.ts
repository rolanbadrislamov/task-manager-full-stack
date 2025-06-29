import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { QueryTaskDto } from './query-task.dto';
import { TaskStatus } from '../entities/task.entity';

describe('QueryTaskDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        status: TaskStatus.TODO,
        search: 'test',
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'ASC',
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {});

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        status: TaskStatus.IN_PROGRESS,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when status is invalid', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        status: 'INVALID_STATUS',
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should fail validation when page is negative', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        page: -1,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when page is zero', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        page: 0,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when limit is negative', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        limit: -1,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when limit is zero', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        limit: 0,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when limit is too high', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        limit: 101,
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.max).toBeDefined();
    });

    it('should fail validation when sortBy is invalid', async () => {
      const queryTaskDto = new QueryTaskDto();
      queryTaskDto.sortBy = 'invalidField';

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when sortOrder is invalid', async () => {
      const queryTaskDto = new QueryTaskDto();
      queryTaskDto.sortOrder = 'INVALID' as any;

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should pass validation with all valid enum values', async () => {
      const validStatuses = Object.values(TaskStatus);
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
      const validSortOrders = ['ASC', 'DESC'];

      for (const status of validStatuses) {
        for (const sortBy of validSortFields) {
          for (const sortOrder of validSortOrders) {
            const queryTaskDto = plainToClass(QueryTaskDto, {
              status,
              sortBy,
              sortOrder,
              page: 1,
              limit: 10,
            });

            const errors = await validate(queryTaskDto);
            expect(errors).toHaveLength(0);
          }
        }
      }
    });

    it('should pass validation with valid page and limit values', async () => {
      const validPages = [1, 5, 10, 100];
      const validLimits = [1, 5, 10, 50, 100];

      for (const page of validPages) {
        for (const limit of validLimits) {
          const queryTaskDto = plainToClass(QueryTaskDto, {
            page,
            limit,
          });

          const errors = await validate(queryTaskDto);
          expect(errors).toHaveLength(0);
        }
      }
    });

    it('should pass validation with search term', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        search: 'test search term',
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty search term', async () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        search: '',
      });

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle undefined values', async () => {
      const queryTaskDto = new QueryTaskDto();
      queryTaskDto.status = undefined;
      queryTaskDto.search = undefined;
      queryTaskDto.page = undefined;
      queryTaskDto.limit = undefined;
      queryTaskDto.sortBy = undefined;
      queryTaskDto.sortOrder = undefined;

      const errors = await validate(queryTaskDto);
      expect(errors).toHaveLength(0);

      expect(queryTaskDto.status).toBeUndefined();
      expect(queryTaskDto.search).toBeUndefined();
      expect(queryTaskDto.page).toBeUndefined();
      expect(queryTaskDto.limit).toBeUndefined();
      expect(queryTaskDto.sortBy).toBeUndefined();
      expect(queryTaskDto.sortOrder).toBeUndefined();
    });
  });

  describe('transformation', () => {
    it('should transform string numbers to numbers', () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        page: '2',
        limit: '15',
      });

      expect(queryTaskDto.page).toBe(2);
      expect(queryTaskDto.limit).toBe(15);
    });

    it('should handle undefined values', () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {});

      expect(queryTaskDto.status).toBeUndefined();
      expect(queryTaskDto.search).toBeUndefined();
      expect(queryTaskDto.page).toBeUndefined();
      expect(queryTaskDto.limit).toBeUndefined();
      expect(queryTaskDto.sortBy).toBeUndefined();
      expect(queryTaskDto.sortOrder).toBeUndefined();
    });

    it('should preserve string values', () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        status: TaskStatus.TODO,
        search: 'test search',
        sortBy: 'title',
        sortOrder: 'ASC',
      });

      expect(queryTaskDto.status).toBe(TaskStatus.TODO);
      expect(queryTaskDto.search).toBe('test search');
      expect(queryTaskDto.sortBy).toBe('title');
      expect(queryTaskDto.sortOrder).toBe('ASC');
    });

    it('should handle mixed data types', () => {
      const queryTaskDto = plainToClass(QueryTaskDto, {
        status: TaskStatus.IN_PROGRESS,
        search: 'test',
        page: 3,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      expect(queryTaskDto.status).toBe(TaskStatus.IN_PROGRESS);
      expect(queryTaskDto.search).toBe('test');
      expect(queryTaskDto.page).toBe(3);
      expect(queryTaskDto.limit).toBe(20);
      expect(queryTaskDto.sortBy).toBe('createdAt');
      expect(queryTaskDto.sortOrder).toBe('DESC');
    });
  });

  describe('default values', () => {
    it('should have no default values when not provided', () => {
      const queryTaskDto = new QueryTaskDto();

      expect(queryTaskDto.page).toBeUndefined();
      expect(queryTaskDto.limit).toBeUndefined();
      expect(queryTaskDto.sortBy).toBeUndefined();
      expect(queryTaskDto.sortOrder).toBeUndefined();
    });
  });
}); 