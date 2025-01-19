export interface RoomUser {
  name: string;
}


export interface Room {
  id: number;
  name: string;
  users: RoomUser[];
}
