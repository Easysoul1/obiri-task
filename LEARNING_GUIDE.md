# HR System — Complete Learning Guide

## 1. What is NestJS?

**Beginner:** NestJS is a backend framework for building server-side applications with TypeScript. Think of it as the "Angular for the backend" — it uses the same patterns (modules, controllers, services, dependency injection).

**Intermediate:** NestJS wraps Express (or Fastify) under the hood and adds a structured, opinionated architecture. It uses decorators (`@Controller`, `@Get`, `@Injectable`) to define routes and services, similar to how Angular uses decorators for components.

**Real-world:** Large-scale enterprise APIs need consistency. NestJS enforces a module-based structure where every feature (Departments, Employees) gets its own module with a controller (routing) and service (business logic). This makes teams productive and codebases maintainable.

**Project-specific:** Our HR backend has three modules — `DepartmentModule`, `EmployeeModule`, `LeaveRequestModule`. Each module bundles its controller, service, entity, and DTOs. The root `AppModule` configures TypeORM and imports all feature modules.

---

## 2. Why NestJS was Selected

NestJS was chosen over Express because:

1. **Structure** — Express gives you a blank file. NestJS gives you modules, controllers, services. No debates about folder structure.
2. **TypeScript-first** — Built from the ground up with TypeScript. Express is JavaScript-first with TypeScript bolted on.
3. **Dependency Injection** — Built-in DI container makes services testable and decoupled.
4. **Decorators** — Route params, validation, auth — all declarative with `@Param()`, `@Body()`, `@UseGuards()`.
5. **Ecosystem** — `@nestjs/typeorm` integrates TypeORM seamlessly. `@nestjs/testing` provides first-class test utilities.

---

## 3. What is Angular

**Beginner:** Angular is a frontend framework for building single-page applications (SPAs). It lets you create reusable UI components and connect them to backend APIs.

**Intermediate:** Angular is a complete framework — not a library. It includes routing, forms (template-driven and reactive), HTTP client, dependency injection, and a CLI. Angular apps are built with components, services, modules, and templates.

**Real-world:** Enterprise dashboards, admin panels, and internal tools are typically built with Angular because it provides structure, type safety, and long-term maintainability.

**Project-specific:** Our HR frontend uses Angular 19 with standalone components (no NgModules). The app has components for listing/creating/editing Departments, Employees, and Leave Requests. Data flows from the NestJS API through Angular services into reactive forms.

---

## 4. Why Angular was Selected

Angular was chosen because:

1. **Reactive Forms** — Complex form validation (required, minLength, email, custom validators) is built-in. Perfect for HR data entry.
2. **TypeScript** — End-to-end type safety from database entities to Angular templates.
3. **HttpClient** — Typed HTTP services with RxJS observables for API calls.
4. **Router** — Declarative routing with lazy loading, guards, and nested routes.
5. **CLI** — `ng generate component`, `ng build`, `ng serve` — standardized tooling.

---

## 5. Why SQLite is Used for Development (and PostgreSQL for Production)

**SQLite** is used for local development because:

1. **Zero setup** — No server, no Docker, no configuration. Just a file on disk (`obiri.db`) created automatically by TypeORM.
2. **Fast iteration** — Start coding immediately without waiting for database containers.
3. **Portable** — The entire database is a single file. Delete it to reset; copy it to share state.
4. **TypeORM compatible** — All features used by this project (UUIDs, enums, relations, `synchronize`) work seamlessly with SQLite.

**PostgreSQL** remains the production choice because:

1. **ACID compliance** — Leave request approvals must be transactional. PostgreSQL guarantees data integrity at scale.
2. **Concurrent access** — Handles hundreds of simultaneous connections efficiently (SQLite is single-writer).
3. **Enum support** — Native `ENUM` types for `LeaveStatus` and `ApprovalAction`.
4. **JSON support** — Future-proof for storing flexible metadata (approval comments, audit trails).
5. **Maturity** — Industry-standard RDBMS with strong TypeORM support.

**Switching between them** is trivial with TypeORM — change the `type` in `app.module.ts` and the corresponding connection options.

---

## 6. What TypeORM Does

**Beginner:** TypeORM is an ORM (Object-Relational Mapper) that lets you work with databases using TypeScript classes instead of SQL queries. You define entities (classes) and TypeORM translates them to database tables. It supports multiple database engines — with SQLite for development and PostgreSQL for production.

**Intermediate:** TypeORM maps TypeScript classes to database tables via decorators: `@Entity()`, `@Column()`, `@ManyToOne()`, `@OneToMany()`. It handles schema synchronization, query building, migrations, and relation loading.

**Real-world:** Instead of writing `INSERT INTO departments (name) VALUES ('Engineering')`, you write `departmentRepository.save(department)`. TypeORM generates the SQL, manages connections, and caches queries.

