import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { MenuItem } from '../../models/menu-item.model';
import { MenuComponent } from '../menu/menu.component';
import { SubmenuComponent } from '../submenu/submenu.component';
// Đổi lại đường dẫn cho khớp vị trí thật của AuthService trong project của bạn
import { AuthService } from '../../services/auth/auth.service';

/**
 * App shell: sidebar menu, submenu and top bar stay mounted across
 * navigation; the actual page content (list / add form) renders through
 * the router outlet below, driven entirely by app.routes.ts.
 */
@Component({
  selector: 'app-payment-hub',
  standalone: true,
  imports: [
    MenuComponent,
    RouterOutlet,
    SubmenuComponent,
    TuiAvatar,
    TuiIcon,
    TuiDropdown,
    TuiDataList,
  ],
  templateUrl: './payment-hub.component.html',
  styleUrl: './payment-hub.component.scss',
})
export class PaymentHubComponent {
  private readonly authService = inject(AuthService);

  protected sidebarCollapsed = false;
  protected submenuCollapsed = false;
  // Không dùng signal() ở đây vì [(tuiDropdownOpen)] là two-way binding thường
  // (mở rộng thành userMenuOpen = $event) — gán trực tiếp vào WritableSignal sẽ sai kiểu.
  protected userMenuOpen = false;

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

  protected logout(): void {
    this.userMenuOpen = false;
    this.authService.logout(); // xóa token + tự điều hướng về /login
  }
}