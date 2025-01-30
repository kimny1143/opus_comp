'use client'

import { useState, useEffect } from 'react';
import { InvoiceTemplate, InvoiceTemplateWithParsedBankInfo, InvoiceTemplateItem } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BankInfo, deserializeBankInfo, serializeBankInfo } from '@/types/bankInfo';

interface InvoiceTemplateDialogProps {
  currentData: {
    contractorName: string;
    contractorAddress: string;
    registrationNumber: string;
    bankInfo: BankInfo;
    paymentTerms: string;
    notes: string;
  };
  onSaveTemplate: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onLoadTemplate: (template: InvoiceTemplateWithParsedBankInfo & { defaultItems?: InvoiceTemplateItem[] }) => void;
}

export const InvoiceTemplateDialog: React.FC<InvoiceTemplateDialogProps> = ({
  currentData,
  onSaveTemplate,
  onLoadTemplate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<InvoiceTemplateWithParsedBankInfo[]>([]);
  const [mode, setMode] = useState<'load' | 'save'>('load');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    ...currentData,
    paymentTerms: currentData.paymentTerms || '請求書発行から30日以内',
    notes: currentData.notes || ''
  });

  // テンプレート一覧の取得
  useEffect(() => {
    const fetchTemplates = async () => {
      const response = await fetch('/api/invoice/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates.map((template: InvoiceTemplate) => ({
          ...template,
          bankInfo: deserializeBankInfo(JSON.parse(template.bankInfo))
        })));
      }
    };
    fetchTemplates();
  }, [isOpen]);

  const handleSaveTemplate = async () => {
    try {
      await onSaveTemplate({
        ...newTemplate,
        bankInfo: JSON.stringify(serializeBankInfo(newTemplate.bankInfo))
      });
      setIsOpen(false);
      setNewTemplate({ name: '', description: '', ...currentData });
    } catch (error) {
      alert('テンプレートの保存に失敗しました');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          テンプレート
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>請求書テンプレート</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={mode === 'load' ? 'default' : 'outline'}
              onClick={() => setMode('load')}
            >
              読み込み
            </Button>
            <Button
              variant={mode === 'save' ? 'default' : 'outline'}
              onClick={() => setMode('save')}
            >
              保存
            </Button>
          </div>

          {mode === 'load' ? (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onLoadTemplate(template);
                    setIsOpen(false);
                  }}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500">{template.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">テンプレート名 *</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="templateDescription">説明</Label>
                <Textarea
                  id="templateDescription"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSaveTemplate}
                disabled={!newTemplate.name}
              >
                テンプレートを保存
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 