import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, AlertCircle } from 'lucide-react';

interface DataDownloadProps {
  trigger: React.ReactNode;
}

const DataDownload: React.FC<DataDownloadProps> = ({ trigger }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { getAccessToken } = await import('@/lib/authToken');
      const token = getAccessToken();
      if (token) {
      const response = await fetch(API_ENDPOINTS.USER.DOWNLOAD_DATA, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
       
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `my-data-${new Date().toISOString().split('T')[0]}.json`;
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: t('data-downloaded'),
          description: 'Your personal data has been downloaded successfully',
        });
        
        setOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to download data',
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {t('download-data')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">What's included in your data export:</p>
                <ul className="space-y-1">
                  <li>• Profile information (name, email, phone)</li>
                  <li>• Saved addresses</li>
                  <li>• User preferences and settings</li>
                  <li>• Order history and purchase data</li>
                  <li>• Account activity timestamps</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="space-y-1">
                  <li>• Data is exported in JSON format</li>
                  <li>• Passwords are not included for security</li>
                  <li>• File contains sensitive information - handle securely</li>
                  <li>• This complies with GDPR data portability rights</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Downloading...' : t('download')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataDownload;