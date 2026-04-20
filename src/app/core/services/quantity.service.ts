import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quantity {
  value: number;
  unit: string;
  measurementType: string;
}

@Injectable({ providedIn: 'root' })
export class QuantityService {
 private baseUrl = `${environment.apiUrl}/api/v1/quantities`;

  constructor(private http: HttpClient) {}

  convert(quantity: Quantity, targetUnit: string) {
    const params = new HttpParams().set('targetUnit', targetUnit);
    return this.http.post<Quantity>(`${this.baseUrl}/convert`, quantity, { params });
  }

  compare(quantities: Quantity[]) {
    return this.http.post<boolean>(`${this.baseUrl}/compare`, quantities);
  }

  add(quantities: Quantity[]) {
    return this.http.post<Quantity>(`${this.baseUrl}/add`, quantities);
  }

  subtract(quantities: Quantity[]) {
    return this.http.post<Quantity>(`${this.baseUrl}/subtract`, quantities);
  }

  divide(quantities: Quantity[]) {
    return this.http.post<number>(`${this.baseUrl}/divide`, quantities);
  }

  getHistory(type='ALL') {
    return this.http.get<any[]>(`${this.baseUrl}/history/${type}`);
  }

  getCount(type:string) {
    return this.http.get<number>(`${this.baseUrl}/count/${type}`);
  }
}