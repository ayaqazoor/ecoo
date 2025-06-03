import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { db, auth } from "@/config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { Colors } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";

// Define types for order, reward, and loyalty
interface Order {
  id: string;
  total: number;
  userId: string;
  createdAt: any;
  items: any[];
  pointsUsed?: number; // Added to track points used in orders
}

interface Reward {
  id: string;
  name: string; // Maps to 'title' in Firestore
  points: number; // Maps to 'pointsRequired' in Firestore
  description?: string;
  expiryDate?: any;
  imageUrl?: string;
}

interface LoyaltyData {
  points: number;
  rewards: Reward[];
}

const LoyaltyProgramScreen = () => {
  const navigation = useNavigation();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData>({
    points: 0,
    rewards: [],
  });
  const [loading, setLoading] = useState(true);

  // Set custom header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Loyalty Program",
      headerTitleAlign: "center",
      headerTitleStyle: {
        color: Colors.primary,
        fontSize: 22,
        fontWeight: "bold",
      },
      headerStyle: {
        backgroundColor: Colors.background,
      },
      headerTintColor: Colors.primary,
    });
  }, [navigation]);

  // Fetch loyalty data and rewards
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const loyaltyDocRef = doc(db, "loyalty", user.uid);

    // Fetch loyalty points
    const unsubscribeLoyalty = onSnapshot(
      loyaltyDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const loyalty = docSnap.data();
          console.log("Fetched Loyalty Data:", loyalty);
          setLoyaltyData((prev) => ({ ...prev, points: loyalty.points || 0 }));
          setLoading(false);
        } else {
          console.log("No loyalty data found for user:", user.uid);
          // Initialize loyalty points by calculating from orders
          const ordersQuery = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );

          const unsubscribeOrders = onSnapshot(
            ordersQuery,
            async (snapshot) => {
              const data: Order[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              } as Order));
              const totalEarnedPoints = data.reduce((sum, order) => {
                console.log(`Order ${order.id}: total = ${order.total}`);
                return sum + Math.floor(order.total / 10);
              }, 0);
              const totalUsedPoints = data.reduce((sum, order) => {
                console.log(`Order ${order.id}: pointsUsed = ${order.pointsUsed || 0}`);
                return sum + (order.pointsUsed || 0);
              }, 0);
              const netPoints = Math.max(0, totalEarnedPoints - totalUsedPoints);
              console.log(`Calculated Net Points: ${netPoints} (Earned: ${totalEarnedPoints}, Used: ${totalUsedPoints})`);

              // Initialize loyalty document
              try {
                await setDoc(
                  loyaltyDocRef,
                  {
                    userId: user.uid,
                    points: netPoints,
                    lastUpdated: new Date().toISOString(),
                  },
                  { merge: true }
                );
                console.log(`Initialized ${netPoints} points for user ${user.uid}`);
                setLoyaltyData((prev) => ({ ...prev, points: netPoints }));
              } catch (error) {
                console.error("Error initializing loyalty points:", error);
              }
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching orders:", error);
              setLoading(false);
            }
          );

          // Cleanup orders subscription (only needed for initialization)
          return () => unsubscribeOrders();
        }
      },
      (error) => {
        console.error("Error fetching loyalty data:", error);
        setLoading(false);
      }
    );

    // Fetch available rewards
    const rewardsQuery = query(collection(db, "rewards"));
    const unsubscribeRewards = onSnapshot(
      rewardsQuery,
      (snapshot) => {
        const rewards: Reward[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.title,
            points: data.pointsRequired,
            description: data.description,
            expiryDate: data.expiryDate,
            imageUrl: data.imageUrl?.[0],
          } as Reward;
        });
        setLoyaltyData((prev) => ({ ...prev, rewards }));
      },
      (error) => {
        console.error("Error fetching rewards:", error);
      }
    );

    return () => {
      unsubscribeLoyalty();
      unsubscribeRewards();
    };
  }, []);

  // Calculate next reward threshold and progress
  const nextRewardThreshold = Math.ceil(loyaltyData.points / 100) * 100 || 100;
  const progressInCurrentLevel = loyaltyData.points % 100;
  const progressPercent = (progressInCurrentLevel / 100) * 100;

  // Filter rewards based on available points
  const availableRewards = loyaltyData.rewards.filter(
    (reward) => reward.points <= loyaltyData.points
  );

  const renderRewardItem = ({ item }: { item: Reward }) => (
    <View style={styles.rewardContainer}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.rewardImage} />
      )}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardPoints}>{item.points} Points</Text>
        {item.description && (
          <Text style={styles.rewardDescription}>{item.description}</Text>
        )}
        {item.expiryDate && (
          <Text style={styles.rewardExpiry}>
            Expires on:{" "}
            {item.expiryDate.toDate().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loyaltySection}>
        <Text style={styles.sectionTitle}>Loyalty Program</Text>
        <Text style={styles.pointsText}>Your Points: {loyaltyData.points}</Text>
        <View style={styles.progressBar}>
          <View
            style={{
              width: `${progressPercent}%`,
              height: 10,
              backgroundColor: Colors.primary,
              borderRadius: 5,
            }}
          />
        </View>
        <Text style={styles.progressText}>
          {nextRewardThreshold - loyaltyData.points} points to next reward (
          {nextRewardThreshold})
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Available Rewards</Text>
      {availableRewards.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#666", marginTop: 20 }}>
          No rewards available yet. Keep collecting points!
        </Text>
      ) : (
        <FlatList
          data={availableRewards}
          keyExtractor={(item) => item.id}
          renderItem={renderRewardItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default LoyaltyProgramScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loyaltySection: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  progressBar: {
    backgroundColor: "#ddd",
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  rewardContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  rewardImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  rewardName: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },
  rewardPoints: {
    fontSize: 13,
    color: Colors.primary,
  },
  rewardDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  rewardExpiry: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});