import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form!: FormGroup;
  showPassword: Boolean = false;

  constructor(
    private authService: AuthService,
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

          // this.alertService.onCallAlert('Login Success', AlertType.Success);
          this.reloadPage();
        },
        (err) => {
          if (err.statusText == 'Unauthorized') {
            // this.alertService.onCallAlert(
            //   'Invalid Email or Password',
            //   AlertType.Error
            // );
            console.log('Email or Pass Invalid');
          } else {
            console.log('Sign In Failed');
            // this.alertService.onCallAlert('Login Failed', AlertType.Error);
          }

          // console.log(err.statusText);

          // this.errorMessage = err.error.message;
          // this.isLoginFailed = true;
          // this.submitted = false;
          this.form.setValue({ email: '', password: '' });
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
