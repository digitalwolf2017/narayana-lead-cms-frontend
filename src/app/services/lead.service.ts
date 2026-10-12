import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { ApiResponse } from '../core/models/api-response.model';

export interface LeadModule {
  key: string;
  label: string;
  match: string;
  value: string;
}

export interface LeadItem {
  id: string | number;
  entrydate: string;
  name: string;
  parent_email: string;
  phone: string;
  otp_validation: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string | null;
  utm_term?: string | null;
  redirect_from?: string;
  page_section?: string;
  city?: string;
  branch?: string;
  board?: string;
  reservation_type?: string;
  class?: string;
  class_category?: string;
  stream?: string;
  course?: string;
}

export interface LeadMeta {
  page?: number;
  per_page?: number;
  total?: number;
  filtered?: number;
  total_pages?: number;
  request_id?: string;
}

export interface LeadQueryParams {
  module: string;
  page?: number;
  per_page?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  [key: string]: unknown;
}

export interface LeadModulesResponse {
  success: boolean;
  message: string;
  data: LeadModule[];
  meta?: {
    request_id?: string;
  };
}

export interface LeadListResponse {
  success: boolean;
  message: string;
  data: LeadItem[];
  meta: LeadMeta;
}

export interface LeadDetailResponse {
  success: boolean;
  message: string;
  data: LeadItem;
  meta?: {
    request_id?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly api = inject(ApiService);

  /**
   * Fetch all supported Lead List navigation modules
   * GET /api/v1/backend/leads/modules
   */
  getModules(): Observable<LeadModulesResponse> {
    return this.api.get<LeadModulesResponse>(API_ENDPOINTS.LEADS.MODULES);
  }

  /**
   * Fetch leads for a specific module with filter/pagination parameters
   * GET /api/v1/backend/leads?module={moduleKey}&page=...&per_page=...
   */
  getLeads(params: LeadQueryParams): Observable<LeadListResponse> {
    return this.api.get<LeadListResponse>(API_ENDPOINTS.LEADS.BASE, params);
  }

  /**
   * Fetch single lead by ID for a module
   * GET /api/v1/backend/leads/{id}?module={moduleKey}
   */
  getLeadById(id: number | string, module: string): Observable<LeadDetailResponse> {
    return this.api.get<LeadDetailResponse>(API_ENDPOINTS.LEADS.BY_ID(id), { module });
  }

  /**
   * Export leads as CSV
   * GET /api/v1/backend/leads/export?module={moduleKey}&...
   */
  exportLeads(params: LeadQueryParams): Observable<Blob> {
    return this.api.getBlob(API_ENDPOINTS.LEADS.EXPORT, params);
  }
}
