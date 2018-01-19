import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoggedIn: boolean;
  message: string;
  username: string;
  password: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.message = 'No request sent';
    this.isLoggedIn = this.authService.isLoggedIn();

  }

  login() {
    this.message = 'Waiting for response';
    this.authService.login(this.username, this.password).subscribe(
      response => {
        this.isLoggedIn = response && response.result && response.result.value === true;
        this.message = (this.isLoggedIn ? 'Login successful' : 'Login failed');
      }
    );
  }

  logout() {
    this.message = 'Waiting for response';
    this.authService.logout().subscribe(
      response => {
        const logoutSuccess = response && response.result && response.result.value === true;
        if (logoutSuccess) {
          this.isLoggedIn = false;
        }
        this.message = (logoutSuccess ? 'Logout successful' : 'Logout failed');
      }
    );
  }

}