**Project-specific:** Our `Department` entity with `@OneToMany(() => Employee)` maps to the `departments` table. TypeORM's `synchronize: true` in development auto-creates tables from entities. With SQLite, the database is a single file (`obiri.db`) — the connection has no `host`, `port`, or `credentials` since there's no server.

---

## 7. What Controllers Do

**Beginner:** Controllers handle incoming HTTP requests and return responses. They define routes (`GET /api/departments`) and delegate work to services.

**Intermediate:** A controller is a TypeScript class decorated with `@Controller('api/departments')`. Each method corresponds to an HTTP endpoint: `@Get()`, `@Post()`, `@Put()`, `@Delete()`. Controllers extract request data (params, body, query) and return response objects.

**Real-world:** The controller is the thin "traffic cop" — it validates the request format, calls the service, and returns the response. It should never contain business logic.

**Project-specific:** `DepartmentController` has 5 methods mapping to the 5 REST endpoints. It uses `@Param('id', ParseUUIDPipe)` for UUID validation and `@Body()` for DTO validation. The controller injects `DepartmentService` via the constructor.

---

## 8. What Services Do

**Beginner:** Services contain business logic. They talk to the database (via repositories) and implement the application's rules.

**Intermediate:** Services are `@Injectable()` classes with methods that orchestrate business operations. They use constructor-injected repositories to query/update data. Services are used by controllers and by other services.

**Real-world:** `LeaveRequestService.approve()` checks the request is pending, validates the approver isn't the requester, updates the status, creates an approval record, and saves both — all in one transactional unit.

**Project-specific:** `EmployeeService.create()` checks for duplicate emails, validates the department exists, creates the employee, and returns it. If any check fails, it throws an exception.

---

## 9. What DTOs Do

**Beginner:** DTOs (Data Transfer Objects) define the shape of data coming into your API. They're like TypeScript interfaces with validation rules.

**Intermediate:** DTOs are classes with `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@MinLength(10)`). NestJS's `ValidationPipe` automatically validates incoming request bodies against the DTO before they reach the controller.

**Real-world:** Without DTOs, a user could send `{ name: "", salary: -100, email: "not-an-email" }` to your API. DTOs catch these at the boundary.

**Project-specific:** `CreateLeaveRequestDto` requires `employeeId` (UUID), `startDate`/`endDate` (ISO date strings), and `reason` (10-1000 characters). The `ValidationPipe` rejects invalid payloads with a 400 error before the service is called.

---

## 10. What Entities Do

**Beginner:** Entities are TypeScript classes that map to database tables. Each property is a column in the table.

**Intermediate:** Entities use TypeORM decorators: `@PrimaryGeneratedColumn('uuid')` for IDs, `@Column()` for fields, `@ManyToOne()` for foreign keys. TypeORM syncs entities to database schema when `synchronize: true`.

**Real-world:** The `Employee` entity maps to the `employees` table. Its `@ManyToOne(() => Department)` creates a `department_id` foreign key. The `@JoinColumn()` decorator specifies the column name.

**Project-specific:** `LeaveRequest` entity has a `status` column of type `enum` with values `pending | approved | rejected`. The `approval` property is `@OneToOne(() => Approval)` — one leave request has exactly one approval record.

---

## 11. What Dependency Injection is

**Beginner:** Dependency Injection (DI) is a pattern where a class receives its dependencies (services, repositories) from outside rather than creating them itself. Instead of `new Service()`, you list what you need and the framework provides it.

**Intermediate:** In NestJS, you declare a service as `@Injectable()` and add it to the module's `providers`. When a controller's constructor requests `DepartmentService`, NestJS creates one instance and injects it. This makes testing easy — you can inject a mock service.

**Real-world:** DI decouples classes. `DepartmentController` doesn't create a `DepartmentService` — it just says "I need one" via the constructor. In tests, you provide a mock service with predefined behavior.

**Project-specific:** All our services use constructor injection: `constructor(@InjectRepository(Department) private repo: Repository<Department>)`. TypeORM's `@InjectRepository()` decorator tells NestJS to inject the TypeORM repository for that entity.

---

## 12. What Validation is

**Beginner:** Validation checks that data meets requirements before processing. Required fields, email format, minimum length — these are validation rules.

**Intermediate:** Validation in NestJS uses `class-validator` decorators on DTOs (`@IsEmail()`, `@MinLength(2)`) and a global `ValidationPipe` that automatically validates all incoming requests. Invalid requests return a 400 response with details.

**Real-world:** Before saving an employee, we validate: name is 2-50 chars, email is valid format, position is optional but max 100 chars, salary must be >= 0. The ValidationPipe handles this at the API boundary, so the service never receives bad data.

**Project-specific:** `CreateEmployeeDto` has `@IsEmail()` on email, `@IsNumber() @Min(0)` on salary, `@IsOptional()` on phone. The `ValidationPipe` in `main.ts` has `whitelist: true` (strips unknown properties) and `forbidNonWhitelisted: true` (rejects unknown properties with error).

