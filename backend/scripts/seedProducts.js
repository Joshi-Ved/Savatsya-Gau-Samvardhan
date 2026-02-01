import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data from frontend/src/data/products.ts
const products = [
    {
        slug: 'incense-1',
        name: 'Sandalwood Incense Sticks',
        category: 'incense',
        price: 40,
        image: '/images/products/incense/sandalwood-incense.jpeg',
        description: 'Our premium sandalwood incense sticks are handcrafted using traditional methods. Each stick burns for approximately 45 minutes, filling your space with the calming, woody aroma of pure sandalwood.',
        fragrance: 'Sandalwood',
        stock: 100
    },
    {
        slug: 'incense-2',
        name: 'Rose Incense Sticks',
        category: 'incense',
        price: 40,
        image: '/images/products/incense/rose-incense.jpeg',
        description: 'Handcrafted rose incense sticks made with real rose petals and essential oils. Creates a romantic and soothing atmosphere, perfect for meditation and relaxation.',
        fragrance: 'Rose',
        stock: 100
    },
    {
        slug: 'incense-3',
        name: 'Lavender Incense Sticks',
        category: 'incense',
        price: 40,
        image: '/images/products/incense/lavender-incense.jpeg',
        description: 'Our lavender incense sticks are made with pure lavender essential oil. Known for its calming properties, these sticks help create a peaceful environment for relaxation and stress relief.',
        fragrance: 'Lavender',
        stock: 100
    },
    {
        slug: 'incense-4',
        name: 'Jasmine Incense Sticks',
        category: 'incense',
        price: 40,
        image: '/images/products/incense/jasmine-incense.jpeg',
        description: 'Fragrant jasmine incense sticks handmade with real jasmine flowers. These sticks emit a sweet, exotic aroma that uplifts mood and creates a serene atmosphere.',
        fragrance: 'Jasmine',
        stock: 100
    },
    {
        slug: 'ghee-1',
        name: 'A2 Cow Ghee - 500g',
        category: 'ghee',
        price: 1100,
        image: '/images/products/ghee/ghee-500g.jpeg',
        description: 'Pure A2 cow ghee made from the milk of indigenous cows using the traditional bilona method. Rich in nutrients and with a golden hue and nutty aroma. Perfect for cooking, religious rituals, and Ayurvedic remedies.',
        weight: '500g',
        stock: 50
    },
    {
        slug: 'ghee-2',
        name: 'A2 Cow Ghee - 1kg',
        category: 'ghee',
        price: 2200,
        image: '/images/products/ghee/ghee-1kg.jpeg',
        description: 'Pure A2 cow ghee made from the milk of indigenous cows using the traditional bilona method. Rich in nutrients and with a golden hue and nutty aroma. Perfect for cooking, religious rituals, and Ayurvedic remedies.',
        weight: '1kg',
        stock: 50
    }
];

const seedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Upsert products based on slug
        for (const product of products) {
            await Product.findOneAndUpdate(
                { slug: product.slug },
                product,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Synced product: ${product.name}`);
        }

        console.log('Product seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
