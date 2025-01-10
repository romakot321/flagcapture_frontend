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

  constructor() {
    this.roomList = this.roomService.list();
  }

  saveCredentials() {
    this.store.setCredentials(this.authForm.value.username ?? undefined);
  }
}
