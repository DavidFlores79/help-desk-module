import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/ticket.model';
import { ApiResponse } from '../models/api-response.model';

export interface UserListResponse {
  current_page: number;
  data: User[];
  total: number;
  per_page: number;
  last_page: number;
}

export interface UserFilters {
  name?: string;
  email?: string;
  department?: string;
  employee_id?: string;
  profile_id?: number; // 1=Admin, 2=SuperUser, 3=User
  status?: 0 | 1; // 0=inactive, 1=active
  phone?: string;
  per_page?: number;
  page?: number;
  sort_by?: 'name' | 'email' | 'created_at' | 'employee_id' | 'department';
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/users`;

  /**
   * Get users with optional filters
   * By default, returns only active users excluding authenticated user
   */
  getUsers(filters?: UserFilters): Observable<ApiResponse<UserListResponse>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<UserListResponse>>(this.apiUrl, { params });
  }

  /**
   * Get admin and superuser users for assignment
   * Returns only active users with profile_id 1 (Admin) or 2 (SuperUser)
   */
  getAdminsAndSuperUsers(): Observable<ApiResponse<UserListResponse>> {
    // We need to fetch both admins (profile_id=1) and superusers (profile_id=2)
    // Since the API only accepts a single profile_id filter, we'll fetch all users
    // and filter client-side, or make two requests
    const filters: UserFilters = {
      status: 1, // Active only
      per_page: 100, // Get all available
      sort_by: 'name',
      sort_order: 'asc'
      // Note: Not filtering by profile_id here because we need both 1 and 2
      // Will filter client-side in component
    };
    
    return this.getUsers(filters);
  }
  
  /**
   * Get only admin users (profile_id = 1)
   */
  getAdminUsers(): Observable<ApiResponse<UserListResponse>> {
    const filters: UserFilters = {
      profile_id: 1, // Admin only
      status: 1,
      per_page: 100,
      sort_by: 'name',
      sort_order: 'asc'
    };
    
    return this.getUsers(filters);
  }
  
  /**
   * Get only superuser users (profile_id = 2)
   */
  getSuperUsers(): Observable<ApiResponse<UserListResponse>> {
    const filters: UserFilters = {
      profile_id: 2, // SuperUser only
      status: 1,
      per_page: 100,
      sort_by: 'name',
      sort_order: 'asc'
    };
    
    return this.getUsers(filters);
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search users by name with server-side filtering
   * Uses the name parameter which matches against name, email, department, and employee_id
   */
  searchUsers(searchTerm: string, perPage: number = 20): Observable<ApiResponse<UserListResponse>> {
    const filters: UserFilters = {
      name: searchTerm,
      status: 1, // Active users only
      per_page: perPage,
      sort_by: 'name',
      sort_order: 'asc'
    };

    return this.getUsers(filters);
  }

  /**
   * @deprecated Use getAdminsAndSuperUsers() instead
   */
  getTechnicians(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/technicians`);
  }
}
