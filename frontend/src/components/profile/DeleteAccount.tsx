import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';

interface DeleteAccountProps {
  trigger: React.ReactNode;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ trigger }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationChecks, setConfirmationChecks] = useState({
    understand: false,
    backup: false,
    final: false
  });
  
  const [formData, setFormData] = useState({
    password: '',
    confirmation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required to delete account';
    }

    if (formData.confirmation !== 'DELETE') {
      newErrors.confirmation = 'Please type DELETE to confirm';
    }

    if (!confirmationChecks.understand || !confirmationChecks.backup || !confirmationChecks.final) {
      newErrors.checks = 'Please confirm all checkboxes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.USER.DELETE_ACCOUNT, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: formData.password,
          confirmation: formData.confirmation
        })
      });

      const data = await response.json();

      if (data.ok) {
        toast({
          title: t('account-deletion-scheduled'),
          description: `Your account will be deleted on ${new Date(data.deletionDate).toLocaleDateString()}. You have ${data.gracePeriodDays} days to cancel this action.`,
        });
        
       
        setTimeout(() => {
          logout();
        }, 2000);
        
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete account',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (key: keyof typeof confirmationChecks, checked: boolean) => {
    setConfirmationChecks(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {t('delete-account')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-medium mb-2">This action will:</p>
                <ul className="space-y-1">
                  <li>• Permanently delete your account after 30 days</li>
                  <li>• Remove all your personal data and preferences</li>
                  <li>• Cancel any active orders or subscriptions</li>
                  <li>• Make your email address available for re-registration</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="understand"
                  checked={confirmationChecks.understand}
                  onCheckedChange={(checked) => handleCheckboxChange('understand', !!checked)}
                />
                <Label htmlFor="understand" className="text-sm">
                  I understand that this action cannot be undone after the 30-day grace period
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="backup"
                  checked={confirmationChecks.backup}
                  onCheckedChange={(checked) => handleCheckboxChange('backup', !!checked)}
                />
                <Label htmlFor="backup" className="text-sm">
                  I have downloaded my data or don't need it
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="final"
                  checked={confirmationChecks.final}
                  onCheckedChange={(checked) => handleCheckboxChange('final', !!checked)}
                />
                <Label htmlFor="final" className="text-sm">
                  I want to permanently delete my account
                </Label>
              </div>
            </div>

            {errors.checks && (
              <p className="text-sm text-red-500">{errors.checks}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Confirm your password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={errors.password ? 'border-red-500' : ''}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type "DELETE" to confirm</Label>
              <Input
                id="confirmation"
                type="text"
                value={formData.confirmation}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmation: e.target.value }))}
                className={errors.confirmation ? 'border-red-500' : ''}
                placeholder="Type DELETE in capital letters"
              />
              {errors.confirmation && (
                <p className="text-sm text-red-500">{errors.confirmation}</p>
              )}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                <strong>Grace Period:</strong> You have 30 days to cancel this deletion. 
                During this time, your account will be deactivated but recoverable.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading}
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccount;