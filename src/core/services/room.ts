import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = "http://localhost:9000"
  }

  async list(): Promise<Room[]> {
    try {
      const response = await fetch(this.apiUrl + "/api/room");
      return (await response.json()).filter((el: Room | null) => el != null);
    } catch (error) {
      console.error("Error room loading:", error);
      return [];
    }
  }

  async create(name: string): Promise<Room> {
    const response = await fetch(this.apiUrl + "/api/room", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({name: name}),
    });
    return await response.json();
  }

  get(id: number): Room | undefined {
    return undefined;
  }
}
