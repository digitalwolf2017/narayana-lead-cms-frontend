import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  isMenuOpen = false;
  isLoggingOut = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get currentUser(): AuthUser | null {
    return this.authService.currentUser() ?? this.authService.getUser();
  }

  get userName(): string {
    return this.currentUser?.name || 'Admin';
  }

  get userEmail(): string {
    return this.currentUser?.email || 'admin@example.com';
  }

  get userInitial(): string {
    return (this.userName[0] || 'A').toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: (error) => {
        console.error('Logout failed:', error);
        this.finishLogout();
      },
    });
  }

  private finishLogout(): void {
    this.authService.clearSession();
    this.isMenuOpen = false;
    this.isLoggingOut = false;
    this.router.navigate(['/']);
  }
}