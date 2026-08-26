export const GROUP_CATEGORY_ACTIVE = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

export type GroupCategoryActive = (typeof GROUP_CATEGORY_ACTIVE)[keyof typeof GROUP_CATEGORY_ACTIVE];

export const GROUP_CATEGORY_DISPLAY = {
  DELETE: 1,
  NOT_DELETE: 2,
} as const;

export type GroupCategoryDisplay = (typeof GROUP_CATEGORY_DISPLAY)[keyof typeof GROUP_CATEGORY_DISPLAY];

export const DISPLAY_LABEL: Record<GroupCategoryDisplay, string> = {
  [GROUP_CATEGORY_DISPLAY.DELETE]: 'Có thể xóa',
  [GROUP_CATEGORY_DISPLAY.NOT_DELETE]: 'Không thể xóa',
};

export type GroupCategoryStatus =
  (typeof GROUP_CATEGORY_STATUS)[keyof typeof GROUP_CATEGORY_STATUS];


export const GROUP_CATEGORY_STATUS = {
  NEW: 1,
  PENDING: 3,
  APPROVED: 4,
  REJECTED: 5,
  CANCELLED: 7,
} as const;

const STATUS_LABEL: Record<GroupCategoryStatus, string> = {
  [GROUP_CATEGORY_STATUS.NEW]: 'Tạo mới',
  [GROUP_CATEGORY_STATUS.PENDING]: 'Chờ duyệt',
  [GROUP_CATEGORY_STATUS.APPROVED]: 'Đã duyệt',
  [GROUP_CATEGORY_STATUS.REJECTED]: 'Từ chối',
  [GROUP_CATEGORY_STATUS.CANCELLED]: 'Hủy duyệt',
};

export interface GroupCategoryStatusConfig {
  color: string;
  background: string;
}
export const STATUS_CONFIG: Record<
  GroupCategoryStatus,
  GroupCategoryStatusConfig
> = {
  [GROUP_CATEGORY_STATUS.NEW]: {
    color: '#00838F',
    background: '#E0F7FA',
  },

  [GROUP_CATEGORY_STATUS.PENDING]: {
    color: '#D88900',
    background: '#FFF3D6',
  },

  [GROUP_CATEGORY_STATUS.APPROVED]: {
    color: '#00A86B',
    background: '#DFF7E9',
  },

  [GROUP_CATEGORY_STATUS.REJECTED]: {
    color: '#D32F2F',
    background: '#FDE4E4',
  },

  [GROUP_CATEGORY_STATUS.CANCELLED]: {
    color: '#666666',
    background: '#E8E8E8',
  },
};

export function groupCategoryStatusLabel(
  status: GroupCategoryStatus | number | string,
): string {
  const numStatus = Number(status) as GroupCategoryStatus;

  return STATUS_LABEL[numStatus] ?? String(status);
}


export function groupCategoryStatusConfig(
  status: GroupCategoryStatus | number | string,
): GroupCategoryStatusConfig {
  const numStatus = Number(status) as GroupCategoryStatus;

  return (
    STATUS_CONFIG[numStatus] ?? {
      color: '#666666',
      background: '#EEEEEE',
      icon: '●',
    }
  );
}

export type GroupCategoryBadgeAppearance = 'positive' | 'negative' | 'warning' | 'neutral';

const ACTIVE_LABEL: Record<GroupCategoryActive, string> = {
  [GROUP_CATEGORY_ACTIVE.INACTIVE]: 'Không hoạt động',
  [GROUP_CATEGORY_ACTIVE.ACTIVE]: 'Hoạt động',
};

export function groupCategoryActiveLabel(active: GroupCategoryActive | number | string): string {
  const numActive = Number(active) as GroupCategoryActive;
  return ACTIVE_LABEL[numActive] ?? String(active);
}

export interface GroupCategory {
  id: number;
  paramName: string;
  paramValue: string;
  paramType: string;
  description: string;
  componentCode: string;
  status: GroupCategoryStatus;
  isActive: GroupCategoryActive;
  isDisplay: GroupCategoryDisplay;
  newData: string;
  effectiveDate: string;
  endEffectiveDate: string;
}

export interface GroupCategoryInput {
  id: number;
  paramType: string;
  paramValue: string;
  paramName: string;
  status: GroupCategoryStatus;
  componentCode: string;
  effectiveDate: string;
  endEffectiveDate: string;
  description: string;
}

export function toGroupCategoryInput(row: GroupCategory): GroupCategoryInput {
  return {

    paramType: row.paramType,
    paramValue: row.paramValue,
    paramName: row.paramName,
    status: row.status,
    componentCode: row.componentCode,
    effectiveDate: row.effectiveDate,
    endEffectiveDate: row.endEffectiveDate === '-' ? '' : row.endEffectiveDate,
    description: row.description,
    id: row.id,
  };
}
