import { GroupCategoryStatus, GroupCategoryActive } from '../models/group-category.model';

export interface FilterValues {
  paramType: string;
  paramValue: string;
  paramName: string;
  componentCode: string;
  status: GroupCategoryStatus | null;
  isActive: GroupCategoryActive | null;
  pageNo: number;
  pageSize: number;
}
