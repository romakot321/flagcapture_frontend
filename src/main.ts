import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

declare global {
  interface Window {
    Telegram: any;
  }
}

const app = window.Telegram.WebApp;
app.expand();
app.ready();
app.disableVerticalSwipes();
app.requestFullscreen();
document.body.style.overflowY = 'hidden';
document.body.style.marginTop = `5px`;
document.body.style.height = window.innerHeight + 5 + "px";
document.body.style.paddingBottom = `5px`;
window.scrollTo(5, 5);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
