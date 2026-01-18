import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:8080/api/chat/chatWithFiles';
  constructor(private http:HttpClient) { }

   sendMessage( files: File[] = [],question: string,user_id:string): Observable<string> {
    const formData = new FormData();
  
    
    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    formData.append('question', question);
    formData.append('user_id',user_id);
    return this.http.post(`${this.apiUrl}`, formData, { 
      responseType: 'text' 
    });
  }
}
