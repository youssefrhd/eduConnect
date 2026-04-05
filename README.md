# 🚀 AI-Powered Document Assistant

![Java](https://img.shields.io/badge/Java-17-orange)  
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)  
![Angular](https://img.shields.io/badge/Angular-19-red)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)  

---

## 📌 Overview

Full-stack AI-powered web application that enables users to upload documents and interact with them using an intelligent chatbot.

The system integrates **TinyLLaMA via Ollama** to deliver context-aware answers and document understanding in real time.

---

## ✨ Features

- 📄 Document upload and management  
- 🤖 AI-powered chat with documents  
- 🔐 JWT-based authentication (Spring Security)  
- 📡 RESTful API with Swagger documentation  
- ⚡ Optimized backend performance  
- 📱 Responsive UI (Angular + Tailwind CSS)  
- 🧠 Context-aware Q&A system  

---

## 🛠️ Tech Stack

### 🔙 Backend
- Java 17  
- Spring Boot  
- Spring Security + JWT  
- Spring Data JPA  
- PostgreSQL  
- Swagger (OpenAPI)  

### 🎨 Frontend
- Angular  
- TypeScript  
- Tailwind CSS  

### 🤖 AI Integration
- Ollama  
- TinyLLaMA  

---

## 🏗️ Architecture

Follows **MVC architecture**:

- Controller → API endpoints  
- Service → Business logic + AI integration  
- Repository → Database layer (JPA)  
- Security → JWT authentication  

### 🔄 AI Flow

1. Upload document  
2. Store in database  
3. User sends question  
4. Backend sends context to TinyLLaMA (Ollama)  
5. AI returns response  
6. Response displayed in UI  

---

## ⚙️ Installation & Setup

---

## 📌 Prerequisites

Make sure you have installed:

- Java 17+  
- Node.js (v18+ recommended)  
- Angular CLI  

```bash
npm install -g @angular/cli
```

- PostgreSQL  
- Maven  
- Ollama  

---

## 🤖 Ollama Setup (IMPORTANT)

Install Ollama and run TinyLLaMA:

```bash
ollama run tinyllama
```

👉 This must be running before starting the backend.

---

## 🗄️ Database Setup (PostgreSQL)

1. Create a database:

```sql
CREATE DATABASE ai_assistant;
```

2. Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ai_assistant
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 🔙 Backend Setup

```bash
git clone https://github.com/youssefrhd/eduConnect.git
cd eduConnect_back
mvn clean install
mvn spring-boot:run
```

Backend runs on:  
http://localhost:8080  

---

## 🎨 Frontend Setup

```bash
cd eduConnect_fr
npm install
ng serve
```

Frontend runs on:  
http://localhost:4200  

---

## 🔗 Frontend Configuration

Update Angular environment:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 🔐 Authentication

- JWT-based authentication  
- Secure API endpoints  
- Token stored on client-side    

---

## 📡 API Documentation

Swagger UI available at:

http://localhost:8080/swagger-ui.html  

---

## 📂 Project Structure

```bash
backend/
 ├── AuthFilter/
 ├── Config/
 ├── controller/
 ├── service/
 ├── repositories/
 ├── DTO/
 ├── Exceptions/
 └── model/

frontend/
 ├── src/app ├── components
             ├── services
             ├── interceptors 

```

---

## 🚀 Running the Full Application

Start everything in this order:

```bash
# 1. Start Ollama
ollama run tinyllama

# 2. Start Backend
cd backend
mvn spring-boot:run

# 3. Start Frontend
cd frontend
ng serve
```

Then open:  
http://localhost:4200  

---

## 🚀 Future Improvements

- 🔄 WebSocket real-time chat  
- 🧠 Improved AI context handling  
- 📂 Multi-document support  
- ☁️ Docker deployment  
- 🔐 Advanced role management  


---

## 👨‍💻 Author

**Youssef El Rhadir**  
📧 elrhadiry1@gmail.com  
🔗 https://github.com/youssefrhd  
