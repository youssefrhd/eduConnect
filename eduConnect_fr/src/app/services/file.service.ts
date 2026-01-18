import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileItem } from '../components/files/files.component';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {


  private baseUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}


   uploadFiles(formData: FormData): Observable<FileItem[]> {
    return this.http.post<FileItem[]>(
      `${this.baseUrl}/upload`,
      formData
    );
  }
  getUserFiles(): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`${this.baseUrl}/my-files`);
  }


  deleteFiles(fileIds: number[]): Observable<string> {
    let params = new HttpParams();
    fileIds.forEach(id => {
      params = params.append('fileIds', id.toString());
    });

    return this.http.delete(`${this.baseUrl}/delete`, {
      params,
      responseType: 'text'
    });
  }

 
  renameFile(fileId: number, newName: string): Observable<FileItem> {
    const params = new HttpParams().set('newName', newName);

    return this.http.put<FileItem>(
      `${this.baseUrl}/rename/${fileId}`,
      null,
      { params }
    );
  }

  
  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/download/${fileId}`,
      { responseType: 'blob' }
    );
  }

}
