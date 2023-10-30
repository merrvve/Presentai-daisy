import { Component, ElementRef, ViewChild } from '@angular/core';
import { gsap } from "gsap";
import { iUserInput } from '../../models/iUserInput';
import { PdfExtractionService } from '../../services/pdf-extraction.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {

  public userTextInputs: iUserInput[] = [];
  public inputId = 1;
  constructor(private pdfService: PdfExtractionService) {
  
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop();

      if (extension) {
        if (extension.toLowerCase() === 'pdf') {
          // It's a PDF file, continue processing
          console.log('File is a PDF.');
          this.pdfService.extractText(file)
            .then((text: string) => {
              console.log(text);
              this.pdfService.text = text;
              this.userTextInputs.push({ id: this.inputId, text: text });
              this.addChat(true, { id: this.inputId, text: text });
              this.inputId += 1;
              
            });
        } else {
          // File has the wrong extension, handle as needed
          console.log('File is not a PDF.');
        }
      }
    }
  }

  addChat(isUser: boolean, text: iUserInput) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'chat chat-end');
    let secondDiv = document.createElement('div');
    secondDiv.setAttribute('class', 'chat-bubble');
    secondDiv.setAttribute('style','white-space: pre-line;')
    secondDiv.innerHTML = text.text; 
    newDiv.appendChild(secondDiv);
    document.getElementById('chatSpace').appendChild(newDiv);
    this.scrollToEnd(newDiv.scrollHeight);
   // document.getElementById('chatSpace').
  }


  scrollToEnd(scrollSize: number) {
    let chatSpace = document.getElementById('chatSpace');
    chatSpace.scrollTop = chatSpace.scrollHeight;
  }

  increaseInputId() {
    this.inputId += 1;
  }

  ngAfterViewInit() {
  }
  //ngAfterViewInit() {
  //  let tl = gsap.timeline();
  //  //let kutu = document.getElementById('kutu');
  //  //tl.to(kutu, {
  //  //  duration: 2,
  //  //  x: 300,
  //  //  y: 200,
  //  //  rotation: 360,
  //  //  scale: 1.5,
  //  //  opacity: 0.5
  //  //})
  //  //  .to(kutu, { duration: 1, y: 200, backgroundColor: "red" })
  //  //  .to(kutu, { duration: 2, scale: 5 });
  //  let hero1 = document.getElementById('hero1');
  //  tl.to(hero1, {
  //    //scale: 1,    // Start from the original scale
  //    y: '100%',   // Starts from the center
  //    x: '0%',   // Starts from the center
  //  })
  //    .to(hero1,{
  //      duration: 2,      // Animation duration of 2 seconds
  //      //scale: 0.5,      // Scale it to 0.5
  //      x: '0%',         // Move it to the left edge
  //      y: '0%',         // Move it to the top edge
  //      ease: "power3.out" // Easing function for smoother animation
  //    });

  //}
}
