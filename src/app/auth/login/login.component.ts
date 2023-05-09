import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form!: FormGroup;
  showPassword: Boolean = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.authService
      .login(this.f['email'].value, this.f['password'].value)
      .subscribe(
        (data) => {
          // console.log(data.access_token);

          this.authService.saveToken(data.access_token);
          this.authService.saveUser(data.user);

          console.log('Sign In Success');
          this.alertService.onCallAlert('Login Success', AlertType.Success);

          // this.alertService.onCallAlert('Login Success', AlertType.Success);
          this.reloadPage();
        },
        (err) => {
          if (err.statusText == 'Unauthorized') {
            console.log('Email or Pass Invalid');
            this.alertService.onCallAlert(
              'Email or Password Invalid',
              AlertType.Error
            );
          } else {
            this.alertService.onCallAlert('Login Failed', AlertType.Error);
            console.log('Sign In Failed');
          }

          // console.log(err.statusText);

          // this.errorMessage = err.error.message;
          // this.isLoginFailed = true;
          // this.submitted = false;
          this.submitted = false;
          this.f['password'].setValue('');
          // this.form.setValue({ email: '', password: '' });
        },
        () => {
          this.submitted = false;
        }
      );
  }

  changeVisibilityPassword() {
    this.showPassword = !this.showPassword;
  }

  reloadPage(): void {
    this.router.navigate(['/']);
    // window.location.reload();
  }
}
