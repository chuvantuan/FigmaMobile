import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItem, removeFromCart, clearCart } from '../redux/cartSlice';

export default function CartScreen() {
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetch('http://192.168.171.97:3000/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));

    if (user) {
      fetch(`http://192.168.171.97:3000/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((error) => console.error('Error fetching user:', error));
    }
  }, [isFocused, user]);

  const handleUpdateQuantity = (item, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ userId: user.id, productId: item.productId, quantity }));
  };

  const handleRemoveItem = (item) => {
    dispatch(removeFromCart({ userId: user.id, productId: item.productId }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = cartItems.length > 0 ? 10 : 0;
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!userData?.address) {
      navigation.navigate('Address');
      return;
    }

    fetch('http://192.168.171.97:3000/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        products: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        date: new Date().toISOString().split('T')[0],
        address: `${userData.address.addressDetail}, ${userData.address.city}, ${userData.address.country}`,
      }),
    })
      .then((res) => res.json())
      .then((order) => {
        dispatch(clearCart());
        navigation.navigate('OrderConfirmation', { orderId: order.id });
      })
      .catch((error) => {
        console.error('Error placing order:', error);
        alert('Error placing order');
      });
  };

  const handleEditAddress = () => {
    if (!userData?.address) {
      navigation.navigate('Address');
    } else {
      navigation.navigate('EditAddress', { address: userData.address });
    }
  };

  const renderCartItem = ({ item }) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: product.image }} style={styles.cartItemImage} />
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemTitle}>{product.title}</Text>
          <Text style={styles.cartItemPrice}>${product.price}</Text>
          <Text style={styles.cartItemTax}>(+${(product.price * 0.1).toFixed(2)} Tax)</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
            >
              <Ionicons name="remove-circle" size={24} color="gray" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
            >
              <Ionicons name="add-circle" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemoveItem(item)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId.toString()}
            style={styles.cartList}
          />
          <View style={styles.checkoutSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={24} color="black" />
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Ionicons name="checkmark-circle" size={24} color="green" />
            </View>
            <TouchableOpacity onPress={handleEditAddress}>
              {userData?.address ? (
                <>
                  <Text style={styles.infoText}>Name: {userData.address.name}</Text>
                  <Text style={styles.infoText}>
                    Address: {userData.address.addressDetail}, {userData.address.city}, {userData.address.country}
                  </Text>
                  <Text style={styles.infoText}>Phone: {userData.address.phone}</Text>
                </>
              ) : (
                <Text style={styles.infoText}>No address set</Text>
              )}
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={24} color="black" />
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Ionicons name="checkmark-circle" size={24} color="green" />
            </View>
            <Text style={styles.infoText}>Visa Classic **** 7690</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${calculateSubtotal()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping cost</Text>
              <Text style={styles.summaryValue}>${cartItems.length > 0 ? 10 : 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>${calculateTotal()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: 'gray' },
  cartList: { paddingHorizontal: 20 },
  cartItem: {
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  cartItemImage: { width: 80, height: 80, borderRadius: 5 },
  cartItemDetails: { flex: 1, marginLeft: 10 },
  cartItemTitle: { fontSize: 16, fontWeight: 'bold' },
  cartItemPrice: { fontSize: 16, color: '#6B48FF', marginTop: 5 },
  cartItemTax: { fontSize: 14, color: 'gray', marginTop: 2 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  quantityText: { fontSize: 16, marginHorizontal: 10 },
  checkoutSection: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 10 },
  infoText: { fontSize: 14, color: 'gray', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 16, color: 'gray' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  checkoutButton: {
    backgroundColor: '#6B48FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});