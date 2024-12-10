import React, { useState, useEffect } from 'react';
import { ReminderType } from '@prisma/client';

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
  const [error, setError] = useState<string | null>(null);

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
      setError('リマインダー設定の取得に失敗しました');
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
    } catch (error) {
      console.error('Error:', error);
      setError('リマインダーの追加に失敗しました');
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
    } catch (error) {
      console.error('Error:', error);
      setError('リマインダーの更新に失敗しました');
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
    } catch (error) {
      console.error('Error:', error);
      setError('リマインダーの削除に失敗しました');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">リマインダー設定</h3>
        <button
          onClick={handleAddReminder}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          リマインダーを追加
        </button>
      </div>

      {settings.map((setting) => (
        <div key={setting.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <select
                value={setting.type}
                onChange={(e) => handleUpdateReminder(setting.id, {
                  type: e.target.value as ReminderType,
                })}
                className="border rounded-md p-2"
              >
                <option value={ReminderType.BEFORE_DUE}>支払期限前</option>
                <option value={ReminderType.AFTER_DUE}>支払期限超過後</option>
                <option value={ReminderType.AFTER_ISSUE}>発行後</option>
              </select>
              <input
                type="number"
                value={setting.daysBeforeOrAfter}
                onChange={(e) => handleUpdateReminder(setting.id, {
                  daysBeforeOrAfter: parseInt(e.target.value),
                })}
                className="border rounded-md p-2 w-24"
                min="1"
              />
              <span>日</span>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={(e) => handleUpdateReminder(setting.id, {
                    enabled: e.target.checked,
                  })}
                  className="rounded"
                />
                <span>有効</span>
              </label>
              <button
                onClick={() => handleDeleteReminder(setting.id)}
                className="text-red-600 hover:text-red-700"
              >
                削除
              </button>
            </div>
          </div>
          {setting.lastSentAt && (
            <p className="text-sm text-gray-500">
              最終送信: {new Date(setting.lastSentAt).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}; 