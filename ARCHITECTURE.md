
# Student Management System — System Architecture

## 1. Frontend
- Technology: Next.js
- Purpose: User interface for login, dashboard, students and courses.
- Local URL: http://localhost:3000

2.Backend
- Technology: Spring Boot
- Purpose: REST APIs, business logic, request validation and database operations.
- Local URL: http://localhost:8080

3. Database
- Technology: Supabase PostgreSQL
- Purpose: Store users, student records and course information.

 4. Data Flow
1. Users interact with the Next.js frontend.
2. The frontend sends HTTP requests to Spring Boot REST APIs.
3. Spring Boot processes requests and communicates with PostgreSQL.
4. The backend returns responses to the frontend.

5. Security
- Spring Security is included in the backend.
- Authentication and authorization must be configured and tested.
- Database credentials must be stored securely and excluded from GitHub.
