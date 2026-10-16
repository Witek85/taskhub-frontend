import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  public username = '';
  public password = '';
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  public login(): void {
    this.error.set(null);
    this.loading.set(true);

    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Nieprawidłowy login albo hasło.');
        },
      });
  }
}
