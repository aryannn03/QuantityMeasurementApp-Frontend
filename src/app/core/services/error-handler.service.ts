import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {

  getFriendlyMessage(error: HttpErrorResponse): string {
    const backendMessage = error.error?.message || error.error?.error;

    switch (error.status) {
      case 400: return backendMessage || 'Invalid input. Please check your values.';
      case 401: return 'Session expired. Please sign in again.';
      case 403: return 'You do not have permission to do this.';
      case 404: return backendMessage || 'Resource not found.';
      case 409: return backendMessage || 'Conflict error. Please try again.';
      case 422: return backendMessage || 'Invalid data submitted.';
      case 500: return 'Server error. Please try again later.';
      case 0:   return 'Cannot reach the server. Check your connection.';
      default:  return backendMessage || 'Something went wrong. Please try again.';
    }
  }
}