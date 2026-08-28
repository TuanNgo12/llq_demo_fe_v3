export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

/** Khớp với AuthResponse record ở BE. */
export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
}

/** Payload chuẩn của JWT do JwtTokenUtils (BE) phát hành. */
export interface JwtPayload {
    sub: string;
    roles: string[];
    iat: number;
    exp: number;
}

/**
 * Khớp với cột ROLE_CODE trong bảng PMH_ROLES.
 * MAKER: tạo mới, chỉnh sửa, gửi duyệt, hủy duyệt.
 * CHECKER: phê duyệt, từ chối.
 */
export const APP_ROLES = {
    MAKER: 'ROLE_MAKER',
    CHECKER: 'ROLE_CHECKER',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

/** Nhãn hiển thị tiếng Việt — khớp cột ROLE_NAME trong PMH_ROLES. */
export const ROLE_LABELS: Record<string, string> = {
    [APP_ROLES.MAKER]: 'Người lập đề xuất',
    [APP_ROLES.CHECKER]: 'Người kiểm soát',
};
