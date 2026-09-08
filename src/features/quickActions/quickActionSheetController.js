// Lightweight singleton so any part of the app (e.g. the tab bar) can open
// the Quick Action sheet without prop-drilling a ref through navigators.
let sheetRef = null;

export const quickActionSheetController = {
  register(ref) {
    sheetRef = ref;
  },
  open() {
    sheetRef?.present();
  },
  close() {
    sheetRef?.dismiss();
  },
};