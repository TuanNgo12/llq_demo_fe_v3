import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GroupCategory, GroupCategoryInput } from '../models/group-category.model';
import { Component } from '../models/component.model';
import { FilterValues } from '../models/filter-values.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class RecordApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/group-category`;
  private readonly baseUrl_component = `${environment.apiBaseUrl}/components`;

  getAllComponent(): Observable<Component[]> {
    return this.http.get<Component[]>(this.baseUrl_component);
  }

  fetchById(id: number): Observable<GroupCategory> {
    return this.http.get<GroupCategory>(`${this.baseUrl}/update/${id}`);
  }

  create(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${this.baseUrl}/add`, input);
  }

  update(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${this.baseUrl}/update`, input);
  }

  search(input: FilterValues): Observable<PageResponse<GroupCategory>> {
    return this.http.post<PageResponse<GroupCategory>>(`${this.baseUrl}/search-native-query`, input);
  }

  remove(input: GroupCategoryInput): Observable<GroupCategory> {
    return this.http.post<GroupCategory>(`${this.baseUrl}/delete`, input);
  }

  updateStatus(input: GroupCategoryInput[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/update-status`, input);
  }

  updateListStatus(ids: number[], status: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/update-status-list`, { ids, status });
  }

  panding(ids: number[], status: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/panding`, { ids, status });
  }

  approve(ids: number[], status: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/approve`, { ids, status });
  }

  reject(ids: number[], status: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reject`, { ids, status });
  }

  cancel(ids: number[], status: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cancel`, { ids, status });
  }

  exportExcel(input: FilterValues): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/export-excel`, input, { responseType: 'blob', observe: 'response' });
  }
}
