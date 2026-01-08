import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../auth/auth.service';
import { BookDetail, BookService } from './book.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatCardModule, MatSnackBarModule],
  template: `
    <mat-toolbar>
      <button mat-button type="button" (click)="back()">Zurück</button>
      <span class="spacer"></span>
      <span>Details</span>
    </mat-toolbar>

    <div class="page">
      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <p>Lade…</p>
          } @else if (error()) {
            <p class="error">{{ error() }}</p>
          } @else if (book()) {
            <div class="actions">
              <button mat-stroked-button type="button" (click)="edit()">Bearbeiten</button>
              @if (auth.hasRole('admin')) {
                <button mat-stroked-button type="button" (click)="remove()">Löschen</button>
              }
            </div>

            <h2 class="title">{{ book()!.titel.titel }}</h2>
            @if (book()!.titel.untertitel) {
              <p class="subtitle">{{ book()!.titel.untertitel }}</p>
            }

            <dl class="grid" aria-label="Buchdetails">
              <dt>ID</dt>
              <dd>{{ book()!.id }}</dd>

              <dt>Version</dt>
              <dd>{{ book()!.version ?? '-' }}</dd>

              <dt>ISBN</dt>
              <dd>{{ book()!.isbn }}</dd>

              <dt>Art</dt>
              <dd>{{ book()!.art ?? '-' }}</dd>

              <dt>Rating</dt>
              <dd>{{ book()!.rating }}</dd>

              <dt>Preis</dt>
              <dd>{{ book()!.preis }}</dd>

              <dt>Rabatt</dt>
              <dd>{{ book()!.rabatt ?? '-' }}</dd>

              <dt>Lieferbar</dt>
              <dd>
                @if (book()!.lieferbar === true) {
                  ja
                } @else if (book()!.lieferbar === false) {
                  nein
                } @else {
                  -
                }
              </dd>

              <dt>Datum</dt>
              <dd>{{ book()!.datum ?? '-' }}</dd>

              <dt>Homepage</dt>
              <dd>{{ book()!.homepage ?? '-' }}</dd>

              <dt>Schlagwörter</dt>
              <dd>
                {{
                  (book()!.schlagwoerter?.length ?? 0) > 0 ? book()!.schlagwoerter!.join(', ') : '-'
                }}
              </dd>

              <dt>Abbildungen</dt>
              <dd>
                {{ (book()!.abbildungen?.length ?? 0) > 0 ? book()!.abbildungen!.length : '-' }}
              </dd>
            </dl>
          } @else {
            <p>Kein Buch geladen.</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      mat-toolbar {
        display: flex;
        flex-wrap: wrap;
        height: auto;
      }

      .spacer {
        flex: 1;
      }

      .page {
        padding: 16px;
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(0, 1fr);
        max-width: 900px;
        margin: 0 auto;
      }

      .title {
        margin: 0 0 4px;
      }

      .subtitle {
        margin: 0 0 16px;
        opacity: 0.8;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .grid {
        display: grid;
        grid-template-columns: 140px minmax(0, 1fr);
        gap: 8px 16px;
        margin: 0;
      }

      dt {
        font-weight: 600;
        opacity: 0.9;
      }

      dd {
        margin: 0;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .error {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  readonly auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  error = signal<string | null>(null);
  book = signal<BookDetail | null>(null);

  constructor() {
    void this.load();
  }

  back() {
    this.router.navigate(['/home']);
  }

  edit() {
    const b = this.book();
    if (!b) return;
    this.router.navigate(['/books', b.id, 'edit']);
  }

  async remove() {
    const b = this.book();
    if (!b) return;
    if (!this.auth.hasRole('admin')) return;

    const ok = window.confirm(`Buch mit ID ${b.id} wirklich löschen?`);
    if (!ok) return;

    try {
      await this.bookService.deleteBook(b.id);
      this.snackBar.open('Gelöscht.', 'OK', { duration: 2500 });
      this.router.navigate(['/home']);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      this.snackBar.open(status ? `Fehler ${status} beim Löschen.` : 'Fehler beim Löschen.', 'OK', {
        duration: 6000,
      });
    }
  }

  private async load() {
    this.loading.set(true);
    this.error.set(null);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      this.error.set('Ungültige ID.');
      return;
    }

    try {
      const book = await this.bookService.getBookById(id);
      this.book.set(book);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      if (status === 404) {
        this.error.set('Buch nicht gefunden.');
      } else {
        this.error.set(status ? `Fehler ${status} beim Laden.` : 'Fehler beim Laden.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
