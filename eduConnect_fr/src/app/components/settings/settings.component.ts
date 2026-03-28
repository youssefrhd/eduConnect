// settings.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports:[FormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+49 000 000000',
    birthday: '1995-06-15',
    bio: 'Designer • Builder • Coffee lover ☕',
    location: 'Berlin, Germany',
    website: 'https://mywebsite.com'
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  preview: string | ArrayBuffer | null = 'https://i.pravatar.cc/300';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  save() {
    console.log('Saved settings', this.user);
    alert('Profile updated successfully 🚀');
  }

  resetPassword() {
    if (this.password.new !== this.password.confirm) {
      alert('New passwords do not match');
      return;
    }

    console.log('Password reset', this.password);
    alert('Password updated successfully 🔐');

    this.password = { current: '', new: '', confirm: '' };
  }
}
