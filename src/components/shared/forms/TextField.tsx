import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: {
    message?: string
    type?: string
  }
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error.message}
          </p>
        )}
      </div>
    )
  }
)

TextField.displayName = 'TextField' 