import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfExtractionService {
  imageUrl: string;
  public images: string[] = [];
  public sizes: number[] = [];
  public imagePaths: any[] = [];
  public text: string = '';


  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
    this.imagePaths = [];
  }

  findJpegStartSignatures(byteArray: Uint8Array): number[] {
    const firstBeginSignatureSymbol = 0xff;
    const secondBeginSignatureSymbol = 0xd8;

    const indexes: number[] = [];
    byteArray.forEach((byte, index) => {
      if (byte === firstBeginSignatureSymbol &&
        byteArray[index + 1] === secondBeginSignatureSymbol &&
        byteArray[index + 2] === firstBeginSignatureSymbol &&
        (byteArray[index + 3] >= 0xe0 && byteArray[index + 3] <= 0xef)) {
        indexes.push(index);
      }
    });
    return indexes;
  }


  extractText(file: File): Promise<string> {
    this.sizes = []
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const pdfData = new Uint8Array(event.target.result);
        this.extractJpegImagesFromPdf(pdfData, "/");

        pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf: any) => {
          const totalPages = pdf.numPages;
          const textContent: string[] = [];
          let pagePromises: Promise<pdfjsLib.PDFPageProxy>[] = [];

          for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            pagePromises.push(pdf.getPage(pageNumber));
          }

          Promise.all(pagePromises).then((pages: pdfjsLib.PDFPageProxy[]) => {
            const pageTextPromises: Promise<string>[] = [];

            pages.forEach(async (page: pdfjsLib.PDFPageProxy) => {

              pageTextPromises.push(page.getTextContent().then((textContentData: any) => {
                let lastY, text = '', lastFontSize, lastX = 0;
                for (let i = 0; i < textContentData.items.length; i++) {
                  let item = textContentData.items[i];
                  // add a new line if y position of the current item is below the last item
                  // or if the difference in y is greater than font size (blank line)
                  if (lastY != item.transform[5] && lastFontSize != item.transform[3]) {

                    text += '\n';
                  }
                  //if (Math.abs(lastY - item.transform[5]) > (lastFontSize*1.5)) {
                  //  text += '\n\n';
                  //}
                  if (Math.abs(lastY - item.transform[5]) > (lastFontSize * 1.5) && lastFontSize != item.transform[3]) {
                    text += '\n\n';
                  }
                  if (Math.abs(lastX - item.transform[4]) > (lastFontSize * 2.5)) {
                    text += '\n';
                  }

                  text += item.str + ' ';
                  lastY = item.transform[5];
                  lastX = item.transform[4];
                  //if (lastFontSize < item.transform[3]) {
                  //  text += " ** bigger ** " + item.transform[3];
                  //}
                  //if (lastFontSize > item.transform[3]) {
                  //  text += " ** smaller ** ";
                  //}
                  lastFontSize = item.transform[3]; // keep track of font size
                  this.sizes.push(Math.round(item.transform[3]));
                }
                return text;
              }));

            });

            Promise.all(pageTextPromises).then((pageTexts: string[]) => {
              pageTexts.forEach((pageText: string) => {
                textContent.push(pageText);
              });
              resolve(textContent.join('\n'));
            }).catch((error) => {
              reject(error);
            });
          }).catch((error) => {
            reject(error);
          });
        }).catch((error) => {
          reject(error);
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }




  async extractJpegImagesFromPdf(byteArray: Uint8Array, outputDir: string): Promise<void> {

    this.imagePaths = [];
    const startSignatures = this.findJpegStartSignatures(byteArray);
    try {
      //  const promises = startSignatures.map((startIndex, i) => {
      // const imageBytes = byteArray.slice(startIndex);
      // const blob = new Blob([imageBytes], { type: 'image/jpeg' });
      // this.imageUrl = URL.createObjectURL(blob);
      // this.images.push(this.imageUrl);

      //    var image = new Image();
      //    image.src = URL.createObjectURL(blob);
      //    document.getElementById("imageView").appendChild(image);


      //    const formData = new FormData();
      //    formData.append('image', blob, `image_${i}.jpg`);

      //    try {
      //      this.http.post(this.baseUrl + "Image/uploadImage", formData).subscribe(
      //        (result: any) => {
      //          if (result.text != "error") {
      //            this.imagePaths.push(result.text)
      //          }
      //          else {
      //            console.log("error writing to file");
      //          }
      //        }, error => console.log(error));

      //      console.log(`Image ${i} uploaded successfully.`, PdfTextExtractionService.imagePaths);
      //    } catch (error) {
      //      console.error(`Failed to upload Image ${i}:`, error);
      //    }
      //  });


      // await Promise.all(promises);
      // console.log('Images extracted successfully');

    }

    catch (error) {
      console.error('Failed to extract images from PDF:', error);
    }


  }




}
