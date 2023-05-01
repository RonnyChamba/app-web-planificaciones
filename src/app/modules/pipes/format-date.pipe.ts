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