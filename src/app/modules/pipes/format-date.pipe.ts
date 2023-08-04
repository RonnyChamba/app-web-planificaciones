import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(dateString: string): string {
    const date = new Date(Date.parse(dateString));
    return date.toLocaleDateString();
  }

}



@Pipe({
  name: 'trimText'
})
export class TrimText implements PipeTransform {

  transform(text: string, size?: number): string {

    size = size || 10;

    if (text.length > size) {
      return text.substring(0, size) + '...';
    }
    return text;
  
  }

}



@Pipe({
  name: 'countUploadPlanification'
})
export class CountUploadPlanification implements PipeTransform {

  transform( detailsUpload: number[], operationType: string): number {

    if (!detailsUpload) return 0;


    let valueReturn = 0;

    switch (operationType) {
      case 'countUpload':

          valueReturn  = detailsUpload.map((e: any) => e.countUpload).reduce((a: any, b: any) => parseInt(a) + parseInt(b), 0);
      break;

      case "countSuccess":
      // filter by status and count the number of elements
      valueReturn = detailsUpload.filter((e: any) => e.status).length;
      break;

      case "countWrong":
      // filter by status and count the number of elements
      valueReturn = detailsUpload.filter((e: any) => !e.status).length;
      break;


    }
      return valueReturn;
  
  }

}