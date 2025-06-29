import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

console.log('Starting Angular application bootstrap...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Angular application bootstrapped successfully!');
  })
  .catch((err) => {
    console.error('❌ Error during Angular bootstrap:', err);
  });
