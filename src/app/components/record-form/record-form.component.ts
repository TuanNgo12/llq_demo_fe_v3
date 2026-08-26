import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiDropdown,
  TuiError,
  TuiIcon,
  TuiInput,
  TuiLabel,
  TuiTextfield,
  TuiTitle,
  // tuiDateFormatProvider,
  TuiDateFormat,
  tuiValidationErrorsProvider,
} from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiInputDateTime, TuiMultiSelect } from '@taiga-ui/kit';
import { GroupCategoryInput, GROUP_CATEGORY_STATUS } from '../../models/group-category.model';

@Component({
  selector: 'app-ph-record-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TuiButton,
    TuiChevron,
    TuiDataListWrapper,
    TuiDropdown,
    TuiError,
    TuiIcon,
    TuiInput,
    TuiLabel,
    TuiSelect,
    TuiTextfield,
    TuiTitle,
    TuiDateFormat,
    TuiInputDateTime,
    TuiMultiSelect
  ],
  providers: [
    // tuiDateFormatProvider({
    //   mode: DATE_MODE,
    //   separator: DATE_SEPARATOR,
    // }),
    tuiValidationErrorsProvider({
      required: 'Không được để trống',
      duplicate: 'Dữ liệu đã tồn tại',
      effectivePast: 'Ngày hiệu lực phải lớn hơn hoặc bằng thời điểm hiện tại',
      endPast: 'Ngày hết hiệu lực phải lớn hơn hoặc bằng thời điểm hiện tại',
      endBeforeEffective: 'Ngày hết hiệu lực phải lớn hơn ngày hiệu lực',
    }),
  ],
  templateUrl: './record-form.component.html',
  styleUrl: './record-form.component.scss',
})
export class RecordFormComponent implements OnChanges {

  @Input() componentCodeOptions: string[] = [];

  @Input() heading = 'Thêm mới tham số danh mục theo nhóm';

  @Input() initialValue?: GroupCategoryInput;

  @Input() duplicateField?: string;

  @Input() lockParamType = false;

  @Output() readonly save = new EventEmitter<GroupCategoryInput>();

  @Output() readonly saveAndSubmit = new EventEmitter<GroupCategoryInput>();

  @Output() readonly cancel = new EventEmitter<void>();

  private readonly fb = new FormBuilder();

  protected readonly form = this.fb.group({
    id: this.fb.control<number | null>(null),
    paramType: this.fb.nonNullable.control('', Validators.required),
    paramValue: this.fb.nonNullable.control('', Validators.required),
    paramName: this.fb.nonNullable.control('', Validators.required),
    componentCode: this.fb.nonNullable.control<string[]>([], Validators.required),
    effectiveDate: this.fb.control<[TuiDay, TuiTime | null] | null>(
      null,
      Validators.required
    ),

    endEffectiveDate: this.fb.control<[TuiDay, TuiTime | null] | null>(
      null
    ),
    description: this.fb.nonNullable.control(''),
  },
    {
      validators: this.dateValidator(),
    }
  );

  private parseDateTime(value: string): [TuiDay, TuiTime | null] | null {
    if (!value) {
      return null;
    }

    const [datePart, timePart] = value.split(' ');

    const [day, month, year] = datePart.split('/').map(Number);

    let time: TuiTime | null = null;

    if (timePart) {
      const [hour, minute, second] = timePart.split(':').map(Number);
      time = new TuiTime(hour, minute, second);
    }

    return [
      new TuiDay(year, month - 1, day),
      time,
    ];
  }

  private parseDate(value: [TuiDay, TuiTime | null]): Date {

    const [day, time] = value;

    return new Date(
      day.year,
      day.month,
      day.day,
      time?.hours ?? 0,
      time?.minutes ?? 0,
      time?.seconds ?? 0,
    );
  }

  private formatDateTime(
    value: [TuiDay, TuiTime | null] | null,
  ): string {

    if (!value) {
      return '';
    }

    const [day, time] = value;

    const pad = (n: number): string =>
      String(n).padStart(2, '0');

    return `${pad(day.day)}/${pad(day.month + 1)}/${day.year} `
      + `${pad(time?.hours ?? 0)}:`
      + `${pad(time?.minutes ?? 0)}:`
      + `${pad(time?.seconds ?? 0)}`;
  }

  private dateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {

      const effectiveCtrl = group.get('effectiveDate');
      const endCtrl = group.get('endEffectiveDate');

      const effective = effectiveCtrl?.value as [TuiDay, TuiTime | null] | null;
      const end = endCtrl?.value as [TuiDay, TuiTime | null] | null;

      // Xóa các lỗi do validator này tạo ra ở lần validate trước
      this.removeError(effectiveCtrl, 'effectivePast');
      this.removeError(endCtrl, 'endPast');
      this.removeError(endCtrl, 'endBeforeEffective');

      if (!effective) {
        return null;
      }

      const effectiveDate = this.parseDate(effective);
      const now = new Date();

      if (effectiveDate < now) {
        effectiveCtrl?.setErrors({
          ...effectiveCtrl.errors,
          effectivePast: true,
        });
      }

      if (end) {
        const endDate = this.parseDate(end);

        if (endDate < now) {
          endCtrl?.setErrors({
            ...endCtrl.errors,
            endPast: true,
          });
        }

        if (endDate <= effectiveDate) {
          endCtrl?.setErrors({
            ...endCtrl.errors,
            endBeforeEffective: true,
          });
        }
      }

      return null;
    };
  }

  setDuplicateError(fields: string[]): void {
    for (const field of fields) {
      const control = this.form.get(field);

      if (!control) {
        continue;
      }

      control.setErrors({
        ...control.errors,
        duplicate: true,
      });

      control.markAsTouched();
      control.markAsDirty();
    }
  }

  private removeError(control: AbstractControl | null, error: string): void {
    if (!control?.errors) {
      return;
    }

    const errors = { ...control.errors };

    delete errors[error];

    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      const { effectiveDate, endEffectiveDate, componentCode, ...rest } = this.initialValue;

      this.form.patchValue({
        ...rest,
        componentCode: componentCode
          ? componentCode.split(',').map(item => item.trim())
          : [],
        effectiveDate: this.parseDateTime(effectiveDate),
        endEffectiveDate: this.parseDateTime(endEffectiveDate),
      });
    }

    if (changes['lockParamType']) {
      if (this.lockParamType) {
        this.form.controls.paramType.disable();
      } else {
        this.form.controls.paramType.enable();
      }
    }
  }

  protected onSave(): void {
    if (!this.validate()) {
      return;
    }

    this.save.emit(this.toGroupCategoryInput());
  }

  protected onSaveAndSubmit(): void {
    if (!this.validate()) {
      return;
    }

    this.saveAndSubmit.emit(this.toGroupCategoryInput());
  }

  private toGroupCategoryInput(): GroupCategoryInput {
    const value = this.form.getRawValue();

    return {
      ...value,
      id: value.id || 0,
      status: this.initialValue?.status ?? GROUP_CATEGORY_STATUS.NEW,
      componentCode: value.componentCode.join(','),
      effectiveDate: this.formatDateTime(value.effectiveDate as any),

      endEffectiveDate: this.formatDateTime(value.endEffectiveDate as any),
    };
  }

  private validate(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    return true;
  }
}
