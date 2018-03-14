import Expo from 'exponent-server-sdk';

const expo = new Expo();

export const sendNotifications = async (notifications) => {
  try {
    const tokens = new Set();
    notifications = notifications.filter((n) => {
      if (tokens.has(n.to)) {
        return false;
      } else {
        tokens.add(n.to);
        return true;
      }
    });
    let receipts = await expo.sendPushNotificationsAsync(notifications);
    console.log(receipts);
  } catch (error) {
    console.error(error);
  }
};
