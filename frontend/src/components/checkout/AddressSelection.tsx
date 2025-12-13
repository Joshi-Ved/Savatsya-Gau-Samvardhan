import React, { useState } from 'react';
import { useAuth, Address } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressSelectionProps {
    selectedAddressId: string | null;
    onSelectAddress: (id: string) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ selectedAddressId, onSelectAddress }) => {
    const { user, addAddress, deleteAddress } = useAuth();
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        addAddress(newAddress);
        setIsAddingNew(false);
        setNewAddress({
            label: 'Home',
            street: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        });
        toast.success('Address added successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-medium">Shipping Address</h2>
                {!isAddingNew && (
                    <Button variant="outline" size="sm" onClick={() => setIsAddingNew(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                )}
            </div>

            {isAddingNew ? (
                <form onSubmit={handleAddAddress} className="bg-secondary/10 p-4 rounded-lg space-y-4 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">Label (e.g., Home, Office)</Label>
                            <Input
                                id="label"
                                value={newAddress.label}
                                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                placeholder="Home"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                                id="pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="street">Street Address *</Label>
                            <Input
                                id="street"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                        <Button type="submit">Save Address</Button>
                    </div>
                </form>
            ) : (
                <RadioGroup value={selectedAddressId || ''} onValueChange={onSelectAddress} className="space-y-3">
                    {user?.address && user.address.length > 0 ? (
                        user.address.map((addr: Address) => (
                            <div key={addr.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor={addr.id} className="font-medium cursor-pointer flex items-center gap-2">
                                        {addr.label}
                                        {addr.isDefault && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Default</span>}
                                    </Label>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        <p>{addr.street}</p>
                                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAddress(addr.id);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg">
                            <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No addresses found. Please add one.</p>
                            <Button variant="link" onClick={() => setIsAddingNew(true)}>Add Address</Button>
                        </div>
                    )}
                </RadioGroup>
            )}
        </div>
    );
};

export default AddressSelection;
