
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Database, Save, Loader2, Download, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { reloadData } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({
    org_name: 'Kalvayal Samugaseevaka Sangam',
    org_email: 'info@kalvayal.org',
    org_phone: '+94 21 123 4567',
    org_address: 'Jaffna, Sri Lanka',
    epf_rate: '8',
    etf_rate: '12',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      // Merge with defaults to ensure all keys exist
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load settings', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Failed to save settings');
    } finally {


      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (confirm("ARE YOU SURE?\n\nThis will DELETE ALL WORKERS AND PAYROLL RECORDS.\nThis action cannot be undone.")) {
      try {
        setSaving(true);
        await api.resetData();
        await reloadData();
        toast.success('System data has been reset');
        navigate('/');
      } catch (error) {
        console.error('Failed to reset data', error);
        toast.error('Failed to reset data');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDownloadBackup = () => {
    // Trigger download using the backup URL
    window.location.href = api.getBackupUrl();
  };

  if (loading) {
    return (
      <Layout title="Settings" subtitle="Configure your system preferences">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" subtitle="Configure your system preferences">
      <Helmet>
        <title>Settings - Kalvayal</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Settings Header */}
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
            <p className="text-muted-foreground">
              Manage organization details, payroll configurations, and data backups.
            </p>
          </div>
        </div>

        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-3 mb-8">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Organization</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Payroll</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  These details will be used in reports and official documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org_name">Organization Name</Label>
                    <Input
                      id="org_name"
                      value={settings.org_name}
                      onChange={(e) => handleInputChange('org_name', e.target.value)}
                      placeholder="e.g. Kalvayal Samugaseevaka Sangam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org_email">Contact Email</Label>
                    <Input
                      id="org_email"
                      type="email"
                      value={settings.org_email}
                      onChange={(e) => handleInputChange('org_email', e.target.value)}
                      placeholder="e.g. info@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org_phone">Contact Phone</Label>
                    <Input
                      id="org_phone"
                      value={settings.org_phone}
                      onChange={(e) => handleInputChange('org_phone', e.target.value)}
                      placeholder="e.g. +94 21 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org_address">Address</Label>
                    <Input
                      id="org_address"
                      value={settings.org_address}
                      onChange={(e) => handleInputChange('org_address', e.target.value)}
                      placeholder="e.g. Jaffna, Sri Lanka"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Settings */}
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Configuration</CardTitle>
                <CardDescription>
                  Configure global EPF and ETF rates for salary calculations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="epf_rate" className="text-base font-medium">EPF Employee Rate (%)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="epf_rate"
                        type="number"
                        min="0"
                        max="100"
                        className="w-32 text-lg font-mono"
                        value={settings.epf_rate}
                        onChange={(e) => handleInputChange('epf_rate', e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground max-w-[200px]">
                        Percentage deducted from employee salary (Default: 8%).
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="etf_rate" className="text-base font-medium">ETF Employer Rate (%)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="etf_rate"
                        type="number"
                        min="0"
                        max="100"
                        className="w-32 text-lg font-mono"
                        value={settings.etf_rate}
                        onChange={(e) => handleInputChange('etf_rate', e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground max-w-[200px]">
                        Percentage contributed by employer (Default: 12%).
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p>
                    Changing these rates will affect all future payroll calculations. Past records will remain unchanged.
                    Please ensure you follow local labor laws when adjusting these values.
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Secure your data with backups.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <div className="space-y-1">
                    <h4 className="text-base font-medium flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Database Backup
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Download a full SQL dump of your current database. Recommended before making major changes.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadBackup} className="shrink-0">
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="space-y-1">
                    <h4 className="text-base font-medium flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Danger Zone
                    </h4>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Permanently delete all business data (workers, payrolls). This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleResetData} disabled={saving} className="shrink-0">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                    Reset Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
