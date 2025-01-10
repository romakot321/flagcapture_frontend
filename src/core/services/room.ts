import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomList: Room[] = [
    {
      id: 1,
      name: "Test room",
      players: 2,
    },
    {
      id: 2,
      name: "Test room",
      players: 2,
    },
    {
      id: 3,
      name: "Test room",
      players: 2,
    },
    {
      id: 4,
      name: "Test room",
      players: 2,
    },
  ];

  constructor() { }

  list(): Room[] {
    return this.roomList;
  }

  get(id: number): Room | undefined {
    return this.roomList.find(room => room.id === id);
  }
}
