import { Component, NgModule, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';
import { AuthService, User } from '../../services/auth.service';

export interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  status: 'active' | 'archived' | 'shared';
  icon: string;
  color: string;
  course: string;
  editable: boolean;
}

@Component({
  selector: 'app-files',
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  showUploadModal = false;
  viewMode: 'grid' | 'list' = 'list';
  searchTerm = '';
  filterType = 'all';
  selectedFiles: number[] = [];
  isDragging = false;
  loading = false;

  uploadFiles: File[] = [];
  uploadCourse = '';
  uploadVisibility = 'private';
  currentUser: User | null = null;
  files: FileItem[] = [];

  constructor(
    private fileService: FileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;
    });
    this.loadFilesFromBackend();
  }

  loadFilesFromBackend() {
    this.fileService.getUserFiles().subscribe({
      next: files => this.files = files,
      error: error => console.error('Error loading files:', error)
    });
  }

  get filteredFiles() {
    return this.files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            file.course.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.filterType === 'all' || file.type === this.filterType;
      return matchesSearch && matchesType;
    });
  }

  get totalSize(): string {
    const total = this.files.reduce((sum, file) => sum + parseFloat(file.size), 0)/1024;
    return total.toFixed(1) + ' MB';
  }

  get pdfCount(): number {
    return this.files.filter(f => f.type === 'PDF').length;
  }

  get sharedCount(): number {
    return this.files.filter(f => f.status === 'shared').length;
  }

  toggleSelect(fileId: number) {
    const idx = this.selectedFiles.indexOf(fileId);
    if (idx > -1) this.selectedFiles.splice(idx, 1);
    else this.selectedFiles.push(fileId);
  }

  selectAll() {
    this.selectedFiles = this.selectedFiles.length === this.filteredFiles.length
      ? []
      : this.filteredFiles.map(f => f.id);
  }

  deleteSelected() {
    if (!this.selectedFiles.length) return;
    if (!confirm(`Delete ${this.selectedFiles.length} selected files?`)) return;

    this.fileService.deleteFiles(this.selectedFiles).subscribe({
      next: () => {
        this.files = this.files.filter(f => !this.selectedFiles.includes(f.id));
        this.selectedFiles = [];
      },
      error: error => {
        console.error('Error deleting files:', error);
        alert('Failed to delete files');
      }
    });
  }

  downloadFile(file: FileItem) { console.log('Downloading', file.name); }
  shareFile(file: FileItem) { console.log('Sharing', file.name); }

  editFile(file: FileItem) {
    if (!file.editable) return;
    const newName = prompt('Enter new name:', file.name);
    if (!newName || newName === file.name) return;

    this.fileService.renameFile(file.id, newName).subscribe({
      next: updated => {
        const index = this.files.findIndex(f => f.id === file.id);
        if (index !== -1) this.files[index] = updated;
      },
      error: error => { console.error('Error updating file:', error); alert('Failed to update file'); }
    });
  }

  deleteFile(file: FileItem) {
    if (!confirm(`Delete "${file.name}"?`)) return;

    this.fileService.deleteFiles([file.id]).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== file.id);
        this.selectedFiles = this.selectedFiles.filter(id => id !== file.id);
      },
      error: error => { console.error('Error deleting file:', error); alert('Failed to delete file'); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'shared': return 'bg-blue-500/20 text-blue-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  triggerFileInput() {
    const input = document.querySelector<HTMLInputElement>('#fileInput');
    input?.click();
  }

  onFileInputChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.uploadFiles = [...this.uploadFiles, ...files];
  }

  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer?.files) return;
    this.uploadFiles = [...this.uploadFiles, ...Array.from(event.dataTransfer.files) as File[]];
  }

  removeUploadFile(index: number) { this.uploadFiles.splice(index, 1); }

  
  processUpload() {
    if (!this.uploadFiles.length) return;

    const formData = new FormData();
    this.uploadFiles.forEach(file => formData.append('files', file));
    formData.append('course', this.uploadCourse);
    formData.append('visibility', this.uploadVisibility);

    this.loading = true;

    this.fileService.uploadFiles(formData).subscribe({
      next: (uploadedFiles: FileItem[]) => {
        this.files = [...uploadedFiles, ...this.files];
        this.uploadFiles = [];
        this.uploadCourse = '';
        this.uploadVisibility = 'private';
        this.showUploadModal = false;
        this.loading = false;
        alert(`${uploadedFiles.length} files uploaded successfully!`);
      },
      error: error => {
        console.error('Error uploading files:', error);
        this.loading = false;
        alert('Failed to upload files');
      }
    });
  }

  getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['doc','docx'].includes(ext||'')) return 'DOCX';
    if (['ppt','pptx'].includes(ext||'')) return 'PPTX';
    if (['jpg','jpeg','png','gif'].includes(ext||'')) return 'IMAGE';
    if (['mp3','wav','m4a'].includes(ext||'')) return 'AUDIO';
    return ext?.toUpperCase() || 'FILE';
  }

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext==='pdf') return '';
    if (['doc','docx'].includes(ext||'')) return '';
    if (['ppt','pptx'].includes(ext||'')) return '';
    if (['jpg','jpeg','png','gif'].includes(ext||'')) return '';
    if (['mp3','wav','m4a'].includes(ext||'')) return '';
    if (['zip','rar'].includes(ext||'')) return '';
    return '';
  }

  getFileColor(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext==='pdf') return 'bg-red-500/20 text-red-400';
    if (['doc','docx'].includes(ext||'')) return 'bg-blue-500/20 text-blue-400';
    if (['ppt','pptx'].includes(ext||'')) return 'bg-orange-500/20 text-orange-400';
    if (['jpg','jpeg','png','gif'].includes(ext||'')) return 'bg-green-500/20 text-green-400';
    return 'bg-gray-500/20 text-gray-400';
  }
}
