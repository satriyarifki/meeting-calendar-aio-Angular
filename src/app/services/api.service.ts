import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
var baseApi = environment.baseApi;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = baseApi + 'api/';

  constructor(private http: HttpClient) {}
  getEvents(): Observable<any> {
    return this.http.get(this.baseUrl + 'events');
  }
}
