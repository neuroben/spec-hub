import type { ThemeConfig } from 'antd';

// A mockupról mintavételezett brand-zöld.
// Egyetlen helyen cserélhető — minden Ant Design komponens innen kapja.
export const brandPrimary = '#1f9d66';
export const brandPrimaryBg = '#e6f7ef';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: brandPrimary,
  },
  components: {
    Menu: {
      itemColor: '#262626',
      itemHoverColor: brandPrimary,
      itemSelectedColor: brandPrimary,
      itemSelectedBg: brandPrimaryBg,
      horizontalItemSelectedColor: brandPrimary,
      horizontalItemSelectedBg: brandPrimaryBg,
    },
  },
};
