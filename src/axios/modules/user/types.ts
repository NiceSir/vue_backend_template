/** 用户资料接口返回的管理账号信息及菜单。 */
export interface UserInfo {
    admin_id: number;
    authority_area: string;
    avatar: string;
    created_at: string;
    deleted_at: string | null;
    department: string;
    email: string;
    is_super: 0 | 1;
    name: string;
    op_per_user: string;
    op_user: string;
    phone: string;
    updated_at: string;
    menu: Array<MenuInfo>;
}

/**
 * 菜单管理
 */
export interface MenuInfo {
    path: string;
    path_id: number;
    pid: number;
    title: string;
    children: MenuInfo | null;
}
