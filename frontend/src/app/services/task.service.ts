import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, retry, delay } from 'rxjs/operators';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskQueryParams, 
  TaskResponse,
  TaskStats 
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(params: TaskQueryParams = {}): Observable<TaskResponse> {
    let httpParams = new HttpParams();
    
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    console.log('API Request params:', params);
    console.log('HTTP params:', httpParams.toString());

    return this.http.get<TaskResponse>(this.apiUrl, { params: httpParams })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .pipe(
        map(response => {
          console.log('API Response:', response);
          return response;
        })
      );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateTask(id: string, task: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  generateAiNote(id: string): Observable<{ aiNote: string }> {
    return this.http.post<{ aiNote: string }>(`${this.apiUrl}/${id}/generate-note`, {})
      .pipe(
        delay(2000), // Simulate AI processing delay
        retry(2), // Retry up to 2 times
        catchError(this.handleError)
      );
  }

  getTaskStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.apiUrl}/stats`)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.status === 408 ? 'AI service timeout' :
                    error.status === 503 ? 'AI service unavailable' :
                    error.error?.message || `Error Code: ${error.status}`;
    }
    
    console.error('TaskService error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 