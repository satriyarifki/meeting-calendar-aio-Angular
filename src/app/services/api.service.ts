import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
var baseApi = environment.baseApi;
var defaultApi = environment.defaultApi;
var offDayApi = 'https://api-harilibur.vercel.app/'
var dayOffApi = 'https://dayoffapi.vercel.app/'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = baseApi + 'api/';
  private defaultUrl = defaultApi + 'api/';
  private emailUrl = baseApi + 'email/';

  constructor(private http: HttpClient) {}
  // GET Holiday
  getHolidayByMonthYear(month:any, year:any): Observable<any> {
    return this.http.get(this.baseUrl+'holiday/'+year +'/'+month);
  }


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

  getEventsHo(): Observable<any> {
    return this.http.get(this.baseUrl + 'events/ho');
  }
  getEventsHoByDate(date:any): Observable<any> {
    return this.http.get(this.baseUrl + 'event/ho/'+ date);
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
  getM2UpEmployees(): Observable<any> {
    return this.http.get(this.baseUrl + 'employees/m2up');
  }
  getNameEmailEmployees(): Observable<any> {
    return this.http.get(this.baseUrl + 'employees/name-email');
  }

  // ATTACHMENTS-----------------------------------------------------
  deleteAttachmentByEventid(eventId: any): Observable<any> {
    return this.http.delete(this.baseUrl + 'attachments/' + eventId);
  }
  getAttachmentById(eventId: any): Observable<any> {
    return this.http.get(this.baseUrl + 'attachments/' + eventId);
  }

  //-----------------------------------------------------------RESERVATIONS
  reservGet(): Observable<any> {
    return this.http.get(this.defaultUrl + 'reserv');
  }
  reservGetById(id: any): Observable<any> {
    return this.http.get(this.defaultUrl + 'reserv/' + id);
  }
  reservPost(body: any): Observable<any> {
    return this.http.post(this.defaultUrl + 'reserv', body);
  }
  reservUpdate(id: any, body: any): Observable<any> {
    return this.http.post(this.defaultUrl + 'reserv/' + id, body);
  }
  reservDelete(id: any): Observable<any> {
    return this.http.delete(this.defaultUrl + 'reserv/' + id);
  }

  //-------------------------------------------------------------ACCESSORIES
  accessoriesGet(): Observable<any> {
    return this.http.get(this.defaultUrl + 'accessories');
  }
  accessoriesGetById(id: any): Observable<any> {
    return this.http.get(this.defaultUrl + 'accessories/' + id);
  }
  accessoriesPost(body: any): Observable<any> {
    return this.http.post(this.defaultUrl + 'accessories', body);
  }
  accessoriesUpdate(id: any, body: any): Observable<any> {
    return this.http.post(this.defaultUrl + 'accessories/' + id, body);
  }
  

  // ---------------------------VOTE
  votesGet(): Observable<any> {
    return this.http.get(this.baseUrl + 'vote');
  }
  votesByIdGet(id:number): Observable<any> {
    return this.http.get(this.baseUrl + 'vote/'+id);
  }
  votesByUserGet(userId:any): Observable<any> {
    return this.http.get(this.baseUrl + 'vote/user/'+userId);
  }
  votesPost(body:any): Observable<any> {
    return this.http.post(this.baseUrl + 'vote',body);
  }
  deleteVotes(id:number): Observable<any> {
    return this.http.delete(this.baseUrl + 'vote/'+id);
  }

  // ---------------------------VOTE DETAILS
  voteDetailsGet(): Observable<any> {
    return this.http.get(this.baseUrl + 'vote-details');
  }
  voteDetailsByVoteGet(voteId:any): Observable<any> {
    return this.http.get(this.baseUrl + 'vote-details/'+voteId);
  }
  voteDetailsByUserGet(userId:any): Observable<any> {
    return this.http.get(this.baseUrl + 'vote-details/group/'+userId);
  }
  voteDetailsPost(body:any): Observable<any> {
    return this.http.post(this.baseUrl + 'vote-details',body);
  }
  voteDetailsUpdatePut(body:any): Observable<any> {
    return this.http.put(this.baseUrl + 'vote-details',body);
  }
  voteEmailPost(body:any): Observable<any> {
    return this.http.post(this.emailUrl + 'send/vote',body);
  }

   // ---------------------------VOTE TIMES
   voteTimesGet(): Observable<any> {
    return this.http.get(this.baseUrl + 'vote-times');
  }
  voteTimesPost(body:any): Observable<any> {
    return this.http.post(this.baseUrl + 'vote-times',body);
  }
  voteTimesUpdate(body:any): Observable<any> {
    return this.http.put(this.baseUrl + 'vote-times',body);
  }

   // ---------------------------VOTE PARTICIPANTS
   voteParticipantsGet(): Observable<any> {
    return this.http.get(this.baseUrl + 'vote-participants');
  }
  voteParticipantsPost(body:any): Observable<any> {
    return this.http.post(this.baseUrl + 'vote-participants',body);
  }
}
