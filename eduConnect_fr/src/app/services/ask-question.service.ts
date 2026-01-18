import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AskQuestionService {

  private apiUrl = 'http://localhost:8080/api/chat';
  constructor(private http:HttpClient) { }

  askQuestion(question: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/ask_question`, 
      { question }, 
      { responseType: 'text' }
    );
  }
}
