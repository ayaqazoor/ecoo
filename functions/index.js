const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cloud Function to send notifications when a new order is placed
exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const userId = order.userId;
    const orderPrice = order.totalPrice;

    // Get user's push token
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const token = userDoc.data().expoPushToken;

    if (token) {
      // Send notification to user
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          sound: 'default',
          title: 'Order Received',
          body: `Thank you for shopping at M&H Store! Your order total is ${orderPrice} ILS.`,
          data: { orderId: context.params.orderId },
        }),
      });

      // Send notification to admin
      const adminsRef = admin.firestore().collection('admins');
      const adminsSnapshot = await adminsRef.get();

      await Promise.all(
        adminsSnapshot.docs.map(async (adminDoc) => {
          const adminToken = adminDoc.data().expoPushToken;
          if (adminToken) {
            const userData = await admin.firestore().doc(`users/${userId}`).get();
            const userName = userData.data().fullName;
            
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: adminToken,
                sound: 'default',
                title: 'New Order',
                body: `New order received from user: ${userName}.`,
                data: { orderId: context.params.orderId },
              }),
            });
          }
        })
      );
    }
  });

// Cloud Function to send notifications when a new product is added
exports.sendNewProductNotification = functions.firestore
  .document('products/{productId}')
  .onCreate(async (snap, context) => {
    const usersRef = admin.firestore().collection('users');
    const usersSnapshot = await usersRef.get();

    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const token = userDoc.data().expoPushToken;
        if (token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token,
              sound: 'default',
              title: 'New Product',
              body: 'A new product has been added to M&H Store! Discover it now!',
              data: { productId: context.params.productId },
            }),
          });
        }
      })
    );
  });

// Cloud Function to send notifications when a new offer is added
exports.sendNewOfferNotification = functions.firestore
  .document('offers/{offerId}')
  .onCreate(async (snap, context) => {
    const usersRef = admin.firestore().collection('users');
    const usersSnapshot = await usersRef.get();

    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const token = userDoc.data().expoPushToken;
        if (token) {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: token,
              sound: 'default',
              title: 'New Offer',
              body: 'New offer available now at M&H Store! Check it out before it’s gone!',
              data: { offerId: context.params.offerId },
            }),
          });
        }
      })
    );
  });
