import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  implements OnInit, OnDestroy {
 sidebarOpen = true;
  userMenuOpen = false;
  notificationsOpen = false;
  currentUser: any;
  isMobile = false;

   weeklyStudyHours: number[] = [];
  
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.checkScreenSize();
    this.generateWeeklyStudyHours();  
  }

   
  generateWeeklyStudyHours(): void {
    this.weeklyStudyHours = Array.from({ length: 7 }, () => 
      Math.floor(4 + Math.random() * 4)
    );
  }

  
  getChartBarWidth(index: number): string {
    
    if (this.weeklyStudyHours.length > 0) {
      const hours = this.weeklyStudyHours[index];
      
      const percentage = 40 + (hours - 4) * 10;
      return percentage + '%';
    }
    
    
    const percentage = 40 + Math.random() * 60;
    return percentage + '%';
  }

  
  getHoursForDay(index: number): string {
    if (this.weeklyStudyHours.length > 0) {
      return this.weeklyStudyHours[index] + 'h';
    }
    
    
    return Math.floor(4 + Math.random() * 4) + 'h';
  }

  ngOnDestroy() {
    
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  
  get shouldShowSidebarOverlay(): boolean {
    return this.sidebarOpen && this.isMobile;
  }
  
  
  stats = [
    { label: 'Active Courses', value: '5', change: '+2', icon: '📚', color: 'bg-blue-500' },
    { label: 'Study Hours', value: '42h', change: '+15%', icon: '⏱️', color: 'bg-green-500' },
    { label: 'Assignments', value: '12', change: '3 due', icon: '📝', color: 'bg-purple-500' },
    { label: 'Files', value: '47', change: '+8', icon: '📁', color: 'bg-orange-500' }
  ];
  
  recentActivities = [
    { 
      title: 'Uploaded Hausarbeit.pdf', 
      time: '2 hours ago',
      type: 'upload',
      user: 'You'
    },
    { 
      title: 'Completed Time Management Module', 
      time: 'Yesterday',
      type: 'completion',
      user: 'You'
    },
    { 
      title: 'New course available: "Advanced Learning Techniques"', 
      time: '2 days ago',
      type: 'announcement',
      user: 'System'
    },
    { 
      title: 'Shared project with study group', 
      time: '3 days ago',
      type: 'share',
      user: 'You'
    }
  ];
  
  courses = [
    { 
      title: 'Learning Techniques', 
      progress: 85,
      nextSession: 'Today, 14:00',
      instructor: 'Dr. Schmidt',
      color: 'bg-gradient-to-r from-blue-400 to-cyan-400'
    },
    { 
      title: 'Project Management', 
      progress: 60,
      nextSession: 'Tomorrow, 10:00',
      instructor: 'Prof. Müller',
      color: 'bg-gradient-to-r from-purple-400 to-pink-400'
    },
    { 
      title: 'Digital Transformation', 
      progress: 45,
      nextSession: 'Friday, 16:00',
      instructor: 'Dr. Weber',
      color: 'bg-gradient-to-r from-green-400 to-emerald-400'
    },
    { 
      title: 'Research Methods', 
      progress: 30,
      nextSession: 'Monday, 09:00',
      instructor: 'Prof. Fischer',
      color: 'bg-gradient-to-r from-orange-400 to-red-400'
    }
  ];
  
  upcomingTasks = [
    { title: 'Submit Hausarbeit', due: 'Today', priority: 'high' },
    { title: 'Prepare presentation', due: 'Tomorrow', priority: 'medium' },
    { title: 'Read chapter 5', due: 'This week', priority: 'low' },
    { title: 'Group meeting', due: 'Friday', priority: 'medium' }
  ];
  
  notifications = [
    { id: 1, title: 'New message from study group', time: '5 min ago', read: false },
    { id: 2, title: 'Assignment deadline approaching', time: '1 hour ago', read: false },
    { id: 3, title: 'Course material updated', time: '3 hours ago', read: true },
    { id: 4, title: 'New comment on your post', time: 'Yesterday', read: true }
  ];

  
  navItems = [
    { 
      name: 'Dashboard', 
      route: '/dashboard', 
      exact: true,
      icon: '📊', 
      description: 'Overview',
      iconColor: 'bg-gradient-to-r from-blue-400 to-cyan-400'
    },
    { 
      name: 'Learning Hub', 
      route: '/learning', 
      icon: '📚', 
      description: 'Courses & Materials',
      iconColor: 'bg-gradient-to-r from-purple-400 to-pink-400'
    },
    { 
      name: 'My Files', 
      route: '/files', 
      icon: '📁', 
      description: 'Documents & Resources',
      badge: '12',
      iconColor: 'bg-gradient-to-r from-green-400 to-emerald-400'
    },
    { 
      name: 'Analytics', 
      route: '/analytics', 
      icon: '📈', 
      description: 'Progress & Stats',
      iconColor: 'bg-gradient-to-r from-orange-400 to-red-400'
    },
    { 
      name: 'Projects', 
      route: '/projects', 
      icon: '🏗️', 
      description: 'Group Projects',
      iconColor: 'bg-gradient-to-r from-indigo-400 to-blue-400'
    },
    { 
      name: 'Calendar', 
      route: '/calendar', 
      icon: '📅', 
      description: 'Schedule & Deadlines',
      iconColor: 'bg-gradient-to-r from-pink-400 to-rose-400'
    }
  ];

  recentFiles = [
    { name: 'Hausarbeit.pdf', time: '2 hours ago', size: '2.4 MB', icon: '📄' },
    { name: 'Lecture_Notes.pdf', time: 'Yesterday', size: '1.2 MB', icon: '📝' },
    { name: 'Project_Slides.pptx', time: '2 days ago', size: '3.8 MB', icon: '📊' }
  ];

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser() || {
      name: 'Youssef El Rhadir',
      email: 'youssef@student.de',
      role: 'Student',
      avatar: 'YE'
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  markNotificationAsRead(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
