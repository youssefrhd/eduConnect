import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { response } from 'express';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {





  
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  birthday: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  acceptTerms: boolean = false;
  isLoading: boolean = false;
  activeInput: string = '';
  
  constructor(private router: Router,private authService:AuthService) {}


  toggleTerms(): void {
  this.acceptTerms = !this.acceptTerms;
  }
  hasSpecialChar(password: string): boolean {
    return /[^A-Za-z0-9]/.test(password);
  }
  hasUppercase(password: string) { return /[A-Z]/.test(password); }
  hasNumber(password: string) { return /[0-9]/.test(password); }
   ngOnInit(): void {
    
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    this.birthday = maxDate.toISOString().split('T')[0];
  }
  
  onSubmit(): void {
  if (!this.validateForm()) {
    return;
  }
  
  this.isLoading = true;
  const birthdayDate = new Date(this.birthday);
  
  this.authService.register(
    this.email,
    `${this.firstName} ${this.lastName}`.trim(),
    this.password,
    birthdayDate
  ).subscribe({
    next: () => {
      this.isLoading = false;
      this.router.navigate(['/check-email'], {
        queryParams: { email: this.email }
      });
    },
    error: (error) => {
      this.isLoading = false;
      this.handleRegistrationError(error);
    }
  });
}

private handleRegistrationError(error: any): void {
  const messages: Record<number, string> = {
    400: error.error?.message || 'Invalid registration data!',
    409: 'Email already exists!',
    422: 'Validation failed!',
    500: 'Server error. Please try again later!',
  };
  
  const message = messages[error.status] || 'Registration failed. Please try again!';
  this.showToast(message, 'error');
}
  
  
validateForm(): boolean {
  
  if (this.password !== this.confirmPassword) {
    this.showToast('Passwords do not match!', 'error');
    return false;
  }
  
  
  if (this.password.length < 8) {
    this.showToast('Password must be at least 8 characters long!', 'error');
    return false;
  }
  
  
  if (!this.acceptTerms) {
    this.showToast('Please accept the terms and conditions!', 'error');
    return false;
  }
  
  
  if (this.birthday) {
    const birthDate = new Date(this.birthday);
    const today = new Date();
    
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--; 
    }
    
    if (age < 13) {
      this.showToast('You must be at least 13 years old to register!', 'error');
      return false;
    }
  }
  
  return true;
}
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  onInputFocus(field: string): void {
    this.activeInput = field;
  }
  
  onInputBlur(): void {
    this.activeInput = '';
  }
  
  signUpWithGoogle(): void {
    this.showToast('Google sign-up coming soon!', 'info');
  }
  
  signUpWithMicrosoft(): void {
    this.showToast('Microsoft sign-up coming soon!', 'info');
  }
  
  signUpWithGitHub(): void {
    this.showToast('GitHub sign-up coming soon!', 'info');
  }
  
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    
    console.log(`${type.toUpperCase()}: ${message}`);
  }

}
