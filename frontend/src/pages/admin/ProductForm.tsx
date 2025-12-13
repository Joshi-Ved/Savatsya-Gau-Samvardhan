import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    fragrance?: string;
    weight?: string;
    isActive: boolean;
}

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
        defaultValues: {
            isActive: true,
            stock: 0
        }
    });

    const category = watch('category');

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
            if (response.ok) {
                const data = await response.json();
                Object.keys(data).forEach(key => {
                    setValue(key as any, data[key]);
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
        } finally {
            setFetching(false);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = isEditMode
                ? `${API_ENDPOINTS.PRODUCTS}/${id}`
                : API_ENDPOINTS.PRODUCTS;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
                navigate('/admin/products');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/admin/products')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                    {isEditMode ? 'Edit Product' : 'New Product'}
                </h1>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" {...register('name', { required: 'Name is required' })} />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    onValueChange={(value) => setValue('category', value)}
                                    defaultValue={watch('category')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incense">Incense Sticks</SelectItem>
                                        <SelectItem value="ghee">Ghee</SelectItem>
                                        <SelectItem value="oil">Oil</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    {...register('price', { required: 'Price is required', min: 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    {...register('stock', { required: 'Stock is required', min: 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="image"
                                    {...register('image', { required: 'Image URL is required' })}
                                    placeholder="/images/products/..."
                                />
                            </div>
                            <p className="text-xs text-gray-500">Currently supporting local paths or external URLs</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description', { required: 'Description is required' })}
                                className="h-32"
                            />
                        </div>

                        {category === 'incense' && (
                            <div className="space-y-2">
                                <Label htmlFor="fragrance">Fragrance</Label>
                                <Input id="fragrance" {...register('fragrance')} />
                            </div>
                        )}

                        {category === 'ghee' && (
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight</Label>
                                <Input id="weight" {...register('weight')} />
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-sawatsya-earth hover:bg-sawatsya-wood" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductForm;
