
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';


// Entspricht dem Backend-DTO (siehe BuchDTO und TitelDTO)
export type Book = {
  id: number;
  version?: number;
  isbn: string;
  art?: string;
  rating: number;
  preis: number;
  rabatt?: number;
  lieferbar?: boolean;
  datum?: string;
  homepage?: string;
  schlagwoerter?: string[];
  titel: {
    titel: string;
    untertitel?: string;
  };
};

export type BookFilter = 'titel' | 'isbn' | 'art';

export type BookPage = {
  content: Book[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type BookSearchParams = Record<string, string | number | boolean | undefined>;


@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  /**
   * Flexible Suche über die REST-Query-Parameter des Backends.
   * Backend liefert { content, page }.
   */
  async searchBooks(
    search: BookSearchParams = {},
    page = 0,
    size = 10,
  ): Promise<BookPage> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));

    Object.entries(search).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) return;
      params = params.set(key, String(value));
    });

    try {
      return await firstValueFrom(this.http.get<BookPage>(this.apiUrl, { params }));
    } catch (error: unknown) {
      const httpError = error as HttpErrorResponse;
      if (httpError.status === 404) {
        return {
          content: [],
          page: { size, number: page, totalElements: 0, totalPages: 0 },
        };
      }
      throw error;
    }
  }
}
