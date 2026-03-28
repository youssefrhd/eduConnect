import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  name: string;
  route: string;
  icon: string;
  description: string;
  badge?: string;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: string;
  trend: 'up' | 'down';
}

interface Course {
  id: string;
  title: string;
  progress: number;
  instructor: string;
  nextSession: string;
  thumbnail: string;
}

interface Task {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  course: string;
}

interface Activity {
  id: string;
  title: string;
  time: string;
  user: string;
  type: 'submission' | 'grade' | 'announcement' | 'discussion';
}

interface File {
  id: string;
  name: string;
  time: string;
  size: string;
  type: 'pdf' | 'doc' | 'ppt' | 'other';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  userMenuOpen = false;
  notificationsOpen = false;
  
  currentUser = {
    name: 'Dr. Alexander Chen',
    email: 'a.chen@edu.institute',
    role: 'Professor',
    avatar: 'AC',
    department: 'Computer Science'
  };

  navItems: NavItem[] = [
    { 
      name: 'Dashboard', 
      route: '/dashboard', 
      icon: 'layout-dashboard', 
      description: 'Overview',
      badge: '3'
    },
    { 
      name: 'My Courses', 
      route: '/courses', 
      icon: 'book-open', 
      description: 'Learning materials' 
    },
    { 
      name: 'Research', 
      route: '/research', 
      icon: 'microscope', 
      description: 'Publications' 
    },
    { 
      name: 'Analytics', 
      route: '/analytics', 
      icon: 'line-chart', 
      description: 'Performance' 
    },
    { 
      name: 'Messages', 
      route: '/messages', 
      icon: 'message-circle', 
      description: 'Communications',
      badge: '5'
    }
  ];

  stats: Stat[] = [
    { 
      label: 'Active Courses', 
      value: '8', 
      change: '+2', 
      icon: 'book-open', 
      trend: 'up' 
    },
    { 
      label: 'Publications', 
      value: '24', 
      change: '+5', 
      icon: 'file-text', 
      trend: 'up' 
    },
    { 
      label: 'Students', 
      value: '156', 
      change: '+12', 
      icon: 'users', 
      trend: 'up' 
    },
    { 
      label: 'Research Score', 
      value: '92', 
      change: '-3', 
      icon: 'trending-up', 
      trend: 'down' 
    }
  ];

  courses: Course[] = [
    { 
      id: '1',
      title: 'Advanced Machine Learning', 
      progress: 78, 
      instructor: 'Dr. Smith',
      nextSession: 'Tomorrow 10:00',
      thumbnail: 'ML'
    },
    { 
      id: '2',
      title: 'Research Methodologies', 
      progress: 45, 
      instructor: 'Prof. Williams',
      nextSession: 'Wed 14:00',
      thumbnail: 'RM'
    },
    { 
      id: '3',
      title: 'Neural Networks', 
      progress: 92, 
      instructor: 'Dr. Johnson',
      nextSession: 'Thu 11:30',
      thumbnail: 'NN'
    },
    { 
      id: '4',
      title: 'Data Visualization', 
      progress: 63, 
      instructor: 'Prof. Brown',
      nextSession: 'Fri 09:00',
      thumbnail: 'DV'
    }
  ];

  tasks: Task[] = [
    { 
      id: '1',
      title: 'Review Research Papers', 
      due: '2024-03-15', 
      priority: 'high', 
      course: 'Advanced ML' 
    },
    { 
      id: '2',
      title: 'Grade Assignments', 
      due: '2024-03-16', 
      priority: 'medium', 
      course: 'Data Viz' 
    },
    { 
      id: '3',
      title: 'Committee Meeting', 
      due: '2024-03-17', 
      priority: 'low', 
      course: 'Department' 
    },
    { 
      id: '4',
      title: 'Submit Grant Proposal', 
      due: '2024-03-18', 
      priority: 'high', 
      course: 'Research' 
    }
  ];

  activities: Activity[] = [
    { 
      id: '1',
      title: 'Assignment submitted', 
      time: '2 hours ago', 
      user: 'John Doe', 
      type: 'submission' 
    },
    { 
      id: '2',
      title: 'Grades published', 
      time: '5 hours ago', 
      user: 'You', 
      type: 'grade' 
    },
    { 
      id: '3',
      title: 'Course announcement', 
      time: 'Yesterday', 
      user: 'Admin', 
      type: 'announcement' 
    },
    { 
      id: '4',
      title: 'New discussion post', 
      time: 'Yesterday', 
      user: 'Sarah Lee', 
      type: 'discussion' 
    }
  ];

  recentFiles: File[] = [
    { id: '1', name: 'Syllabus.pdf', time: '2 hours ago', size: '2.4 MB', type: 'pdf' },
    { id: '2', name: 'Lecture Notes.docx', time: 'Yesterday', size: '1.2 MB', type: 'doc' },
    { id: '3', name: 'Presentation.pptx', time: '2 days ago', size: '5.7 MB', type: 'ppt' }
  ];

  notifications = [
    { id: 1, title: 'New course material', message: 'ML module 5 uploaded', time: '5 min ago', read: false },
    { id: 2, title: 'Assignment deadline', message: 'Data Viz project due tomorrow', time: '1 hour ago', read: false },
    { id: 3, title: 'System update', message: 'Maintenance at 2 AM', time: '3 hours ago', read: true }
  ];

  weeklyActivity = [65, 45, 75, 85, 55, 70, 45];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    console.log('Logging out...');
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  getPriorityColor(priority: string): string {
    switch(priority) {
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  getFileIcon(type: string): string {
    switch(type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'ppt': return '📊';
      default: return '📁';
    }
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'submission': return '📤';
      case 'grade': return '✓';
      case 'announcement': return '📢';
      case 'discussion': return '💬';
      default: return '📌';
    }
  }
}