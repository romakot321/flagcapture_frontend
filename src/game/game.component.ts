import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '../core/store';
import { GameService } from './services/game';
import { CanvasService } from './services/canvas';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
  ],
  providers: [
    GameService
  ],
  template: `
    <div class="game-view">
      <canvas id="canvas"></canvas>
    </div>
  `,
  styleUrl: './game.component.css'
})
export class GameComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  store: Store = inject(Store);
  gameService: GameService | undefined = undefined;
  canvasService: CanvasService | undefined = undefined;
  roomId = -1;

  constructor() {
    this.roomId = Number(this.route.snapshot.params['id']);
  }

  ngOnInit() {
    let username = this.store.getCredentials();
    if (username == undefined || this.roomId === -1)
      return;

    this.canvasService = new CanvasService(
      "canvas",
      () => this.gameService?.buyBot(),
      () => this.gameService?.buyWall(),
    );
    this.gameService = new GameService(this.canvasService);
    this.gameService.authorize(username, this.roomId);

    this.canvasService.start();
    this.tick();
  }

  private tick() {
    let ctx = this.canvasService?.newFrame();

    if (ctx) {
      this.gameService?.update();
      this.gameService?.draw(ctx);
    }

    requestAnimationFrame(() => this.tick());
  }
}
