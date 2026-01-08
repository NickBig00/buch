import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BookDetail, BookUpdateDto, BookService } from './book.service';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  template: `
    <mat-toolbar>
      <button mat-button type="button" (click)="back()">Zurück</button>
      <span class="spacer"></span>
      <span>Bearbeiten</span>
    </mat-toolbar>

    <div class="page">
      <mat-card>
        <mat-card-content>
          @if (loading()) {
            <p>Lade…</p>
          } @else if (error()) {
            <p class="error">{{ error() }}</p>
          } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="form">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Titel</mat-label>
                <input matInput formControlName="titel" />
                @if (form.controls.titel.touched && form.controls.titel.invalid) {
                  <mat-error>Titel ist erforderlich (max. 40 Zeichen).</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Untertitel (optional)</mat-label>
                <input matInput formControlName="untertitel" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>ISBN-13</mat-label>
                <input matInput formControlName="isbn" />
                @if (form.controls.isbn.touched && form.controls.isbn.invalid) {
                  <mat-error>ISBN ist erforderlich.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Buchart (optional)</mat-label>
                <mat-select formControlName="art">
                  <mat-option value="">(keine)</mat-option>
                  <mat-option value="EPUB">EPUB</mat-option>
                  <mat-option value="HARDCOVER">HARDCOVER</mat-option>
                  <mat-option value="PAPERBACK">PAPERBACK</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline" class="col">
                  <mat-label>Rating</mat-label>
                  <input matInput type="number" min="0" max="5" formControlName="rating" />
                  @if (form.controls.rating.touched && form.controls.rating.invalid) {
                    <mat-error>0 bis 5.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="col">
                  <mat-label>Preis</mat-label>
                  <input matInput type="number" min="0.01" step="0.01" formControlName="preis" />
                  @if (form.controls.preis.touched && form.controls.preis.invalid) {
                    <mat-error>Preis muss &gt; 0 sein.</mat-error>
                  }
                </mat-form-field>
              </div>

              <div class="row">
                <mat-form-field appearance="outline" class="col">
                  <mat-label>Rabatt (0..1, optional)</mat-label>
                  <input
                    matInput
                    type="number"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    formControlName="rabatt"
                  />
                  @if (form.controls.rabatt.touched && form.controls.rabatt.hasError('range')) {
                    <mat-error>Rabatt muss zwischen 0 und 1 liegen (exklusiv).</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="col">
                  <mat-label>Datum (optional)</mat-label>
                  <input matInput type="date" formControlName="datum" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Homepage (optional)</mat-label>
                <input matInput type="url" formControlName="homepage" />
              </mat-form-field>

              <mat-checkbox formControlName="lieferbar">Lieferbar</mat-checkbox>

              <div class="keywords" role="group" aria-label="Schlagwörter">
                <mat-checkbox formControlName="kwJavascript">JavaScript</mat-checkbox>
                <mat-checkbox formControlName="kwTypescript">TypeScript</mat-checkbox>
                <mat-checkbox formControlName="kwJava">Java</mat-checkbox>
                <mat-checkbox formControlName="kwPython">Python</mat-checkbox>
              </div>

              <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
                Speichern
              </button>
            </form>
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

      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .full {
        width: 100%;
        min-width: 0;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        min-width: 0;
      }

      .col {
        flex: 1 1 220px;
        min-width: 0;
      }

      .keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      button[type='submit'] {
        width: 100%;
      }

      @media (min-width: 700px) {
        button[type='submit'] {
          width: auto;
        }
      }

      .error {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  private id = signal<number | null>(null);
  private ifMatch = signal<string | null>(null);
  private loadedBook = signal<BookDetail | null>(null);

  form = this.fb.nonNullable.group({
    titel: ['', [Validators.required, Validators.maxLength(40)]],
    untertitel: ['', [Validators.maxLength(40)]],
    isbn: ['', [Validators.required]],
    art: [''],
    rating: [1, [Validators.required, Validators.min(0), Validators.max(5)]],
    preis: [1, [Validators.required, Validators.min(0.01)]],
    rabatt: [''],
    datum: [''],
    homepage: [''],
    lieferbar: [true],

    kwJavascript: [false],
    kwTypescript: [false],
    kwJava: [false],
    kwPython: [false],
  });

  private keywords = computed(() => {
    const values: string[] = [];
    if (this.form.controls.kwJavascript.value) values.push('JAVASCRIPT');
    if (this.form.controls.kwTypescript.value) values.push('TYPESCRIPT');
    if (this.form.controls.kwJava.value) values.push('JAVA');
    if (this.form.controls.kwPython.value) values.push('PYTHON');
    return values;
  });

  constructor() {
    void this.load();
  }

  back() {
    const id = this.id();
    this.router.navigate(id ? ['/books', id] : ['/home']);
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
    this.id.set(id);

    try {
      const { book, etag } = await this.bookService.getBookByIdWithEtag(id);
      this.loadedBook.set(book);
      this.ifMatch.set(etag ?? (Number.isFinite(book.version) ? `"${book.version}"` : null));

      this.form.controls.titel.setValue(book.titel.titel ?? '');
      this.form.controls.untertitel.setValue(book.titel.untertitel ?? '');
      this.form.controls.isbn.setValue(book.isbn ?? '');
      this.form.controls.art.setValue(book.art ?? '');
      this.form.controls.rating.setValue(book.rating ?? 1);
      this.form.controls.preis.setValue(book.preis ?? 1);
      this.form.controls.rabatt.setValue(book.rabatt !== undefined ? String(book.rabatt) : '');
      this.form.controls.datum.setValue(book.datum ?? '');
      this.form.controls.homepage.setValue(book.homepage ?? '');
      this.form.controls.lieferbar.setValue(book.lieferbar ?? false);

      const keywords = new Set(book.schlagwoerter ?? []);
      this.form.controls.kwJavascript.setValue(keywords.has('JAVASCRIPT'));
      this.form.controls.kwTypescript.setValue(keywords.has('TYPESCRIPT'));
      this.form.controls.kwJava.setValue(keywords.has('JAVA'));
      this.form.controls.kwPython.setValue(keywords.has('PYTHON'));
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      this.error.set(status === 404 ? 'Buch nicht gefunden.' : 'Fehler beim Laden.');
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    if (this.saving()) return;

    // Rabatt optional, aber falls gesetzt: 0 < rabatt < 1
    const raw = this.form.getRawValue();
    if (raw.rabatt !== '') {
      const rabatt = Number(raw.rabatt);
      const validRabatt = Number.isFinite(rabatt) && rabatt > 0 && rabatt < 1;
      if (!validRabatt) {
        this.form.controls.rabatt.setErrors({ range: true });
        this.form.controls.rabatt.markAsTouched();
        return;
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.id();
    const ifMatch = this.ifMatch();
    if (id === null || !ifMatch) {
      this.snackBar.open('Fehlende Version (If-Match). Bitte neu laden.', 'OK', { duration: 4500 });
      return;
    }

    const payload: BookUpdateDto = {
      isbn: raw.isbn.trim(),
      rating: Number(raw.rating),
      art: raw.art ? raw.art : undefined,
      preis: Number(raw.preis),
      rabatt: raw.rabatt !== '' ? Number(raw.rabatt) : undefined,
      lieferbar: raw.lieferbar,
      datum: raw.datum ? raw.datum : undefined,
      homepage: raw.homepage ? raw.homepage.trim() : undefined,
      schlagwoerter: this.keywords().length > 0 ? this.keywords() : undefined,
      titel: {
        titel: raw.titel.trim(),
        untertitel: raw.untertitel ? raw.untertitel.trim() : undefined,
      },
    };

    this.saving.set(true);
    try {
      const { etag } = await this.bookService.updateBook(id, payload, ifMatch);
      if (etag) this.ifMatch.set(etag);
      this.snackBar.open('Gespeichert.', 'OK', { duration: 2500 });
      this.router.navigate(['/books', id]);
    } catch (e: any) {
      const status = typeof e?.status === 'number' ? e.status : undefined;
      const body = e?.error;
      const msg = typeof body === 'string' && body ? body : undefined;
      if (status === 428) {
        this.snackBar.open('If-Match fehlt (Precondition Required). Bitte neu laden.', 'OK', {
          duration: 6000,
        });
      } else if (status === 412) {
        this.snackBar.open('Version ist veraltet (Precondition Failed). Bitte neu laden.', 'OK', {
          duration: 6000,
        });
      } else {
        this.snackBar.open(
          status ? `Fehler ${status}${msg ? `: ${msg}` : ''}` : 'Fehler beim Speichern.',
          'OK',
          {
            duration: 6000,
          },
        );
      }
    } finally {
      this.saving.set(false);
    }
  }
}
