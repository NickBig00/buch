import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { BookService, BookPage } from './books/book.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

type SearchMode =
  | 'all'
  | 'titel'
  | 'isbn'
  | 'art'
  | 'rating'
  | 'preis'
  | 'lieferbar'
  | 'datum'
  | 'homepage'
  | 'keywords';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  template: `
    <mat-toolbar>
      <span>Buchverwaltung</span>
      <span class="spacer"></span>
      <button mat-button type="button" (click)="goCreate()">Neu</button>
      <button mat-button type="button" (click)="goHome()">Home</button>
      <button mat-button type="button" (click)="logout()">Logout</button>
    </mat-toolbar>

    <div class="page">
      <mat-card>
        <mat-card-content>
          <form (submit)="onSearch($event)" class="search-form" role="search">
            <mat-form-field appearance="outline" class="filter">
              <mat-label>Suchfilter</mat-label>
              <mat-select
                name="filter"
                [value]="mode()"
                (selectionChange)="mode.set($event.value)"
                aria-label="Filter"
              >
                @for (f of filters; track f.value) { <mat-option [value]="f.value">{{ f.label }}</mat-option> }
              </mat-select>
            </mat-form-field>

            @switch (mode()) {
              @case ('all') {
                <span class="hint">Alle Bücher (seiteweise)</span>
              }
              @case ('titel') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>Titel (enthält)</mat-label>
                  <input
                    matInput
                    name="titel"
                    [value]="textValue()"
                    (input)="textValue.set($any($event.target).value)"
                  />
                </mat-form-field>
              }
              @case ('isbn') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>ISBN (exakt)</mat-label>
                  <input
                    matInput
                    name="isbn"
                    [value]="textValue()"
                    (input)="textValue.set($any($event.target).value)"
                  />
                </mat-form-field>
              }
              @case ('homepage') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>Homepage (exakt)</mat-label>
                  <input
                    matInput
                    name="homepage"
                    [value]="textValue()"
                    (input)="textValue.set($any($event.target).value)"
                  />
                </mat-form-field>
              }
              @case ('art') {
                <div class="term" role="group" aria-label="Buchart">
                  <div class="radio-label">Buchart</div>
                  <mat-radio-group
                    name="art"
                    [value]="artValue()"
                    (change)="artValue.set($event.value)"
                    class="radio-group"
                  >
                    <mat-radio-button value="">egal</mat-radio-button>
                    <mat-radio-button value="EPUB">EPUB</mat-radio-button>
                    <mat-radio-button value="HARDCOVER">HARDCOVER</mat-radio-button>
                    <mat-radio-button value="PAPERBACK">PAPERBACK</mat-radio-button>
                  </mat-radio-group>
                </div>
              }
              @case ('rating') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>Mindest-Rating (>=)</mat-label>
                  <input
                    matInput
                    type="number"
                    min="1"
                    max="5"
                    name="rating"
                    [value]="numberValue() ?? ''"
                    (input)="numberValue.set($any($event.target).valueAsNumber)"
                  />
                </mat-form-field>
              }
              @case ('preis') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>Max-Preis (<=)</mat-label>
                  <input
                    matInput
                    type="number"
                    min="0"
                    step="0.01"
                    name="preis"
                    [value]="numberValue() ?? ''"
                    (input)="numberValue.set($any($event.target).valueAsNumber)"
                  />
                </mat-form-field>
              }
              @case ('lieferbar') {
                <div class="term" role="group" aria-label="Lieferbar">
                  <div class="radio-label">Lieferbar</div>
                  <mat-radio-group
                    name="lieferbar"
                    [value]="lieferbarValue()"
                    (change)="lieferbarValue.set($event.value)"
                    class="radio-group"
                  >
                    <mat-radio-button [value]="true">Ja</mat-radio-button>
                    <mat-radio-button [value]="false">Nein</mat-radio-button>
                  </mat-radio-group>
                </div>
              }
              @case ('datum') {
                <mat-form-field appearance="outline" class="term">
                  <mat-label>Datum ab (>=)</mat-label>
                  <input
                    matInput
                    type="date"
                    name="datum"
                    [value]="dateValue()"
                    (input)="dateValue.set($any($event.target).value)"
                  />
                </mat-form-field>
              }
              @case ('keywords') {
                <div class="keywords" role="group" aria-label="Schlagwörter">
                  <mat-checkbox [checked]="kwJavascript()" (change)="kwJavascript.set($event.checked)">
                    JavaScript
                  </mat-checkbox>
                  <mat-checkbox [checked]="kwTypescript()" (change)="kwTypescript.set($event.checked)">
                    TypeScript
                  </mat-checkbox>
                  <mat-checkbox [checked]="kwJava()" (change)="kwJava.set($event.checked)">
                    Java
                  </mat-checkbox>
                  <mat-checkbox [checked]="kwPython()" (change)="kwPython.set($event.checked)">
                    Python
                  </mat-checkbox>
                </div>
              }
            }

            <button mat-raised-button color="primary" type="submit">Suchen</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <p class="count">Treffer: {{ pageInfo().page.totalElements }}</p>
          @if (books().length > 0) {
            <div class="table-scroll" aria-label="Suchergebnisse">
              <table mat-table [dataSource]="books()" class="book-table">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let book">{{ book.id }}</td>
                </ng-container>

                <ng-container matColumnDef="titel">
                  <th mat-header-cell *matHeaderCellDef>Titel</th>
                  <td mat-cell *matCellDef="let book">
                    {{ book.titel.titel }}
                    @if (book.titel.untertitel) { – {{ book.titel.untertitel }} }
                  </td>
                </ng-container>

                <ng-container matColumnDef="isbn">
                  <th mat-header-cell *matHeaderCellDef>ISBN</th>
                  <td mat-cell *matCellDef="let book">{{ book.isbn }}</td>
                </ng-container>

                <ng-container matColumnDef="art">
                  <th mat-header-cell *matHeaderCellDef>Art</th>
                  <td mat-cell *matCellDef="let book">{{ book.art ?? '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="rating">
                  <th mat-header-cell *matHeaderCellDef>Rating</th>
                  <td mat-cell *matCellDef="let book">{{ book.rating }}</td>
                </ng-container>

                <ng-container matColumnDef="preis">
                  <th mat-header-cell *matHeaderCellDef>Preis</th>
                  <td mat-cell *matCellDef="let book">{{ book.preis }}</td>
                </ng-container>

                <ng-container matColumnDef="rabatt">
                  <th mat-header-cell *matHeaderCellDef>Rabatt</th>
                  <td mat-cell *matCellDef="let book">{{ book.rabatt ?? '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="lieferbar">
                  <th mat-header-cell *matHeaderCellDef>Lieferbar</th>
                  <td mat-cell *matCellDef="let book">
                    @if (book.lieferbar === true) { ja } @else if (book.lieferbar === false) { nein } @else { - }
                  </td>
                </ng-container>

                <ng-container matColumnDef="datum">
                  <th mat-header-cell *matHeaderCellDef>Datum</th>
                  <td mat-cell *matCellDef="let book">{{ book.datum ?? '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="homepage">
                  <th mat-header-cell *matHeaderCellDef>Homepage</th>
                  <td mat-cell *matCellDef="let book">{{ book.homepage ?? '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="schlagwoerter">
                  <th mat-header-cell *matHeaderCellDef>Schlagwörter</th>
                  <td mat-cell *matCellDef="let book">
                    {{ (book.schlagwoerter?.length ?? 0) > 0 ? book.schlagwoerter?.join(', ') : '-' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                  class="row-link"
                  tabindex="0"
                  (click)="openDetails(row.id)"
                  (keydown.enter)="openDetails(row.id)"
                  (keydown.space)="openDetails(row.id)"
                ></tr>
              </table>
            </div>

            <mat-paginator
              [length]="pageInfo().page.totalElements"
              [pageIndex]="pageIndex()"
              [pageSize]="pageSize()"
              [pageSizeOptions]="pageSizeOptions"
              (page)="onPage($event)"
              aria-label="Seitennavigation"
            />
          } @else {
            <p class="empty">Keine Bücher gefunden.</p>
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

      .spacer { flex: 1; }

      /* Mobile: Buttons dürfen in eine zweite Zeile umbrechen */
      @media (max-width: 480px) {
        .spacer {
          flex: 1 1 100%;
          height: 0;
        }
      }

      .page {
        padding: 16px;
        display: grid;
        gap: 16px;
        overflow-x: hidden;
        grid-template-columns: minmax(0, 1fr);
      }

      /* Grid-Items dürfen nicht den Viewport verbreitern (wichtig bei breiten Tabellen) */
      .page > * {
        min-width: 0;
      }

      .search-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: stretch;
        min-width: 0;
      }

      /* Wichtig für Mobile: Flex-Items dürfen schrumpfen, sonst entsteht Horizontal-Scroll */
      .search-form > * {
        min-width: 0;
      }

      /* mobile-first: alles untereinander und volle Breite */
      .term {
        width: 100%;
        min-width: 0;
        flex: 1 1 100%;
      }
      .filter {
        width: 100%;
        min-width: 0;
        flex: 1 1 100%;
      }

      button[type="submit"] {
        width: 100%;
        min-width: 0;
        flex: 1 1 100%;
      }

      /* ab Tablet: Felder nebeneinander */
      @media (min-width: 700px) {
        .term { flex: 2; width: auto; min-width: 280px; }
        .filter { flex: 1; width: auto; min-width: 240px; }
        button[type="submit"] { width: auto; }
      }

      .keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .radio-group {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .radio-label {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 4px;
      }

      .hint { opacity: 0.8; }

      .table-scroll {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      /* Mobile-first: Tabelle darf breiter als Viewport sein, dann horizontal scrollen */
      .book-table {
        width: 100%;
        min-width: 1100px;
      }

      :host ::ng-deep .mat-mdc-header-cell,
      :host ::ng-deep .mat-mdc-cell {
        white-space: nowrap;
      }

      .row-link {
        cursor: pointer;
      }
      .empty { margin: 0; }
      .count { margin: 0 0 8px; opacity: 0.8; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private auth = inject(AuthService) as AuthService;
  private router = inject(Router);
  private bookService = inject(BookService) as BookService;

  mode = signal<SearchMode>('titel');
  filters: ReadonlyArray<{ value: SearchMode; label: string }> = [
    { value: 'titel', label: 'Titel (enthält)' },
    { value: 'isbn', label: 'ISBN (exakt)' },
    { value: 'art', label: 'Buchart' },
    { value: 'rating', label: 'Mindest-Rating (>=)' },
    { value: 'preis', label: 'Max-Preis (<=)' },
    { value: 'lieferbar', label: 'Lieferbar' },
    { value: 'datum', label: 'Datum ab (>=)' },
    { value: 'homepage', label: 'Homepage (exakt)' },
    { value: 'keywords', label: 'Schlagwörter' },
    { value: 'all', label: 'Alle Bücher' },
  ];

  textValue = signal('');
  numberValue = signal<number | null>(null);
  dateValue = signal('');
  lieferbarValue = signal<boolean>(true);
  artValue = signal<'EPUB' | 'HARDCOVER' | 'PAPERBACK' | ''>('');

  kwJavascript = signal(false);
  kwTypescript = signal(false);
  kwJava = signal(false);
  kwPython = signal(false);

  private pageSignal = signal<BookPage>({
    content: [],
    page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
  });
  pageInfo = computed(() => this.pageSignal());
  books = computed(() => this.pageSignal().content);

  pageIndex = signal(0);
  pageSize = signal(10);
  pageSizeOptions: ReadonlyArray<number> = [5, 10, 20, 50];

  private lastSearch: Record<string, string | number | boolean | undefined> = {};

  displayedColumns: ReadonlyArray<string> = [
    'id',
    'titel',
    'isbn',
    'art',
    'rating',
    'preis',
    'rabatt',
    'lieferbar',
    'datum',
    'homepage',
    'schlagwoerter',
  ];

  goHome() {
    this.router.navigate(['/home']);
  }

  goCreate() {
    this.router.navigate(['/books/new']);
  }

  openDetails(id: number) {
    this.router.navigate(['/books', id]);
  }

  logout() {
    void this.auth.logout();
  }

  async onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    await this.loadPage();
  }

  private async loadPage() {
    const result = await this.bookService.searchBooks(this.lastSearch, this.pageIndex(), this.pageSize());
    this.pageSignal.set(result);
    this.pageIndex.set(result.page.number);
    this.pageSize.set(result.page.size);
  }

  async onSearch(event: Event) {
    event.preventDefault();

    const mode = this.mode();
    const search: Record<string, string | number | boolean | undefined> = {};

    switch (mode) {
      case 'all':
        break;
      case 'titel':
        search['titel'] = this.textValue().trim();
        break;
      case 'isbn':
        search['isbn'] = this.textValue().trim();
        break;
      case 'homepage':
        search['homepage'] = this.textValue().trim();
        break;
      case 'art':
        search['art'] = this.artValue() || undefined;
        break;
      case 'rating':
        search['rating'] = this.numberValue() ?? undefined;
        break;
      case 'preis':
        search['preis'] = this.numberValue() ?? undefined;
        break;
      case 'lieferbar':
        search['lieferbar'] = this.lieferbarValue();
        break;
      case 'datum':
        search['datum'] = this.dateValue();
        break;
      case 'keywords':
        if (this.kwJavascript()) search['javascript'] = true;
        if (this.kwTypescript()) search['typescript'] = true;
        if (this.kwJava()) search['java'] = true;
        if (this.kwPython()) search['python'] = true;
        break;
    }

    this.lastSearch = search;
    this.pageIndex.set(0);
    await this.loadPage();
  }
}
