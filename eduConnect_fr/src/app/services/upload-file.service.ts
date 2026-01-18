import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

private apiUrl = 'http://localhost:8080/api/chat/uploadFile';
  constructor(private http:HttpClient) { }

  uploadFiles(formData : FormData):Observable<String> {

    return this.http.post(this.apiUrl,formData, {responseType:'text'});
  }
}
