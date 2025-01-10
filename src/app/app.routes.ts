import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { GameComponent } from '../game/game.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: "Rooms"
  },
  {
    path: 'room/:id',
    component: GameComponent,
    title: "Game"
  }
];
