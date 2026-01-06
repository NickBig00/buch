import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BookCreateDto, BookService } from './book.service';

@Component({
  selector: 'app-book-create',
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
      <span>Neues Buch</span>
      <span class="spacer"></span>
      <button mat-button type="button" (click)="cancel()">Abbrechen</button>
    </mat-toolbar>

    <div class="page">
      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
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
              <input matInput formControlName="isbn" placeholder="978-0-007-00644-1" />
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
                  <mat-error>Preis muss > 0 sein.</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="row">
              <mat-form-field appearance="outline" class="col">
                <mat-label>Rabatt (0..1, optional)</mat-label>
                <input matInput type="number" min="0.01" max="0.99" step="0.01" formControlName="rabatt" />
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
              <input matInput type="url" formControlName="homepage" placeholder="https://example.com" />
            </mat-form-field>

            <mat-checkbox formControlName="lieferbar">Lieferbar</mat-checkbox>

            <div class="keywords" role="group" aria-label="Schlagwörter">
              <mat-checkbox formControlName="kwJavascript">JavaScript</mat-checkbox>
              <mat-checkbox formControlName="kwTypescript">TypeScript</mat-checkbox>
              <mat-checkbox formControlName="kwJava">Java</mat-checkbox>
              <mat-checkbox formControlName="kwPython">Python</mat-checkbox>
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="submitting()">
              Speichern
            </button>
          </form>
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

      .spacer { flex: 1; }

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

      .full { width: 100%; min-width: 0; }

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

      button[type='submit'] { width: 100%; }

      @media (min-width: 700px) {
        button[type='submit'] { width: auto; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private bookService = inject(BookService);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);

  form = this.fb.nonNullable.group({
    titel: ['', [Validators.required, Validators.maxLength(40)]],
    untertitel: ['', [Validators.maxLength(40)]],
    isbn: ['', [Validators.required]],
    art: [''],
    rating: [1, [Validators.required, Validators.min(0), Validators.max(5)]],
    // Backend-Validierung verlangt effektiv > 0 (DecimalMin istGreaterThan(0))
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

  cancel() {
    this.router.navigate(['/home']);
  }

  async submit() {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Rabatt ist optional, aber wenn gesetzt: 0 < rabatt < 1 (Backend: DecimalMin/DecimalMax)
    if (raw.rabatt !== '') {
      const rabatt = Number(raw.rabatt);
      const validRabatt = Number.isFinite(rabatt) && rabatt > 0 && rabatt < 1;
      if (!validRabatt) {
        this.form.controls.rabatt.setErrors({ range: true });
        this.form.controls.rabatt.markAsTouched();
        return;
      }
    }

    const payload: BookCreateDto = {
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

    this.submitting.set(true);
    try {
      const id = await this.bookService.createBook(payload);
      const msg = id ? `Buch angelegt (ID: ${id}).` : 'Buch angelegt.';
      this.snackBar.open(msg, 'OK', { duration: 2500 });
      this.router.navigate(['/home']);
    } catch (e: unknown) {
      const message = this.errorMessage(e);
      this.snackBar.open(message, 'OK', { duration: 6000 });
    } finally {
      this.submitting.set(false);
    }
  }

  private errorMessage(e: unknown): string {
    // HttpErrorResponse.error kann string oder Objekt sein.
    const anyError = e as any;
    const status = typeof anyError?.status === 'number' ? anyError.status : undefined;
    const errorBody = anyError?.error;

    if (typeof errorBody === 'string' && errorBody.trim() !== '') {
      return status ? `Fehler ${status}: ${errorBody}` : errorBody;
    }

    if (errorBody && typeof errorBody === 'object') {
      const msg = (errorBody.message ?? errorBody.error ?? errorBody.detail) as unknown;
      if (typeof msg === 'string' && msg.trim() !== '') {
        return status ? `Fehler ${status}: ${msg}` : msg;
      }
    }

    return status
      ? `Fehler ${status} beim Anlegen (Validierung/Token prüfen).`
      : 'Fehler beim Anlegen (Validierung/Token prüfen).';
  }
}
