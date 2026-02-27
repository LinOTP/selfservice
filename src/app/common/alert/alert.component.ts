import { Component, Input, TemplateRef } from '@angular/core';

type AlertType = 'info' | 'warning' | 'error';

@Component({
    selector: 'app-warning',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    standalone: false
})
export class AlertComponent {

  /**
   * Can be either:
   *  - string (rendered directly), or
   *  - TemplateRef<any> (rendered via ngTemplateOutlet)
   */
  @Input() msgTmpl?: string | TemplateRef<any>;

  @Input() type: AlertType = 'warning';

  get template(): TemplateRef<any> | null {
    return this.msgTmpl instanceof TemplateRef ? this.msgTmpl : null;
  }

  get text(): string {
    return typeof this.msgTmpl === 'string' ? this.msgTmpl : '';
  }

}
