
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';


// Entspricht dem Backend-DTO (siehe BuchDTO und TitelDTO)
export type Book = {
  id: number;
  isbn: string;
  art?: string;
  rating: number;
  preis: number;
  rabatt?: number;
  lieferbar?: boolean;
  datum?: string;
  homepage?: string;
  titel: {
    titel: string;
    untertitel?: string;
  };
};

export type BookFilter = 'titel' | 'isbn' | 'art';


@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private apiUrl = '/api/buch';

  /**
   * Sucht Bücher mit dem angegebenen Filter und Suchbegriff.
   * Gibt ein Array von Book-Objekten zurück.
   */
  async searchBooks(term: string, filter: BookFilter): Promise<Book[]> {
    if (!term) return [];
    // Query-Parameter wie vom Backend erwartet
    const params: Record<string, string> = {};
    params[filter] = term;
    // Das Backend liefert ein Page-Objekt mit content-Array
    const response = await this.http.get<{ content: Book[] }>(this.apiUrl, { params }).toPromise();
    // Defensive: Falls kein content vorhanden, leeres Array
    return response?.content ?? [];
  }
}
