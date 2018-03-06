import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoggedIn: boolean;
  message: string;
  loginFormGroup: FormGroup;

  constructor(private authService: AuthService, public snackbar: MatSnackBar, private router: Router) {
    this.loginFormGroup = new FormGroup({
      username: new FormControl(),
      password: new FormControl()
    });
  }

  ngOnInit() {
    this.message = 'No request sent';
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  notifyMessage(message: string, duration: number) {
    const snackbarConfig = new MatSnackBarConfig();
    snackbarConfig.duration = duration;
    this.snackbar.open(message, '', snackbarConfig);
  }

  login() {
    this.message = 'Waiting for response';
    const username = this.loginFormGroup.value.username;
    const password = this.loginFormGroup.value.password;
    this.authService.login(username, password).subscribe(
      response => {
        this.isLoggedIn = response && response.result && response.result.value === true;
        this.message = (this.isLoggedIn ? 'Login successful' : 'Login failed');
        this.notifyMessage(this.message, 2000);
        this.router.navigate(['/']);
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
