import { Control, FieldValues, Path } from "react-hook-form";

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  readOnly?: boolean;
}

export interface InputFieldProps<T extends FieldValues>
  extends BaseFieldProps<T> {
  type?: string;
}

export interface TextareaFieldProps<T extends FieldValues>
  extends BaseFieldProps<T> {
  rows?: number;
} 