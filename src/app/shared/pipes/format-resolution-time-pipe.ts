import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatResolutionTime',
  standalone: true
})
export class FormatResolutionTimePipe implements PipeTransform {

  transform(hours: number | null | undefined): string {
    if (!hours || hours === null || hours === undefined) {
      return 'N/A';
    }

    const hoursValue = parseFloat(hours.toString());

    if (hoursValue < 1) {
      const minutes = Math.round(hoursValue * 60);
      return `${minutes} minutos`;
    }

    if (hoursValue < 24) {
      return `${hoursValue.toFixed(1)} horas`;
    }

    const days = Math.floor(hoursValue / 24);
    const remainingHours = parseFloat((hoursValue % 24).toFixed(1));

    if (remainingHours === 0) {
      return `${days} ${days === 1 ? 'día' : 'días'}`;
    }

    return `${days} ${days === 1 ? 'día' : 'días'}, ${remainingHours} horas`;
  }

}
