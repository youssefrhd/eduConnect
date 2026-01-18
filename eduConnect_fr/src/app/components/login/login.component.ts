
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { filter, finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  
})
export class LoginComponent implements OnInit {
 @ViewChild('particlesContainer') particlesContainer!: ElementRef;
  
  
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage = '';

  isLoading: boolean = false;
  showPassword: boolean = false;
  showParticles: boolean = true;
  activeInput: 'email' | 'password' | null = null;
  

  floatAnimationState = 0;
  particleCount = 50;
  
  constructor(private router: Router,private authService:AuthService) {}
  
  ngOnInit(): void {

    setInterval(() => {
      this.floatAnimationState = this.floatAnimationState === 0 ? 1 : 0;
    }, 6000);
    
    
    this.createParticles();
  }


  
 onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        
       
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  
  private validateForm(): boolean {
    if (!this.email || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return false;
    }
    
    if (!this.isValidEmail(this.email)) {
      this.showToast('Please enter a valid email address', 'warning');
      return false;
    }
    
    return true;
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  onInputFocus(inputType: 'email' | 'password'): void {
    this.activeInput = inputType;
  }
  
  onInputBlur(): void {
    this.activeInput = null;
  }
  
  loginWithProvider(provider: 'google' | 'microsoft' | 'github'): void {
    this.isLoading = true;
    this.showToast(`Connecting with ${provider}...`, 'info');
    
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/chat']);
    }, 1500);
  }
  
  public showToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
 
    console.log(`${type.toUpperCase()}: ${message}`);
  }
  
  private createParticles(): void {
    setTimeout(() => {
      if (this.particlesContainer?.nativeElement) {
        const container = this.particlesContainer.nativeElement;
        for (let i = 0; i < this.particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          
          
          const size = Math.random() * 4 + 1;
          const posX = Math.random() * 100;
          const posY = Math.random() * 100;
          const animationDelay = Math.random() * 5;
          const duration = Math.random() * 10 + 10;
          
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${posX}%`;
          particle.style.top = `${posY}%`;
          particle.style.animationDelay = `${animationDelay}s`;
          particle.style.animationDuration = `${duration}s`;
          
          
          const colors = [
            'rgba(234, 88, 12, 0.3)',  
            'rgba(107, 114, 128, 0.3)', 
            'rgba(75, 85, 99, 0.3)',    
            'rgba(31, 41, 55, 0.3)',    
            'rgba(249, 115, 22, 0.3)'   
          ];
          particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          
          container.appendChild(particle);
        }
      }
    }, 100);
  }
  
  
  loginWithGoogle(): void { this.loginWithProvider('google'); }
  loginWithMicrosoft(): void { this.loginWithProvider('microsoft'); }
  loginWithGitHub(): void { this.loginWithProvider('github'); 
  }
  }