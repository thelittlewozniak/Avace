import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  @ViewChild('video')
    public video;

    @ViewChild('canvas')
    public canvas;
    public urlPicture: string;
    public constructor(private httpClient: HttpClient) {
    }

    public ngOnInit() { }

    // tslint:disable-next-line:use-life-cycle-interface
    public ngAfterViewInit() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                this.video.nativeElement.srcObject = stream;
                this.video.nativeElement.play();
            });
        }
    }

    public capture() {
        const ctx = this.canvas.nativeElement.getContext('2d');
        ctx.drawImage(this.video.nativeElement, 0, 0, this.video.nativeElement.width, this.video.nativeElement.height);
        const image = this.makeblob(this.canvas.nativeElement.toDataURL());
        console.log(this.canvas.nativeElement.toDataURL());
        this.detectFace(image.blob);
        this.detectSkinColor(image.blob);
    }
    private makeblob(dataURL) {
      const BASE64_MARKER = ';base64,';
      if (dataURL.indexOf(BASE64_MARKER) === -1) {
          // tslint:disable-next-line:no-shadowed-variable
          const parts = dataURL.split(',');
          // tslint:disable-next-line:no-shadowed-variable
          const contentType = parts[0].split(':')[1];
          // tslint:disable-next-line:no-shadowed-variable
          const raw = decodeURIComponent(parts[1]);
          return {
            rawlength: raw.length,
            blob: new Blob([raw], { type: contentType })
          };
      }
      const parts = dataURL.split(BASE64_MARKER);
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
      }
      return {
        rawlength: raw.length,
        blob: new Blob([raw], { type: contentType })
      };
    }
    private detectFace(blob) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : '06965bc5932443169739b85211436868'
      });
      // tslint:disable-next-line:max-line-length
      this.httpClient.post<any>('https://northeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise', blob, {headers})
      .subscribe((result) => {
        console.log(result);
      });
    }
    private detectSkinColor(blob) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Prediction-Key' : 'f784be8c5c4e47618d2aebacfa1a196c'
      });
      // tslint:disable-next-line:max-line-length
      this.httpClient.post<any>('https://northeurope.api.cognitive.microsoft.com/customvision/v3.0/Prediction/326eb7be-9db0-4578-b83a-32f7ede625c9/classify/iterations/Iteration1/image', blob, {headers})
      .subscribe((result) => {
        console.log(result);
      });
    }
}
