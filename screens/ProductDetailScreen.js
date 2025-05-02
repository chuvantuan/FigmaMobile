import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cartSlice';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      navigation.navigate('SignIn');
      return;
    }
    dispatch(addToCart({ userId: user.id, productId: product.id, quantity: 1 }));
    navigation.navigate('Home', {
      screen: 'DrawerHome',
      params: { screen: 'CartTab' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Detail</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Home', {
              screen: 'DrawerHome',
              params: { screen: 'CartTab' },
            })
          }
        >
          <Ionicons name="cart-outline" size={30} color="black" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          <View style={styles.sizeContainer}>
            <Text style={styles.sizeLabel}>Size</Text>
            {['S', 'M', 'L', 'XL', '2XL'].map((size) => (
              <TouchableOpacity key={size} style={styles.sizeButton}>
                <Text style={styles.sizeText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description || 'No description available'}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  productImage: { width: '100%', height: 300, resizeMode: 'cover' },
  productInfo: { padding: 20 },
  productTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  productPrice: { fontSize: 20, color: '#6B48FF', marginBottom: 20 },
  sizeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sizeLabel: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sizeText: { fontSize: 16 },
  descriptionContainer: { marginBottom: 20 },
  descriptionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { fontSize: 16, color: 'gray' },
  addToCartButton: {
    backgroundColor: '#6B48FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#6B48FF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 12 },
});