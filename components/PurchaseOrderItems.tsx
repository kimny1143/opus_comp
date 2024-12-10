import React, { useState } from 'react';
import { useFieldArray, UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PurchaseOrderForm } from '@/types/purchaseOrder';
import { ItemTemplateSelector } from './ItemTemplateSelector';
import { SaveTemplateModal } from './SaveTemplateModal';

interface Props {
  register: UseFormRegister<PurchaseOrderForm>;
  control: Control<PurchaseOrderForm>;
  errors: any;
  setValue: UseFormSetValue<PurchaseOrderForm>;
}

export const PurchaseOrderItems: React.FC<Props> = ({ register, control, errors, setValue }) => {
  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: "items"
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    move(sourceIndex, destinationIndex);
  };

  const handleSaveTemplate = async (templateName: string) => {
    try {
      const response = await fetch('/api/item-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          items: fields
        }),
      });

      if (!response.ok) {
        throw new Error('テンプレートの保存に失敗しました');
      }

      alert('テンプレートを保存しました');
    } catch (error) {
      console.error('Error:', error);
      alert('テンプレートの保存に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">発注明細</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            現在の明細をテンプレート保存
          </button>
          <button
            type="button"
            onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            明細を追加
          </button>
        </div>
      </div>

      <SaveTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        items={fields}
      />

      <ItemTemplateSelector
        setValue={setValue}
        setFields={(items) => replace(items)}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable
                  key={field.id}
                  draggableId={field.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 border rounded-md space-y-3 mb-4 ${
                        snapshot.isDragging ? 'bg-gray-50 shadow-lg' : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center space-x-2 cursor-move"
                        >
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                          <h4>明細 #{index + 1}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          削除
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1">品名</label>
                          <input
                            {...register(`items.${index}.name` as const, { required: '品名は必須です' })}
                            className="w-full border rounded-md p-2"
                          />
                          {errors.items?.[index]?.name && (
                            <p className="text-red-500 text-sm">{errors.items[index].name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1">数量</label>
                          <input
                            type="number"
                            {...register(`items.${index}.quantity` as const, { 
                              required: '数量は必須です',
                              min: { value: 1, message: '1以上の数値を入力してください' }
                            })}
                            className="w-full border rounded-md p-2"
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-red-500 text-sm">{errors.items[index].quantity.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1">単価</label>
                          <input
                            type="number"
                            {...register(`items.${index}.unitPrice` as const, { 
                              required: '単価は必須です',
                              min: { value: 0, message: '0以上の数値を入力してください' }
                            })}
                            className="w-full border rounded-md p-2"
                          />
                          {errors.items?.[index]?.unitPrice && (
                            <p className="text-red-500 text-sm">{errors.items[index].unitPrice.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1">備考</label>
                          <input
                            {...register(`items.${index}.description` as const)}
                            className="w-full border rounded-md p-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 