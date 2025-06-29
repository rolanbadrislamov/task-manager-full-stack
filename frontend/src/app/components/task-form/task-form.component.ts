import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

// Store imports
import * as TaskActions from '../../store/task.actions';
import * as TaskSelectors from '../../store/task.selectors';
import { TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="task-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditMode ? '✏️ Edit Task' : '➕ Create New Task' }}
          </mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode ? 'Update your task details' : 'Add a new task to your list' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Task Title *</mat-label>
              <input 
                matInput 
                formControlName="title" 
                placeholder="Enter task title"
                maxlength="255">
              <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
              <mat-error *ngIf="taskForm.get('title')?.hasError('minlength')">
                Title must be at least 3 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                placeholder="Enter task description (optional)"
                rows="4"></textarea>
              <mat-hint>Provide additional details about the task</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="TODO">To Do</mat-option>
                <mat-option value="IN_PROGRESS">In Progress</mat-option>
                <mat-option value="DONE">Done</mat-option>
              </mat-select>
              <mat-hint>Select the current status of the task</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button 
                type="button" 
                mat-stroked-button 
                (click)="goBack()"
                [disabled]="loading$ | async">
                <mat-icon>arrow_back</mat-icon>
                Cancel
              </button>
              
              <button 
                type="submit" 
                mat-raised-button 
                color="primary"
                [disabled]="taskForm.invalid || (loading$ | async)">
                <mat-icon *ngIf="loading$ | async">hourglass_empty</mat-icon>
                <mat-icon *ngIf="!(loading$ | async)">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                {{ isEditMode ? 'Update Task' : 'Create Task' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="loading$ | async">
        <mat-spinner></mat-spinner>
        <p>{{ isEditMode ? 'Updating task...' : 'Creating task...' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .task-form-container {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-overlay p {
      margin-top: 16px;
      color: #666;
    }

    mat-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      color: #333;
      font-size: 1.5rem;
    }

    mat-card-subtitle {
      color: #666;
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
      
      .task-form-container {
        margin: 0 16px;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit, OnDestroy {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  
  loading$;
  error$;
  currentTask$;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: [TaskStatus.TODO]
    });
    
    this.loading$ = this.store.select(TaskSelectors.selectLoading);
    this.error$ = this.store.select(TaskSelectors.selectError);
    this.currentTask$ = this.store.select(TaskSelectors.selectCurrentTask);
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.setupErrorHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = params['id'];
        this.loadTaskForEdit();
      }
    });
  }

  private loadTaskForEdit(): void {
    if (this.taskId) {
      this.store.dispatch(TaskActions.loadTask({ id: this.taskId }));
      
      this.currentTask$.pipe(
        takeUntil(this.destroy$),
        filter(task => !!task)
      ).subscribe(task => {
        if (task) {
          this.taskForm.patchValue({
            title: task.title,
            description: task.description || '',
            status: task.status
          });
        }
      });
    }
  }

  private setupErrorHandling(): void {
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      if (this.isEditMode && this.taskId) {
        const updateData: UpdateTaskRequest = {
          title: formValue.title,
          description: formValue.description || undefined,
          status: formValue.status
        };
        this.store.dispatch(TaskActions.updateTask({ id: this.taskId, task: updateData }));
      } else {
        const createData: CreateTaskRequest = {
          title: formValue.title,
          description: formValue.description || undefined,
          status: formValue.status
        };
        this.store.dispatch(TaskActions.createTask({ task: createData }));
      }

      // Navigate back after successful operation
      this.loading$.pipe(
        takeUntil(this.destroy$),
        filter(loading => !loading)
      ).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
} 