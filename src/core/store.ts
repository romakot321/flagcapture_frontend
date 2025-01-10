import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Store {
  private username: string | undefined = undefined;

  constructor() {
    this.username = localStorage.getItem("username") ?? undefined;
  }

  setCredentials(username: string | undefined): void {
    this.username = username;
    if (username == undefined)
      localStorage.removeItem("username");
    else
      localStorage.setItem("username", username);
    console.log("New username stored", this.username);
  }

  getCredentials(): string | undefined {
    return this.username;
  }
}