---

## 13. What Routing is

**Beginner:** Routing maps URLs to components (frontend) or controller methods (backend). When you visit `/employees`, the router shows the employee list component.

**Intermediate:** Angular Router uses `Routes` array with `path` and `component` pairs. Route params (`:id`) are extracted with `ActivatedRoute`. The `<router-outlet>` renders the matched component.

**Real-world:** `{ path: 'departments/:id/edit', component: DepartmentFormComponent }` — Angular matches this URL, extracts the `id` param, and renders the form component with the department's data pre-filled.

**Project-specific:** Our frontend routes: `/departments` lists all departments, `/departments/new` shows the create form, `/departments/:id/edit` shows the edit form. The `DepartmentFormComponent` checks if `id` exists to decide between create/edit mode.

---

## 14. What Reactive Forms are

**Beginner:** Reactive Forms are Angular's approach to building forms with TypeScript code instead of template directives. You define the form structure in the component class and bind it to the HTML template.

**Intermediate:** `FormBuilder` creates `FormGroup` and `FormControl` objects. Each control has validators (`Validators.required`, `Validators.email`). The template uses `[formGroup]="form"` and `formControlName="email"` to bind to HTML. The form state (`valid`, `touched`, `errors`) is automatically tracked.

**Real-world:** Reactive Forms give you full control over validation, dynamic form fields, and cross-field validation (e.g., end date must be after start date). They're more testable than template-driven forms.

**Project-specific:** `DepartmentFormComponent` uses `this.fb.group({ name: ['', [Validators.required, Validators.minLength(2)]], description: [''] })`. The submit button is disabled when `departmentForm.invalid`. Validation errors display below each input field.

---

## 15. What REST APIs are

**Beginner:** REST (Representational State Transfer) is a style of building APIs where each resource (Department, Employee) has a URL and standard HTTP methods.

**Intermediate:** REST uses:
- `POST` to create resources
- `GET` to read resources
- `PUT` or `PATCH` to update resources
- `DELETE` to delete resources

Each endpoint returns JSON with appropriate HTTP status codes (201 for created, 200 for success, 204 for deleted, 400 for validation error, 404 for not found).

**Real-world:** `POST /api/employees` with body `{ firstName: "Alice", lastName: "Johnson", email: "alice@obiri.com" }` creates an employee and returns `201 Created` with the employee object.

**Project-specific:** Our API has 16 endpoints following REST conventions. `PUT /api/leave-requests/:id/approve` is a non-standard but pragmatic endpoint — it updates a leave request's status. The response includes the updated leave request with the approval details.

---

## 16. What Business Workflows are

**Beginner:** A business workflow is a sequence of steps to accomplish a task. In our HR system, the "Leave Approval Workflow" is: Employee submits leave → Manager reviews → Manager approves or rejects → Employee sees status.

**Intermediate:** Business workflows encode real-world rules in code:
1. Employee submits leave request with dates and reason
2. System validates: no past dates, no overlap with existing leave, end after start
3. Manager reviews pending requests
4. System validates: approver is not the requester, request is still pending
5. On approve: status changes to "approved", approval record created with timestamp
6. On reject: status changes to "rejected", rejection reason recorded
7. Employee checks status at any time

**Real-world:** These rules prevent employees from approving their own leave, prevent double-booking, and create an audit trail. Every approval/rejection is permanently recorded with who did it and when.

**Project-specific:** The `processApproval` method in `LeaveRequestService` implements the workflow. It checks status is PENDING, validates approver is different from requester, creates an Approval entity with action/comment/timestamp, and updates the LeaveRequest status. The service methods `approve()` and `reject()` delegate to this common method.

---

## Database Normalization Explanation

Our database is in **Third Normal Form (3NF)**:

- **1NF**: Each column contains atomic values (no arrays, no JSON objects). Each row is unique (UUID primary key).
- **2NF**: Every non-key column depends on the entire primary key. All tables have single-column UUID primary keys.
- **3NF**: No transitive dependencies. Employee's `departmentId` is a FK to Department — Employee doesn't store department name directly.

**Why 3NF?** Prevents data anomalies. If a department name changes, only one row in `departments` needs updating — not every employee record.

## Index Recommendations

```sql
CREATE INDEX idx_employee_department ON employees(department_id);
CREATE INDEX idx_leave_request_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_request_status ON leave_requests(status);
CREATE INDEX idx_approval_leave_request ON approvals(leave_request_id);
CREATE INDEX idx_approval_approver ON approvals(approver_id);
```

These indexes speed up the most common queries: finding employees by department, finding leave requests by employee or status, and finding approvals by leave request or approver. SQLite and PostgreSQL both support these standard index statements, so the same SQL works for both.
