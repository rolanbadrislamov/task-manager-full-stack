import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { TaskService } from '../services/task.service';
import * as TaskActions from './task.actions';
import * as TaskSelectors from './task.selectors';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);
  private taskService = inject(TaskService);
  private store = inject(Store);
  
  loadTasks$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.loadTasks),
    withLatestFrom(this.store.select(TaskSelectors.selectFilters)),
    mergeMap(([action, filters]) => {
      const params = { ...filters, ...action.params };
      return this.taskService.getTasks(params).pipe(
        map(response => TaskActions.loadTasksSuccess({ response })),
        catchError(error => of(TaskActions.loadTasksFailure({ error: error.message })))
      );
    })
  ));

  loadTask$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.loadTask),
    mergeMap(({ id }) => this.taskService.getTask(id).pipe(
      map(task => TaskActions.loadTaskSuccess({ task })),
      catchError(error => of(TaskActions.loadTaskFailure({ error: error.message })))
    ))
  ));

  createTask$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.createTask),
    mergeMap(({ task }) => this.taskService.createTask(task).pipe(
      map(createdTask => TaskActions.createTaskSuccess({ task: createdTask })),
      catchError(error => of(TaskActions.createTaskFailure({ error: error.message })))
    ))
  ));

  updateTask$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.updateTask),
    mergeMap(({ id, task }) => this.taskService.updateTask(id, task).pipe(
      map(updatedTask => TaskActions.updateTaskSuccess({ task: updatedTask })),
      catchError(error => of(TaskActions.updateTaskFailure({ error: error.message })))
    ))
  ));

  deleteTask$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.deleteTask),
    mergeMap(({ id }) => this.taskService.deleteTask(id).pipe(
      map(() => TaskActions.deleteTaskSuccess({ id })),
      catchError(error => of(TaskActions.deleteTaskFailure({ error: error.message })))
    ))
  ));

  generateAiNote$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.generateAiNote),
    mergeMap(({ id }) => this.taskService.generateAiNote(id).pipe(
      map(response => TaskActions.generateAiNoteSuccess({ id, aiNote: response.aiNote })),
      catchError(error => of(TaskActions.generateAiNoteFailure({ id, error: error.message })))
    ))
  ));

  loadTaskStats$ = createEffect(() => this.actions$.pipe(
    ofType(TaskActions.loadTaskStats),
    mergeMap(() => this.taskService.getTaskStats().pipe(
      map(stats => TaskActions.loadTaskStatsSuccess({ stats })),
      catchError(error => of(TaskActions.loadTaskStatsFailure({ error: error.message })))
    ))
  ));

  refreshTasksAfterMutation$ = createEffect(() => this.actions$.pipe(
    ofType(
      TaskActions.createTaskSuccess,
      TaskActions.updateTaskSuccess,
      TaskActions.deleteTaskSuccess
    ),
    withLatestFrom(this.store.select(TaskSelectors.selectFilters)),
    map(([action, filters]) => TaskActions.loadTasks({ params: filters }))
  ));
} 