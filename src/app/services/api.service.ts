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
  private emailUrl = baseApi + 'email/';

  constructor(private http: HttpClient) {}
  //EVENTS----------------------------------------------------------
  getEvents(): Observable<any> {
    return this.http.get(this.baseUrl + 'events');
  }
  postEvents(body: any): Observable<any> {
    return this.http.post(this.baseUrl + 'events', body);
  }
  updateEvents(id: any, body: any): Observable<any> {
    return this.http.post(this.baseUrl + 'events/' + id, body);
  }
  deleteEvents(id: any): Observable<any> {
    return this.http.delete(this.baseUrl + 'events/' + id);
  }

  //PARTICIPANTS----------------------------------------------------
  getParticipants(): Observable<any> {
    return this.http.get(this.baseUrl + 'participants');
  }
  postParticipants(body: any): Observable<any> {
    return this.http.post(this.baseUrl + 'participants', body);
  }
  deleteParticipantsByEvent(eventId: any): Observable<any> {
    return this.http.delete(this.baseUrl + 'participants/' + eventId);
  }

  //ROOMS-----------------------------------------------------------
  getRooms(): Observable<any> {
    return this.http.get(this.baseUrl + 'rooms');
  }

  // EMAILS---------------------------------------------------------
  sendEmail(body: any): Observable<any> {
    return this.http.post(this.emailUrl + 'send', body);
  }

  // EMPLOYEES-------------------------------------------------------
  getEmailEmployees(): Observable<any> {
    return this.http.get(this.baseUrl + 'employees/email');
  }
}
