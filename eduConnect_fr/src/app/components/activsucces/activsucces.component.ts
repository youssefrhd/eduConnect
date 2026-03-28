import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activsucces',
  imports: [FormsModule,CommonModule],
  templateUrl: './activsucces.component.html',
  styleUrl: './activsucces.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ActivsuccesComponent implements OnInit {

  confettiParticles: any[] = [];
  userEmail: string = '';
  userName: string = '';

  isLoading = true;
  isSuccess = false;
  email: string = '';
  message: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.email = params['email'] || '';
      this.userName = params['firstName'] || '';
      
      if (token) {
        this.verifyEmail(token);
      } else {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = 'Account activated successfully!';
        this.createConfetti();
        setTimeout(() => {
          this.goToDashboard();
        }, 10000);
      }
    });
  }
  
  verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Email verified successfully!';
        this.isLoading = false;
        this.createConfetti();
        setTimeout(() => {
          this.goToDashboard();
        }, 10000);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err.error?.message || 'Verification failed';
        this.isLoading = false;
      }
    });
  }
  
  createConfetti(): void {
    const colors = ['#10b981', '#34d399', '#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899'];
    
    for (let i = 0; i < 50; i++) {
      this.confettiParticles.push({
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.5,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
        transform: `rotate(${Math.random() * 360}deg)`
      });
    }
  }
  
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  
  exploreFeatures(): void {
    this.router.navigate(['/features']);
  }
}
