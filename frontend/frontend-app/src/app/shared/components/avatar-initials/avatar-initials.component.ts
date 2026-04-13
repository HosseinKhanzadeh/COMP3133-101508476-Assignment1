import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar-initials',
  template: `
    <div
      class="ems-avatar"
      [style.--avatar-size.px]="size()"
      [attr.aria-label]="fullName()"
    >
      {{ initials() }}
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }
  `,
})
export class AvatarInitialsComponent {
  readonly firstName = input('');
  readonly lastName = input('');
  readonly size = input(96);

  readonly initials = computed(() => {
    const f = this.firstName().trim();
    const l = this.lastName().trim();
    const a = f.charAt(0) || '';
    const b = l.charAt(0) || '';
    return (a + b).toUpperCase() || '?';
  });

  readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`.trim());
}
