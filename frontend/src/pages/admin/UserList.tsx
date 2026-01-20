import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    isAdmin: boolean;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.USER.ME.replace('/me', '/all')}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">Users</h1>

            <div className="flex items-center space-x-4 bg-white dark:bg-[#252526] p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 dark:bg-transparent dark:text-gray-200"
                />
            </div>

            <div className="bg-white dark:bg-[#252526] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">No users found</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-sawatsya-earth/10 flex items-center justify-center text-sawatsya-earth font-bold">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="font-medium">{user.name || 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="h-3 w-3 mr-2" />
                                                {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-3 w-3 mr-2" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-3 w-3 mr-2" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isAdmin
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.isAdmin ? 'Admin' : 'Customer'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserList;
