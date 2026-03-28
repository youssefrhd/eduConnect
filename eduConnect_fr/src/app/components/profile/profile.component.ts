import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { UserServService } from '../../services/user-serv.service';
import { response } from 'express';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface Course {
  id: string;
  title: string;
  progress: number;
  category: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  editMode = false;
  showPassword = false;
  showToast = false;
  twoFactor = false;
  currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  form: User = {
    userId: '',
    name: '',
    email: '',
    role: 'student',
    city: '',
    bio: '',
    picture: '',
    createdAt: '',
    birthday: '',
    password: '',
    handynummer: '',
  };
  constructor(private userServ: UserServService) { }
  private backup: User = { ...this.form };

  ngOnInit(): void {
   
    this.userServ.getCurrentUser$().subscribe(user => {
      if (user) {
        this.form = {
          userId: user?.userId || '',
          name: user?.name || '',
          email: user?.email || '',
          role: 'student',
          city: user?.city || '',
          bio: user?.bio || '',
          picture: user?.picture || '',
          createdAt: user?.createdAt || '',
          birthday: user?.birthday || '',
          password: user?.password || '',
          handynummer: user?.handynummer || '',
        };
      }

     
    })
    
    this.backup = { ...this.form };
  }

  toggleEdit(): void {
    if (this.editMode) {
      
      this.form = { ...this.backup };
    } else {
      this.backup = { ...this.form };
    }
    this.editMode = !this.editMode;
    this.showPassword = false;
  }

  saveProfile(): void {
    this.backup = { ...this.form };
    this.editMode = false;
    this.showPassword = false;
    this.triggerToast();
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement?.click();
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.form.picture = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  triggerToast(): void {
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  getPasswordStrength(): number {
    const pw = this.form.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  getStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-orange-400';
    return 'bg-green-500';
  }

  getStrengthTextColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'text-red-400';
    if (strength === 2) return 'text-yellow-400';
    if (strength === 3) return 'text-orange-400';
    return 'text-green-400';
  }

  getStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  }
}