import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

var authUrl = environment.baseApi + 'auth/';
var mrisUrl = environment.defaultApi + 'auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const USER_DATA_KEY = 'auth-user-data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  setCookie(cValue: string, expDays: number) {
    let date = new Date();
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = TOKEN_KEY + '=' + cValue + '; ' + expires + '; path=/';
  }
  deleteCookie() {
    document.cookie =
      TOKEN_KEY + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  }
  getCookie() {
    const name = TOKEN_KEY + '=';
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach((val) => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    });
    return res;
  }
  login(nik: string, password: string): Observable<any> {
    return this.http.post(
      authUrl + 'signin',
      {
        nik,
        password,
      },
      httpOptions
    );
  }

  signOut(): void {
    window.localStorage.clear();
    // window.location.reload();
    this.deleteCookie()
    this.router.navigate(['/']);
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    this.setCookie(token,1)
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    // return window.localStorage.getItem(TOKEN_KEY);
    return this.getCookie()!;
  }

  // public saveUser(user: any): void {
  //   window.localStorage.removeItem(USER_KEY);
  //   window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  // }

  // public getUser(): any {
  //   const user = window.localStorage.getItem(USER_KEY);
  //   if (user) {
  //     return JSON.parse(user);
  //   }

  //   return {};
  // }
  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(USER_DATA_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.employeesGetById(this.getUser()[0].lg_nik).subscribe((data) => {
      console.log(data);
      
      window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(data[0]));
    },(err)=>{console.log(err);
    });
    
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }
  public getUserData(): any {
    const user = window.localStorage.getItem(USER_DATA_KEY);
    // console.log(user);
    
    if (user) {
      return JSON.parse(user);
    }
  }

  //EMPLOYESS
  employeesGet(): Observable<any> {
    return this.http.get(mrisUrl + 'employees');
  }
  employeesKejayanGet(): Observable<any> {
    return this.http.get(mrisUrl + 'employees/kejayan');
  }
  employeesGetById(nik: any): Observable<any> {
    return this.http.get(mrisUrl + 'employee/' + nik);
  }
}
