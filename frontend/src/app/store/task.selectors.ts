import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from './task.reducer';

export const selectTaskState = createFeatureSelector<TaskState>('task');

export const selectTasks = createSelector(
  selectTaskState,
  (state) => state.tasks
);

export const selectCurrentTask = createSelector(
  selectTaskState,
  (state) => state.currentTask
);

export const selectLoading = createSelector(
  selectTaskState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectTaskState,
  (state) => state.error
);

export const selectStats = createSelector(
  selectTaskState,
  (state) => state.stats
);

export const selectPagination = createSelector(
  selectTaskState,
  (state) => state.pagination
);

export const selectFilters = createSelector(
  selectTaskState,
  (state) => state.filters
);

export const selectAiNoteLoading = (taskId?: string) => createSelector(
  selectTaskState,
  (state) => taskId ? state.aiNoteLoading.includes(taskId) : state.aiNoteLoading.length > 0
);

export const selectTasksByStatus = createSelector(
  selectTasks,
  (tasks) => {
    const grouped = {
      TODO: tasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter(t => t.status === 'DONE')
    };
    return grouped;
  }
);

export const selectTaskById = (id: string) => createSelector(
  selectTasks,
  (tasks) => tasks.find(task => task.id === id)
);

export const selectHasTasks = createSelector(
  selectTasks,
  (tasks) => tasks.length > 0
);

export const selectTasksCount = createSelector(
  selectTasks,
  (tasks) => tasks.length
);

export const selectTasksWithAiNotes = createSelector(
  selectTasks,
  (tasks) => tasks.filter(task => task.aiNote)
);

export const selectTasksWithoutAiNotes = createSelector(
  selectTasks,
  (tasks) => tasks.filter(task => !task.aiNote)
); 