import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as TaskActions from '../../store/task.actions';
import * as TaskSelectors from '../../store/task.selectors';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="task-detail-container">
      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading$ | async">
        <mat-spinner></mat-spinner>
        <p>Loading task details...</p>
      </div>

      <!-- Task Details -->
      <div *ngIf="currentTask$ | async as task; else noTask">
        <div class="header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ task.title }}</h1>
          <div class="header-actions">
            <button mat-raised-button color="accent" (click)="editTask(task.id)">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            <button mat-raised-button color="warn" (click)="deleteTask(task.id)">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </div>

        <div class="task-content">
          <!-- Status and Metadata -->
          <mat-card class="metadata-card">
            <mat-card-content>
              <div class="metadata-grid">
                <div class="metadata-item">
                  <label>Status:</label>
                  <mat-chip [color]="getStatusColor(task.status)" selected>
                    {{ getStatusLabel(task.status) }}
                  </mat-chip>
                </div>
                
                <div class="metadata-item">
                  <label>Created:</label>
                  <span>{{ task.createdAt | date:'medium' }}</span>
                </div>
                
                <div class="metadata-item">
                  <label>Last Updated:</label>
                  <span>{{ task.updatedAt | date:'medium' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Description -->
          <mat-card class="description-card" *ngIf="task.description">
            <mat-card-header>
              <mat-card-title>📝 Description</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description-text">{{ task.description }}</p>
            </mat-card-content>
          </mat-card>

          <!-- AI Note Section -->
          <mat-card class="ai-note-card">
            <mat-card-header>
              <mat-card-title>🤖 AI Analysis</mat-card-title>
              <mat-card-subtitle>
                AI-generated insights about this task
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div *ngIf="task.aiNote; else noAiNote">
                <div class="ai-note-content">
                  <p>{{ task.aiNote }}</p>
                </div>
                <mat-divider></mat-divider>
                <div class="ai-note-actions">
                  <button 
                    mat-stroked-button 
                    color="accent" 
                    (click)="generateAiNote(task.id)"
                    [disabled]="isGeneratingAiNote(task.id) | async">
                    <mat-icon>refresh</mat-icon>
                    Regenerate AI Note
                  </button>
                </div>
              </div>
              
              <ng-template #noAiNote>
                <div class="no-ai-note">
                  <p>No AI analysis available for this task yet.</p>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="generateAiNote(task.id)"
                    [disabled]="isGeneratingAiNote(task.id) | async">
                    <mat-icon>psychology</mat-icon>
                    {{ (isGeneratingAiNote(task.id) | async) ? 'Generating...' : 'Generate AI Note' }}
                  </button>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- Task Actions -->
          <mat-card class="actions-card">
            <mat-card-content>
              <div class="actions-grid">
                <button mat-stroked-button (click)="goBack()">
                  <mat-icon>list</mat-icon>
                  Back to Tasks
                </button>
                
                <button mat-raised-button color="primary" (click)="editTask(task.id)">
                  <mat-icon>edit</mat-icon>
                  Edit Task
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- No Task Found -->
      <ng-template #noTask>
        <div class="no-task-container">
          <mat-card>
            <mat-card-content>
              <div class="no-task-content">
                <mat-icon>search_off</mat-icon>
                <h2>Task Not Found</h2>
                <p>The task you're looking for doesn't exist or has been deleted.</p>
                <button mat-raised-button color="primary" (click)="goBack()">
                  <mat-icon>arrow_back</mat-icon>
                  Back to Tasks
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .task-detail-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .header h1 {
      margin: 0;
      flex: 1;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .back-button {
      margin-right: 8px;
    }

    .task-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .metadata-card {
      margin-bottom: 0;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .metadata-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metadata-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .description-card {
      margin-bottom: 0;
    }

    .description-text {
      line-height: 1.6;
      color: #333;
      margin: 0;
    }

    .ai-note-card {
      margin-bottom: 0;
    }

    .ai-note-content {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      margin-bottom: 16px;
    }

    .ai-note-content p {
      margin: 0;
      font-style: italic;
      color: #555;
      line-height: 1.6;
    }

    .ai-note-actions {
      padding-top: 16px;
    }

    .no-ai-note {
      text-align: center;
      padding: 32px 16px;
    }

    .no-ai-note p {
      color: #666;
      margin-bottom: 16px;
    }

    .actions-card {
      margin-bottom: 0;
    }

    .actions-grid {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .no-task-container {
      text-align: center;
      padding: 40px 20px;
    }

    .no-task-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .no-task-content mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }

    .no-task-content h2 {
      color: #333;
      margin: 0;
    }

    .no-task-content p {
      color: #666;
      margin: 0;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .header-actions {
        justify-content: center;
      }

      .metadata-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        flex-direction: column;
      }

      .task-detail-container {
        margin: 0 16px;
      }
    }
  `]
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  currentTask$;
  loading$;
  error$;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.currentTask$ = this.store.select(TaskSelectors.selectCurrentTask);
    this.loading$ = this.store.select(TaskSelectors.selectLoading);
    this.error$ = this.store.select(TaskSelectors.selectError);
  }

  ngOnInit(): void {
    this.loadTask();
    this.setupErrorHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTask(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.store.dispatch(TaskActions.loadTask({ id: params['id'] }));
      }
    });
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

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  editTask(id: string): void {
    this.router.navigate(['/tasks', id, 'edit']);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      this.store.dispatch(TaskActions.deleteTask({ id }));
      this.goBack();
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