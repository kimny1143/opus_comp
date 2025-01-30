import React, { useState, useEffect } from 'react';
import { ReminderType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast/use-toast';

interface ReminderSetting {
  id: string;
  type: ReminderType;
  daysBeforeOrAfter: number;
  enabled: boolean;
  lastSentAt: Date | null;
}

interface Props {
  invoiceId: string;
}

export const ReminderSettings: React.FC<Props> = ({ invoiceId }) => {
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [invoiceId]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/reminders`);
      if (!response.ok) throw new Error('リマインダー設定の取得に失敗しました');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'エラー',
        description: 'リマインダー設定の取得に失敗しました',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: ReminderType.BEFORE_DUE,
          daysBeforeOrAfter: 7,
        }),
      });

      if (!response.ok) throw new Error('リマインダーの追加に失敗しました');
      await fetchSettings();
      toast({
        title: '成功',
        description: 'リマインダーを追加しました',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'エラー',
        description: 'リマインダーの追加に失敗しました',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateReminder = async (reminderId: string, data: Partial<ReminderSetting>) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/reminders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderId,
          ...data,
        }),
      });

      if (!response.ok) throw new Error('リマインダーの更新に失敗しました');
      await fetchSettings();
      toast({
        title: '成功',
        description: 'リマインダーを更新しました',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'エラー',
        description: 'リマインダーの更新に失敗しました',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/reminders`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderId }),
      });

      if (!response.ok) throw new Error('リマインダーの削除に失敗しました');
      await fetchSettings();
      toast({
        title: '成功',
        description: 'リマインダーを削除しました',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'エラー',
        description: 'リマインダーの削除に失敗しました',
        variant: 'destructive'
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">リマインダー設定</h3>
        <Button onClick={handleAddReminder}>
          リマインダーを追加
        </Button>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id} className="p-4">
            <div className="flex justify-between items-center gap-4">
              <Select
                value={setting.type}
                onValueChange={(value) => handleUpdateReminder(setting.id, {
                  type: value as ReminderType,
                })}
              >
                <option value={ReminderType.BEFORE_DUE}>支払期限前</option>
                <option value={ReminderType.AFTER_DUE}>支払期限超過後</option>
                <option value={ReminderType.AFTER_ISSUE}>発行後</option>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={setting.daysBeforeOrAfter}
                  onChange={(e) => handleUpdateReminder(setting.id, {
                    daysBeforeOrAfter: parseInt(e.target.value),
                  })}
                  className="w-24"
                  min="1"
                />
                <span>日</span>
              </div>

              <div className="flex items-center gap-4">
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(checked) => handleUpdateReminder(setting.id, {
                    enabled: checked,
                  })}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteReminder(setting.id)}
                >
                  削除
                </Button>
              </div>
            </div>

            {setting.lastSentAt && (
              <p className="text-sm text-gray-500 mt-2">
                最終送信: {new Date(setting.lastSentAt).toLocaleString()}
              </p>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
}; 