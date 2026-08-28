import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { APP_ROLES, ROLE_LABELS } from '../../models/auth.model';
import { MenuItem } from '../../models/menu-item.model';
import { AuthService } from '../../services/auth/auth.service';
import { MenuComponent } from '../menu/menu.component';
import { SubmenuComponent } from '../submenu/submenu.component';

/**
 * App shell: sidebar menu, submenu and top bar stay mounted across
 * navigation; the actual page content (list / add form) renders through
 * the router outlet below, driven entirely by app.routes.ts.
 */
@Component({
  selector: 'app-payment-hub',
  standalone: true,
  imports: [MenuComponent, RouterOutlet, SubmenuComponent, TuiAvatar, TuiIcon],
  templateUrl: './payment-hub.component.html',
  styleUrl: './payment-hub.component.scss',
})
export class PaymentHubComponent {
  protected readonly auth = inject(AuthService);

  protected sidebarCollapsed = false;
  protected submenuCollapsed = false;

  protected readonly sidebar: MenuItem[] = [
    { icon: '@tui.layout-grid', label: 'Tổng quan' },
    { icon: '@tui.sliders-horizontal', label: 'Tham số' },
    { icon: '@tui.zap', label: 'Realtime' },
    { icon: '@tui.zap-off', label: 'Non-Realtime' },
    { icon: '@tui.database', label: 'BIAP' },
    { icon: '@tui.shield', label: 'SWIFT' },
    { icon: '@tui.git-branch', label: 'Kênh nối' },
    { icon: '@tui.list-checks', label: 'Tham số', active: true },
    { icon: '@tui.search-check', label: 'Tra soát' },
    { icon: '@tui.file-text', label: 'Báo cáo' },
  ];

  protected readonly submenu: string[] = [
    'Cấu phần xử lý',
    'Tham số danh mục theo n...',
    'Kênh thanh toán',
    'Mã loại điện tra soát',
    'Tiêu chí dừng phần kênh t...',
    'Tạm dừng phần kênh',
    'Cấu hình định tuyến kênh...',
    'Kênh phân phối/ứng dụng',
    'Tiêu chí chấm điểm cho k...',
  ];

  protected activeSubmenu = 'Tham số danh mục theo n...';

  /** 2 ký tự đầu username, dùng làm chữ viết tắt trên avatar. */
  protected get userInitials(): string {
    return (this.auth.username() ?? '??').slice(0, 2).toUpperCase();
  }

  /** Nếu user có cả 2 role thì nối lại, vd "Người lập đề xuất, Người kiểm soát". */
  protected get roleLabel(): string {
    const labels = this.auth.roles().map((role) => ROLE_LABELS[role] ?? role);
    return labels.length > 0 ? labels.join(', ') : 'Chưa gán quyền';
  }

  protected readonly APP_ROLES = APP_ROLES;

  protected logout(): void {
    this.auth.logout();
  }
}