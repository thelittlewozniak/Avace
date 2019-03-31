import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
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
    private dataFace;
    private skinColor;
    private hairLength;
    private loading = false;
    public constructor(
      private httpClient: HttpClient,
      private snackbar: MatSnackBar
      ) {
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
        this.canvas.nativeElement.toBlob((result) => {
          this.detectFace(result);
          this.loading = true;
        });
    }
    private detectFace(blob) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key' : '06965bc5932443169739b85211436868'
      });
      // tslint:disable-next-line:max-line-length
      this.httpClient.post<any>('https://northeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise', blob, {headers})
      .subscribe((result) => {
        try {
          this.dataFace = result[0].faceAttributes;
          this.detectSkinColor(blob);
        } catch (error) {
          this.loading = false;
          this.snackbar.open('No face detected', 'ok', {duration: 5000});
        }
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
        this.skinColor = result.predictions[0].tagName;
        this.detectHairLength(blob);
      });
    }
    private detectHairLength(blob) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/octet-stream',
        'Prediction-Key' : 'f784be8c5c4e47618d2aebacfa1a196c'
      });
      // tslint:disable-next-line:max-line-length
      this.httpClient.post<any>('https://northeurope.api.cognitive.microsoft.com/customvision/v3.0/Prediction/0bba669e-1c2f-4499-9c3c-c358d8b2b8d5/classify/iterations/Iteration2/image', blob, {headers})
      .subscribe((result) => {
        this.hairLength = result.predictions[0].tagName;
        this.generateAvatar();
      });
    }
    private generateAvatar() {
      this.urlPicture = 'https://avataaars.io/?avatarStyle=Transparent';
      switch (this.skinColor) {
        case 'caucasian':
          this.urlPicture += '&skinColor=Pale';
          break;
          case 'black':
          this.urlPicture += '&skinColor=DarkBrown';
          break;
        case 'azian':
          this.urlPicture += '&skinColor=Yellow';
          break;
        default:
          this.urlPicture += '&skinColor=Light';
          break;
      }
      switch (this.dataFace.glasses) {
        case 'ReadingGlasses':
          this.urlPicture += '&accessoriesType=Prescription02';
          break;
        case 'Sunglasses':
          this.urlPicture += '&accessoriesType=Sunglasses';
          break;
        default:
          this.urlPicture += '&accessoriesType=Blank';
          break;
      }
      this.urlPicture += '&clotheType=CollarSweater&clotheColor=Blue03';
      if (this.dataFace.gender === 'male') {
        console.log(this.dataFace.facialHair.beard);
        if (this.dataFace.facialHair.beard > 0.75) {
          this.urlPicture += '&facialHairType=BeardMajestic';
        } else if (this.dataFace.facialHair.beard > 0.5) {
          this.urlPicture += '&facialHairType=BeardMedium';
        } else if (this.dataFace.facialHair.beard > 0.25) {
          this.urlPicture += '&facialHairType=BeardLight';
        } else {
          if (this.dataFace.facialHair.moustache > 0.5) {
            this.urlPicture += '&facialHairType=MoustacheMagnum';
          } else if (this.dataFace.facialHair.moustache > 0.25) {
            this.urlPicture += '&facialHairType=MoustacheFancy';
          } else {
            this.urlPicture += '&facialHairType=Blank';
          }
        }
        switch (this.dataFace.hair.hairColor) {
            case 'other':
            case 'unknown':
              this.urlPicture += '&facialHairColor=Black';
              break;
            case 'blond':
              this.urlPicture += '&facialHairColor=BlondeGolden';
              break;
            case 'red':
              this.urlPicture += '&facialHairColor=Auburn';
              break;
            case 'white':
              this.urlPicture += '&facialHairColor=SilverGray';
              break;
            default:
              this.urlPicture += '&facialHairColor=' + this.capitalize(this.dataFace.hair.hairColor[0].color);
              break;
          }
      } else {
        this.urlPicture += '&facialHairType=Blank';
      }
      if (this.dataFace.hair.bald <= 0.65) {
        if (this.dataFace.gender === 'male') {
          switch (this.hairLength) {
            case 'short':
              this.urlPicture += '&topType=ShortHairShortFlat';
              break;
            case 'mid':
              this.urlPicture += '&topType=LongHairBob';
              break;
            case 'long':
              this.urlPicture += '&topType=LongHairStraightStrand';
              break;
          }
        } else {
          switch (this.hairLength) {
            case 'short':
              this.urlPicture += '&topType=ShortHairShaggyMullet';
              break;
            case 'mid':
              this.urlPicture += '&topType=LongHairNotTooLong';
              break;
            case 'long':
              this.urlPicture += '&topType=LongHairStraight2';
              break;
          }
        }
        switch (this.dataFace.hair.hairColor) {
            case 'other':
            case 'unknown':
              this.urlPicture += '&hairColor=Black';
              break;
            case 'blond':
              this.urlPicture += '&fhairColor=BlondeGolden';
              break;
            case 'red':
              this.urlPicture += '&hairColor=Auburn';
              break;
            case 'white':
              this.urlPicture += '&hairColor=SilverGray';
              break;
            default:
              this.urlPicture += '&hairColor=' + this.capitalize(this.dataFace.hair.hairColor[0].color);
              break;
          }
      } else {
        this.urlPicture += '&topType=NoHair';
      }
      this.loading = false;
    }
    private capitalize(s) {
      if (typeof s !== 'string') { return ''; }
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
