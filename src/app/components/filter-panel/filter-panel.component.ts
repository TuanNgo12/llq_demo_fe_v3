import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDropdown, TuiInput, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { FilterValues } from '../../models/filter-values.model';

@Component({
  selector: 'app-ph-filter-panel',
  standalone: true,
  imports: [
    FormsModule,
    TuiButton,
    TuiChevron,
    TuiDataListWrapper,
    TuiDropdown,
    TuiLabel,
    TuiSelect,
    TuiTextfield,
    TuiInput
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {

  @Input({ required: true }) filters!: FilterValues;

  @Input() recordStatuses: string[] = [];

  @Input() activeStatuses: string[] = [];

  @Output() readonly search = new EventEmitter<FilterValues>();

  @Output() readonly reset = new EventEmitter<void>();

  protected onSearch(): void {
    this.search.emit({ ...this.filters });
  }

  protected onReset(): void {
    this.filters = {
      paramType: '',
      paramValue: '',
      paramName: '',
      componentCode: '',
      status: null,
      isActive: null,
      pageNo: 0,
      pageSize: 10,
    };
    this.reset.emit();
  }

}
