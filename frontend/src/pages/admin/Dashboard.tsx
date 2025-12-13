import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    IndianRupee,
    TrendingUp,
    Package,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    recentOrders: any[];
    statusDistribution: { _id: string; count: number }[];
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ANALYTICS}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center">Failed to load data</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime earnings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all time
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {order.userId?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <div className="font-medium">₹{order.total}</div>
                                    </div>
                                </div>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No orders yet</p>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/admin/orders">View All Orders</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button asChild className="h-24 flex flex-col items-center justify-center space-y-2 bg-sawatsya-earth hover:bg-sawatsya-wood">
                            <Link to="/admin/products/new">
                                <Package className="h-6 w-6" />
                                <span>Add Product</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                            <Link to="/admin/orders">
                                <Clock className="h-6 w-6" />
                                <span>Pending Orders</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                            <Link to="/admin/users">
                                <Users className="h-6 w-6" />
                                <span>Manage Users</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                            <Link to="/products">
                                <TrendingUp className="h-6 w-6" />
                                <span>View Store</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
