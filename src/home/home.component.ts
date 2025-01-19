import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomComponent } from '../room/room.component';
import { Room } from '../core/models/room';
import { RoomService } from '../core/services/room';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '../core/store';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RoomComponent,
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <form [formGroup]="authForm" (submit)="saveCredentials()">
      <div>
        <input id="username" type="text" placeholder="Username" formControlName="username">
        <button type="submit" class="primary">Apply now</button>
      </div>
    </form>
    <form [formGroup]="roomForm" (submit)="createRoom()">
      <div>
        <input id="name" type="text" placeholder="Room name" formControlName="name">
        <button type="submit" class="primary">Create room</button>
      </div>
    </form>
    <section class="results">
      <app-room *ngFor="let room of roomList" [room]="room"></app-room>
    </section>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  roomService: RoomService = inject(RoomService);
  store: Store = inject(Store);

  roomList: Room[] = [];
  authForm = new FormGroup({
    username: new FormControl('')
  });
  roomForm = new FormGroup({
    name: new FormControl('')
  });

  constructor() {
    this.roomService.list().then((rooms) => { console.log(rooms); this.roomList = rooms });
  }

  ngOnInit() {
    let creds = this.store.getCredentials();
    if (creds)
      this.authForm.get('username')?.setValue(creds);
  }

  saveCredentials() {
    this.store.setCredentials(this.authForm.value.username ?? undefined);
  }

  createRoom() {
    if (!this.roomForm.value.name)
      return;
    this.roomService.create(this.roomForm.value.name).then(
      (room) => { this.roomList.push(room) }
    );
  }
}
