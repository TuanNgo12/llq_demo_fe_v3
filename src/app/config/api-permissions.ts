import { APP_ROLES, AppRole } from '../models/auth.model';

/**
 * Bảng phân quyền URL — PHẢI khớp 1-1 với @PreAuthorize ở
 * GroupCategoryController (BE). Đây không phải là lớp bảo mật thật (bảo mật
 * thật nằm ở BE), mà là nguồn dữ liệu duy nhất để FE:
 *  - Ẩn/hiện nút bấm theo đúng quyền (UX, tránh việc bấm xong mới bị 403).
 *  - Tra cứu nhanh "role này gọi được URL nào" khi cần.
 *
 * roles: [] nghĩa là chỉ cần đăng nhập (không phân biệt MAKER/CHECKER),
 * khớp với các endpoint không có @PreAuthorize ở BE (chỉ có
 * anyRequest().authenticated() từ SecurityConfig).
 */
export interface ApiPermission {
    method: 'GET' | 'POST';
    path: string;
    roles: AppRole[] | [];
    description: string;
}

export const GROUP_CATEGORY_PERMISSIONS: ApiPermission[] = [
    { method: 'GET', path: '/api/group-category', roles: [], description: 'Xem danh sách' },
    { method: 'POST', path: '/api/group-category/add', roles: [APP_ROLES.MAKER], description: 'Tạo mới đề xuất' },
    { method: 'POST', path: '/api/group-category/update', roles: [APP_ROLES.MAKER], description: 'Chỉnh sửa đề xuất' },
    { method: 'POST', path: '/api/group-category/delete', roles: [APP_ROLES.MAKER], description: 'Xóa đề xuất' },
    { method: 'POST', path: '/api/group-category/panding', roles: [APP_ROLES.MAKER], description: 'Gửi duyệt' },
    { method: 'POST', path: '/api/group-category/cancel', roles: [APP_ROLES.MAKER], description: 'Hủy phê duyệt' },
    { method: 'POST', path: '/api/group-category/approve', roles: [APP_ROLES.CHECKER], description: 'Phê duyệt' },
    { method: 'POST', path: '/api/group-category/reject', roles: [APP_ROLES.CHECKER], description: 'Từ chối' },
    {
        method: 'POST',
        path: '/api/group-category/update-status',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Cập nhật trạng thái hàng loạt (tổng quát)',
    },
    {
        method: 'POST',
        path: '/api/group-category/update-status-list',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Cập nhật trạng thái hàng loạt theo id',
    },
    {
        method: 'POST',
        path: '/api/group-category/search',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Tìm kiếm (JPA Specification)',
    },
    {
        method: 'POST',
        path: '/api/group-category/search-native-query',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Tìm kiếm (native query)',
    },
    {
        method: 'POST',
        path: '/api/group-category/search-procedure',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Tìm kiếm (stored procedure)',
    },
    {
        method: 'POST',
        path: '/api/group-category/export-excel',
        roles: [APP_ROLES.MAKER, APP_ROLES.CHECKER],
        description: 'Xuất Excel',
    },
];

/** Trả về true nếu 1 trong các role đã cho được phép gọi endpoint này. */
export function canAccess(permission: ApiPermission, userRoles: string[]): boolean {
    if (permission.roles.length === 0) {
        return true; // chỉ cần đăng nhập
    }
    return permission.roles.some((role) => userRoles.includes(role));
}
