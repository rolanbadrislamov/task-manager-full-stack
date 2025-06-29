import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

// Store imports
import * as TaskActions from '../../store/task.actions';
import * as TaskSelectors from '../../store/task.selectors';
import { TaskStatus, TaskQueryParams } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="task-list-container">
      <!-- Header -->
      <div class="header">
        <h1>📋 Task Manager</h1>
        <button mat-raised-button color="primary" (click)="createNewTask()">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
          New Task
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container" *ngIf="stats$ | async as stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">Total Tasks</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card todo">
          <mat-card-content>
            <div class="stat-number">{{ stats.todo }}</div>
            <div class="stat-label">To Do</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card in-progress">
          <mat-card-content>
            <div class="stat-number">{{ stats.inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card done">
          <mat-card-content>
            <div class="stat-number">{{ stats.done }}</div>
            <div class="stat-label">Done</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search tasks</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by title or description...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusControl">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="TODO">To Do</mat-option>
                <mat-option value="IN_PROGRESS">In Progress</mat-option>
                <mat-option value="DONE">Done</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select [formControl]="sortByControl">
                <mat-option value="createdAt">Created Date</mat-option>
                <mat-option value="updatedAt">Updated Date</mat-option>
                <mat-option value="title">Title</mat-option>
                <mat-option value="status">Status</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sort-order-field">
              <mat-label>Order</mat-label>
              <mat-select [formControl]="sortOrderControl">
                <mat-option value="DESC">Descending</mat-option>
                <mat-option value="ASC">Ascending</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading$ | async">
        <mat-spinner></mat-spinner>
        <p>Loading tasks...</p>
      </div>

      <!-- Error Message -->
      <mat-card class="error-card" *ngIf="error$ | async as error">
        <mat-card-content>
          <div class="error-content">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ error }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Task Cards -->
      <div class="tasks-grid" *ngIf="(tasks$ | async)?.length; else noTasks">
        <mat-card class="task-card" *ngFor="let task of tasks$ | async">
          <mat-card-header>
            <mat-card-title>{{ task.title }}</mat-card-title>
            <mat-card-subtitle>
              Created: {{ task.createdAt | date:'short' }}
            </mat-card-subtitle>
            <button mat-icon-button [matMenuTriggerFor]="menu" class="task-menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="editTask(task.id)">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item (click)="viewTask(task.id)">
                <mat-icon>visibility</mat-icon>
                <span>View</span>
              </button>
              <button mat-menu-item (click)="deleteTask(task.id)" class="delete-action">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </mat-card-header>

          <mat-card-content>
            <p class="task-description" *ngIf="task.description">
              {{ task.description }}
            </p>
            
            <div class="task-status">
              <mat-chip [color]="getStatusColor(task.status)" selected>
                {{ getStatusLabel(task.status) }}
              </mat-chip>
            </div>

            <div class="ai-note-section" *ngIf="task.aiNote">
              <h4>🤖 AI Note:</h4>
              <p class="ai-note">{{ task.aiNote }}</p>
            </div>

            <div class="task-actions">
              <button 
                mat-stroked-button 
                color="accent" 
                (click)="generateAiNote(task.id)"
                [disabled]="isGeneratingAiNote(task.id) | async"
                class="ai-button">
                <mat-icon>psychology</mat-icon>
                {{ (isGeneratingAiNote(task.id) | async) ? 'Generating...' : 'Generate AI Note' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- No Tasks Message -->
      <ng-template #noTasks>
        <mat-card class="no-tasks-card">
          <mat-card-content>
            <div class="no-tasks-content">
              <mat-icon>assignment</mat-icon>
              <h3>No tasks found</h3>
              <p>Create your first task to get started!</p>
              <button mat-raised-button color="primary" (click)="createNewTask()">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                Create Task
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-template>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="(tasks$ | async)?.length"
        [length]="(pagination$ | async)?.total || 1"
        [pageSize]="(pagination$ | async)?.limit || 5"
        [pageIndex]="((pagination$ | async)?.page || 1) - 1"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #546E7A;
    }

    .stat-label {
      color: #666;
      margin-top: 8px;
    }

    .todo .stat-number { color: #FF9800; }
    .in-progress .stat-number { color: #3F51B5; }
    .done .stat-number { color: #4CAF50; }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 16px;
      align-items: end;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .error-card {
      margin-bottom: 24px;
      border-left: 4px solid #f44336;
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .task-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .task-menu {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .task-description {
      color: #666;
      margin: 12px 0;
      line-height: 1.5;
    }

    .task-status {
      margin: 12px 0;
    }

    .ai-note-section {
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .ai-note-section h4 {
      margin: 0 0 8px 0;
      color: #2196f3;
    }

    .ai-note {
      margin: 0;
      font-style: italic;
      color: #555;
    }

    .task-actions {
      margin-top: 16px;
    }

    .ai-button {
      width: 100%;
    }

    .no-tasks-card {
      text-align: center;
      padding: 40px;
    }

    .no-tasks-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .no-tasks-content mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .delete-action {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr;
      }
      
      .tasks-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks$;
  loading$;
  error$;
  stats$;
  pagination$;

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  sortByControl = new FormControl('createdAt');
  sortOrderControl = new FormControl('DESC');

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.tasks$ = this.store.select(TaskSelectors.selectTasks);
    this.loading$ = this.store.select(TaskSelectors.selectLoading);
    this.error$ = this.store.select(TaskSelectors.selectError);
    this.stats$ = this.store.select(TaskSelectors.selectStats);
    this.pagination$ = this.store.select(TaskSelectors.selectPagination);
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.store.dispatch(TaskActions.loadTasks({}));
  }

  private loadStats(): void {
    this.store.dispatch(TaskActions.loadTaskStats());
  }

  private setupFilters(): void {
    // Search filter with debounce
    this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      this.updateFilters({ search: search || undefined });
    });

    // Status filter
    this.statusControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.updateFilters({ status: status as TaskStatus || undefined });
    });

    // Sort filters
    this.sortByControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(sortBy => {
      this.updateFilters({ sortBy: sortBy || 'createdAt' });
    });

    this.sortOrderControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(sortOrder => {
      this.updateFilters({ sortOrder: sortOrder as 'ASC' | 'DESC' || 'DESC' });
    });
  }

  private updateFilters(newFilters: Partial<TaskQueryParams>): void {
    const currentFilters = {
      page: 1,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      ...newFilters
    };
    this.store.dispatch(TaskActions.loadTasks({ params: currentFilters }));
  }

  onPageChange(event: PageEvent): void {
    const currentFilters = {
      page: event.pageIndex + 1,
      limit: event.pageSize,
      search: this.searchControl.value || undefined,
      status: this.statusControl.value as TaskStatus || undefined,
      sortBy: this.sortByControl.value || 'createdAt',
      sortOrder: this.sortOrderControl.value as 'ASC' | 'DESC' || 'DESC'
    };
    this.store.dispatch(TaskActions.loadTasks({ params: currentFilters }));
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(id: string): void {
    this.router.navigate(['/tasks', id, 'edit']);
  }

  viewTask(id: string): void {
    this.router.navigate(['/tasks', id]);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ id }));
    }
  }

  generateAiNote(id: string): void {
    this.store.dispatch(TaskActions.generateAiNote({ id }));
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'primary';
      case TaskStatus.IN_PROGRESS: return 'warn';
      case TaskStatus.DONE: return 'accent';
      default: return 'primary';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.IN_PROGRESS: return 'In Progress';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  }

  isGeneratingAiNote(taskId: string) {
    return this.store.select(TaskSelectors.selectAiNoteLoading(taskId));
  }
} 