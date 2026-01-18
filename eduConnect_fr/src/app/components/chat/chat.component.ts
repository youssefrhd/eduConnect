import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadFileService } from '../../services/upload-file.service';
import { ChatService } from '../../services/chat.service';
import { AskQuestionService } from '../../services/ask-question.service';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: {
    name: string;
    size: string;
  }[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  currentUser: User | null = null;
  showUserDropdown = false;
  showSidebar = false;
  isMobile = false;

  messages: Message[] = [];
  inputMessage: string = '';
  isTyping: boolean = false;
  showFilePreview: boolean = false;
  selectedFiles: File[] = [];
  filePreviews: File[] = [];
  Answer: string = '';
  recentChats: string[] = ['Today\'s session', 'Project discussion', 'Code optimization'];
  suggestedPrompts: string[] = [
    'CAPABILITIES',
    'FEATURES',
    'GET STARTED'
  ];

  dropdownItems = [
    { icon: 'settings', label: 'Settings', route: '/settings' },
    { icon: 'user', label: 'Profile', route: '/profile' },
    { icon: 'folder', label: 'File Manager', route: '/file-manager' },
    { icon: 'logout', label: 'Logout', action: 'logout' }
  ];

  constructor(
    private uploadServ: UploadFileService,
    private chatServ: ChatService,
    private askQuestion: AskQuestionService,
    private authService: AuthService,
    private router :Router
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.currentUser = user;
    });
    this.messages.push({
      id: 1,
      type: 'assistant',
      content: 'Hi! How can I assist you today?',
      timestamp: new Date()
    });
    this.checkScreenSize();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }

  handleDropdownAction(item: any): void {
    this.closeUserDropdown();
    if (item.action === 'logout') {
      this.authService.logout();
    } else if (item.route) {
      this.router.navigate([item.route])
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownElement = document.querySelector('.user-dropdown-container');
    if (dropdownElement && !dropdownElement.contains(target)) {
      this.closeUserDropdown();
    }
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    if (this.selectedFiles.length == 0) return;
    for (let file of this.selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 10MB limit`);
        continue;
      }
      this.filePreviews.push(file);
    }
    this.showFilePreview = this.filePreviews.length > 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  clearPreviews(): void {
    this.selectedFiles = [];
    this.filePreviews = [];
    this.showFilePreview = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeFile(index: number): void {
    this.filePreviews = this.filePreviews.filter((_, i) => i !== index);
    this.showFilePreview = this.filePreviews.length > 0;
  }

  triggerFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  sendMessage(): void {
    if (!this.inputMessage.trim() && this.filePreviews.length == 0) return;
    const userMessage: Message = {
      id: this.messages.length + 1,
      type: 'user',
      content: this.inputMessage || 'Sent a file',
      timestamp: new Date(),
      files: []
    };
    if (this.filePreviews.length > 0) {
      if (!userMessage.files) userMessage.files = [];
      for (let file of this.filePreviews) {
        userMessage.files.push({
          name: file.name,
          size: this.formatFileSize(file.size)
        });
      }
    }
    this.messages.push(userMessage);
    this.isTyping = true;
    if (this.inputMessage.trim() && this.filePreviews.length > 0) {
      this.chatServ.sendMessage(this.filePreviews, this.inputMessage, this.currentUser!.userId).subscribe({
        next: (response: string) => {
          this.addAssistantMessage(response);
          this.clearAfterSend();
        },
        error: (error) => {
          this.addAssistantMessage('Error: ' + error.message);
          this.clearAfterSend();
        }
      });
    } else if (this.inputMessage.trim() && this.filePreviews.length == 0) {
      this.askQuestion.askQuestion(this.inputMessage).subscribe({
        next: (response: string) => {
          this.addAssistantMessage(response);
          this.clearAfterSend();
        },
        error: (error) => {
          this.addAssistantMessage('Error: ' + error.message);
          this.clearAfterSend();
        }
      });
    }
  }

  private addAssistantMessage(content: string): void {
    const assistantMessage: Message = {
      id: this.messages.length + 1,
      type: 'assistant',
      content: content,
      timestamp: new Date()
    };
    this.messages.push(assistantMessage);
    this.isTyping = false;
  }

  private clearAfterSend(): void {
    this.inputMessage = '';
    this.fileInput.nativeElement.value = '';
    this.clearPreviews();
    this.scrollToBottom();
  }

  sendSuggestedPrompt(prompt: string): void {
    this.inputMessage = prompt;
    this.sendMessage();
    this.inputMessage = '';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
      this.clearPreviews();
      this.inputMessage = '';
    }
  }

  private generateResponse(): string {
    const responses = [
      "Processing your request. Here's what I found...",
      "Understood. Let me break that down for you...",
      "Excellent question. Based on my analysis...",
      "I'd be happy to help you with that. Here's my response..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  newChat(): void {
    this.messages = [{
      id: 1,
      type: 'assistant',
      content: 'Hi! How can I assist you today?',
      timestamp: new Date()
    }];
    this.clearPreviews();
    this.inputMessage = '';
    this.isTyping = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.showSidebar = false;
    }
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.showSidebar = false;
    }
  }
}