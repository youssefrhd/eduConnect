import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-check-email',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.css'
})
export class CheckEmailComponent implements OnInit {

   email: string = '';
  canResend = true;
  resendCountdown = 60;
  isLoading = false;
  isResending = false;
  successMessage = '';
  errorMessage = '';
  
  private countdownSubscription?: Subscription;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
    
      if (!this.email) {
        this.email = localStorage.getItem('registerEmail') || '' ;
      }
    });
  }
  
  ngOnDestroy(): void {
    
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }
  
  resendVerification(): void {
    if (!this.canResend || !this.email || this.isResending) return;
    
    this.isResending = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.resendVerification(this.email).subscribe({
      next: (response: any) => {
        this.isResending = false;
        this.successMessage = 'Verification email sent successfully!';
        
        
        this.startResendCooldown();
        
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error: any) => {
        this.isResending = false;
        
        if (error.status === 404) {
          this.errorMessage = 'Email not found. Please check and try again.';
        } else if (error.status === 400) {
          this.errorMessage = 'Invalid email address.';
        } else if (error.status === 409) {
          this.errorMessage = 'Email already verified.';
        } else if (error.status === 429) {
          this.errorMessage = 'Too many requests. Please wait before trying again.';
        } else {
          this.errorMessage = 'Failed to resend verification email. Please try again.';
        }
      }
    });
  }
  
  startResendCooldown(): void {
    this.canResend = false;
    this.resendCountdown = 60;
    
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.canResend = true;
        this.countdownSubscription?.unsubscribe();
      }
    });
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
  
  updateEmail(newEmail: string): void {
    this.email = newEmail;
  }
  

}
