import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../core/models/room';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
  ],
  template: `
    <section class="listing">
      <h2 class="listing-heading">{{ room.name }}</h2>
      <p class="listing-location">{{ room.users.length }} players</p>
      <a [routerLink]="['/room', room.id]">Play</a>
    </section>
  `,
  styleUrl: './room.component.css'
})
export class RoomComponent {
  @Input() room!: Room;
}
