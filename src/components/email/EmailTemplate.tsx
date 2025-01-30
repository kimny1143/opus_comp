import React from 'react'

interface EmailTemplateProps {
  title?: string
  content?: string
  [key: string]: any
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  title = 'お知らせ',
  content = '',
  ...props
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {Object.entries(props).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  )
} 