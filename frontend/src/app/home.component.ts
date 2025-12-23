import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { BookService, Book, BookFilter } from './books/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <header class="header">
      <button class="home-btn" (click)="goHome()" aria-label="Zur Startseite">🏠 Home</button>
      <button class="logout-btn" (click)="logout()" aria-label="Abmelden">Logout</button>
    </header>
    <section class="search-section">
      <form (submit)="onSearch($event)" class="search-form" role="search">
        <input type="text" placeholder="Buchsuche..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" name="search" aria-label="Bücher suchen" />
        <select [value]="selectedFilter()" (change)="selectedFilter.set($any($event.target).value)" name="filter" aria-label="Filter">
          @for (f of filters; track f.value) {
            <option [value]="f.value">{{ f.label }}</option>
          }
        </select>
        <button type="submit">Suchen</button>
      </form>
    </section>
    <section class="results-section">
      @if (books().length > 0) {
        <ul>
          @for (book of books(); track book.id) {
            <li>
              <strong>{{ book.titel }}</strong> @if (book.untertitel) { <span>– {{ book.untertitel }}</span> }<br />
              <span>ISBN: {{ book.isbn }}</span> | <span>Buchart: {{ book.art }}</span>
            </li>
          }
        </ul>
      } @else {
        <p>Keine Bücher gefunden.</p>
      }
    </section>
  `,
  styles: [
    `.header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #ddd; }
     .home-btn, .logout-btn { background: none; border: none; font-size: 1rem; cursor: pointer; }
     .search-section { padding: 1rem; }
     .search-form { display: flex; gap: 0.5rem; }
     .results-section { padding: 1rem; }
     ul { list-style: none; padding: 0; }
     li { margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private auth = inject(AuthService) as AuthService;
  private router = inject(Router);
  private bookService = inject(BookService) as BookService;

  searchTerm = signal('');
  selectedFilter = signal<BookFilter>('titel');
  filters = [
    { value: 'titel', label: 'Titel' },
    { value: 'isbn', label: 'ISBN' },
    { value: 'art', label: 'Buchart' },
    // ggf. weitere Filter entsprechend Backend-API
  ];

  private booksSignal = signal<Book[]>([]);
  books = computed(() => this.booksSignal());

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    void this.auth.logout();
  }

  async onSearch(event: Event) {
    event.preventDefault();
    const result = await this.bookService.searchBooks(this.searchTerm(), this.selectedFilter());
    this.booksSignal.set(result);
  }
}
