declare module '*.css';

declare global {
  interface Navigator {
    usb?: any;
  }
}
