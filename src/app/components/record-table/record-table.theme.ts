import { themeQuartz } from 'ag-grid-community';

/**
 * AG Grid's Theming API accepts plain CSS strings for its params, so we
 * point every param straight at the same CSS custom properties Taiga UI
 * uses (see src/styles.scss) — one source of truth for color/radius/font
 * instead of a second hard-coded palette.
 */
export const paymentHubGridTheme = themeQuartz.withParams({
  accentColor: 'var(--tui-background-accent-1)',
  backgroundColor: 'var(--tui-background-base)',
  foregroundColor: 'var(--tui-text-primary)',
  borderColor: 'var(--tui-border-normal)',
  borderRadius: 'var(--tui-radius-m)',
  wrapperBorderRadius: 0,
  wrapperBorder: false,
  headerBackgroundColor: 'var(--tui-background-neutral-1)',
  headerTextColor: 'var(--tui-text-secondary)',
  headerFontWeight: 500,
  rowHoverColor: 'var(--tui-background-neutral-1)',
  selectedRowBackgroundColor: 'rgba(17, 112, 111, 0.08)',
  oddRowBackgroundColor: 'var(--tui-background-base)',
  fontFamily: 'inherit',
  fontSize: 12.5,
  headerFontSize: 12.5,
  headerHeight: 44,
  rowHeight: 48,
  spacing: 8,
});
