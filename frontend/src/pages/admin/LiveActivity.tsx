import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    ShoppingCart,
    Eye,
    Search,
    Heart,
    MousePointer,
    Users
} from 'lucide-react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import createSocket from '@/lib/socket';

interface LiveAction {
    id: string;
    type: 'page_view' | 'product_view' | 'add_to_cart' | 'search' | 'wishlist_add' | 'click';
    timestamp: Date;
    data: Record<string, any>;
    user?: string;
}

const LiveActivity = () => {
    const [liveActions, setLiveActions] = useState<LiveAction[]>([]);
    const [activeUsers, setActiveUsers] = useState(0);
    const { analytics } = useAnalytics();

    useEffect(() => {
        // Listen to WebSocket messages for live user activity
        const handleWebSocketMessage = (event: CustomEvent) => {
            const data = event.detail;
            
            if (data.type === 'user_action') {
                const action: LiveAction = {
                    id: `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: data.actionType,
                    timestamp: new Date(),
                    data: data.payload,
                    user: data.user || 'Anonymous'
                };
                
                setLiveActions(prev => [action, ...prev].slice(0, 50)); // Keep last 50 actions
            }
            
            if (data.type === 'active_users_count') {
                setActiveUsers(data.count);
            }
        };

        window.addEventListener('ws:message', handleWebSocketMessage as EventListener);

        // Try to establish WebSocket connection
        try {
            const socket = createSocket();
            
            // Request initial active users count
            socket.addEventListener('open', () => {
                socket.send(JSON.stringify({ type: 'get_active_users' }));
            });
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
        }

        return () => {
            window.removeEventListener('ws:message', handleWebSocketMessage as EventListener);
        };
    }, []);

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'page_view':
                return <Eye className="h-4 w-4" />;
            case 'product_view':
                return <MousePointer className="h-4 w-4" />;
            case 'add_to_cart':
                return <ShoppingCart className="h-4 w-4" />;
            case 'search':
                return <Search className="h-4 w-4" />;
            case 'wishlist_add':
                return <Heart className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getActionColor = (type: string) => {
        switch (type) {
            case 'page_view':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'product_view':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'add_to_cart':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'search':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'wishlist_add':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const formatActionType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold dark:text-gray-100">Live Activity</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-700 bg-green-900/20 text-green-300">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">{activeUsers} Active Users</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-gray-200">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-gray-100">{analytics.totalPageViews}</div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                            All time
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-gray-200">Active Sessions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-gray-100">{analytics.sessions.length}</div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                            Total sessions
                        </p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-gray-200">Conversion Rate</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-gray-100">{analytics.conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                            Purchase conversion
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="dark:text-gray-100">Recent User Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {liveActions.length === 0 ? (
                                <p className="text-center text-muted-foreground dark:text-gray-400 py-8">
                                    No recent activity. Waiting for user actions...
                                </p>
                            ) : (
                                liveActions.map((action) => (
                                    <div
                                        key={action.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-md ${getActionColor(action.type)}`}>
                                            {getActionIcon(action.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm dark:text-gray-200">
                                                    {formatActionType(action.type)}
                                                </span>
                                                <span className="text-xs text-muted-foreground dark:text-gray-400">
                                                    {action.user}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                                                {action.data.page || action.data.productName || action.data.query || 'Unknown action'}
                                            </p>
                                            <span className="text-xs text-muted-foreground dark:text-gray-500">
                                                {new Date(action.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveActivity;
