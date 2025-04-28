import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
admin.initializeApp();

// إشعار للإدمن عند إضافة طلب جديد
export const notifyOnNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data?.data();
  if (!order) return null;

  const adminsSnap = await admin.firestore().collection("users").where("role", "==", "admin").get();
  const tokens: string[] = [];
  adminsSnap.forEach(doc => {
    const data = doc.data();
    if (data.fcmToken) tokens.push(data.fcmToken);
  });

  if (tokens.length > 0) {
    const payload = {
      notification: {
        title: "طلب جديد",
        body: `طلب جديد من ${order.customerName || "عميل"}`
      },
      data: {
        orderId: event.params.orderId,
        type: "new_order"
      }
    };
    await admin.messaging().sendEachForMulticast({
      tokens,
      ...payload,
    });
  }
  return null;
});

// إشعار للمستخدم عند تأكيد الطلب
export const notifyOnOrderConfirmed = onDocumentUpdated("orders/{orderId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  if (!before || !after) return null;

  if (before.status !== "completed" && after.status === "completed") {
    const userSnap = await admin.firestore().collection("users").doc(after.userId).get();
    const userData = userSnap.data();
    if (userData && userData.fcmToken) {
      const payload = {
        notification: {
          title: "تم تأكيد طلبك",
          body: "تم تأكيد طلبك وسيتم شحنه قريباً"
        },
        data: {
          orderId: event.params.orderId,
          type: "order_confirmed"
        }
      };
      await admin.messaging().sendEachForMulticast({
        tokens: [userData.fcmToken],
        ...payload,
      });
    }
  }
  return null;
});