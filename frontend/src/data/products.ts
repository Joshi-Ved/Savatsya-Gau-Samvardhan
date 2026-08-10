
import { Product } from '../contexts/CartContext';

export const products: Product[] = [
  {
    id: 'incense-1',
    name: 'Sandalwood Incense Sticks',
    category: 'incense',
    price: 40,
    image: '/images/products/incense/sandalwood-incense.jpg',
    description: 'Our premium sandalwood incense sticks are handcrafted using traditional methods. Each stick burns for approximately 45 minutes, filling your space with the calming, woody aroma of pure sandalwood.',
    fragrance: 'Sandalwood'
  },
  {
    id: 'incense-2',
    name: 'Rose Incense Sticks',
    category: 'incense',
    price: 40,
    image: '/images/products/incense/rose-incense.jpg',
    description: 'Handcrafted rose incense sticks made with real rose petals and essential oils. Creates a romantic and soothing atmosphere, perfect for meditation and relaxation.',
    fragrance: 'Rose'
  },
  {
    id: 'incense-3',
    name: 'Lavender Incense Sticks',
    category: 'incense',
    price: 40,
    image: '/images/products/incense/lavender-incense.jpg',
    description: 'Our lavender incense sticks are made with pure lavender essential oil. Known for its calming properties, these sticks help create a peaceful environment for relaxation and stress relief.',
    fragrance: 'Lavender'
  },
  {
    id: 'incense-4',
    name: 'Jasmine Incense Sticks',
    category: 'incense',
    price: 40,
    image: '/images/products/incense/jasmine-incense.jpg',
    description: 'Fragrant jasmine incense sticks handmade with real jasmine flowers. These sticks emit a sweet, exotic aroma that uplifts mood and creates a serene atmosphere.',
    fragrance: 'Jasmine'
  },
  {
    id: 'ghee-1',
    name: 'A2 Cow Ghee - 500g',
    category: 'ghee',
    price: 1100,
    image: '/images/products/ghee/ghee-500g.jpg',
    description: 'Pure A2 cow ghee made from the milk of indigenous cows using the traditional bilona method. Rich in nutrients and with a golden hue and nutty aroma. Perfect for cooking, religious rituals, and Ayurvedic remedies.',
    weight: '500g'
  },
  {
    id: 'ghee-2',
    name: 'A2 Cow Ghee - 1kg',
    category: 'ghee',
    price: 2200,
    image: '/images/products/ghee/Ghee-1kg.png',
    description: 'Pure A2 cow ghee made from the milk of indigenous cows using the traditional bilona method. Rich in nutrients and with a golden hue and nutty aroma. Perfect for cooking, religious rituals, and Ayurvedic remedies.',
    weight: '1kg'
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: 'incense' | 'ghee'): Product[] => {
  return products.filter(product => product.category === category);
};
