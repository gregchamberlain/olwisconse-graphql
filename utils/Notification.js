import Expo from 'exponent-server-sdk';

const expo = new Expo();

export const sendNotifications = async (notifications) => {
  try {
    let receipts = await expo.sendPushNotificationsAsync(notifications);
    console.log(receipts);
  } catch (error) {
    console.error(error);
  }
}