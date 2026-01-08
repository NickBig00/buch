# Frontend

## Design (Figma)

Von Figma kommt nichts automatisch ins Repo. Üblich ist:

- Link zum Figma-Board in der Doku/README
- optional: Export (PNG/PDF) unter `docs/` ablegen

## Zustandsdiagramm (PlantUML)

Das Zustandsdiagramm liegt unter `docs/zustandsdiagramm.puml` (im Repo-Root).

## Docker (Frontend als Container, HTTPS)

Das Frontend kann als Container gestartet werden und liefert die SPA über HTTPS auf `https://localhost:4200` aus.
Die HTTPS-Zertifikate werden im Container (self-signed) erzeugt.

Container starten (aus `frontend/`):

`docker compose -f compose.yml up --build`

Hinweis: PostgreSQL/Keycloak werden separat wie im Backend gestartet.

Wichtig: Starte das Frontend nur einmal.
Sonst kommt es zu `Bind for 0.0.0.0:4200 failed: port is already allocated`.
Zum Stoppen: `docker compose -f compose.yml down`.

Hinweis:

- `/rest` wird im Container per Nginx an `${API_TARGET}` weitergeleitet (Default: `https://host.docker.internal:3000`).
- Wenn dein Backend anders läuft, setze `API_TARGET` im `docker-compose.yml` entsprechend.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.3.

## Development server

To start a local development server, run:

```bash
pnpm start
```

HTTPS (lokal):

```bash
pnpm start:https
```

HTTP (lokal):

```bash
pnpm start:http
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
