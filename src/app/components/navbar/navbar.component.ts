import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  onModeChange() {

    const htmlElement = document.getElementById('app');
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme === 'acid') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.setAttribute('data-theme', 'acid');
    }
  }

}
