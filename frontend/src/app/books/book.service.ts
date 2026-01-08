import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
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

export type BookDetail = Book & {
  abbildungen?: ReadonlyArray<{
    id?: number;
    beschriftung?: string;
    contentType?: string;
  }>;
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

export type BookCreateDto = {
  isbn: string;
  rating: number;
  art?: string;
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
  abbildungen?: unknown;
};

export type BookUpdateDto = BookCreateDto;

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  /**
   * Flexible Suche über die REST-Query-Parameter des Backends.
   * Backend liefert { content, page }.
   */
  async searchBooks(search: BookSearchParams = {}, page = 0, size = 10): Promise<BookPage> {
    // Backend erwartet page mit Zählung ab 1 (siehe createPageable)
    let params = new HttpParams().set('page', String(page + 1)).set('size', String(size));

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
          page: { size, number: page + 1, totalElements: 0, totalPages: 0 },
        };
      }
      throw error;
    }
  }

  /**
   * Detailanzeige: Buch anhand seiner ID laden.
   * Backend: GET /rest/:id
   */
  async getBookById(id: number): Promise<BookDetail> {
    return await firstValueFrom(this.http.get<BookDetail>(`${this.apiUrl}/${id}`));
  }

  async getBookByIdWithEtag(id: number): Promise<{ book: BookDetail; etag?: string }> {
    const response = await firstValueFrom(
      this.http.get<BookDetail>(`${this.apiUrl}/${id}`, {
        observe: 'response',
      }),
    );
    return { book: response.body as BookDetail, etag: response.headers.get('ETag') ?? undefined };
  }

  /**
   * Aktualisiert ein vorhandenes Buch.
   * Backend verlangt If-Match (optimistische Synchronisation).
   */
  async updateBook(id: number, dto: BookUpdateDto, ifMatch: string): Promise<{ etag?: string }> {
    const headers = new HttpHeaders().set('If-Match', ifMatch);
    const response = await firstValueFrom(
      this.http.put(`${this.apiUrl}/${id}`, dto, {
        headers,
        observe: 'response',
        responseType: 'text',
      }),
    );
    return { etag: response.headers.get('ETag') ?? undefined };
  }

  async deleteBook(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${this.apiUrl}/${id}`, {
        observe: 'response',
        responseType: 'text',
      }),
    );
  }

  /**
   * Legt ein neues Buch an (REST POST). Backend antwortet mit 201 + Location Header.
   */
  async createBook(dto: BookCreateDto): Promise<number | undefined> {
    const response = await firstValueFrom(
      this.http.post(this.apiUrl, dto, {
        observe: 'response',
        responseType: 'text',
      }),
    );

    const location = response.headers.get('Location') ?? undefined;
    if (!location) return undefined;

    const idString = location.split('/').filter(Boolean).at(-1);
    const id = idString ? Number(idString) : NaN;
    return Number.isFinite(id) ? id : undefined;
  }
}
