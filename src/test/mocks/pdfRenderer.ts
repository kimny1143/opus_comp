import React, { ReactNode } from 'react'

interface ComponentProps {
  children?: ReactNode
}

interface ImageProps {
  src: string
}

export const PDFViewer: React.FC<ComponentProps> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'pdf-viewer' }, children)
}

export const Document: React.FC<ComponentProps> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'pdf-document' }, children)
}

export const Page: React.FC<ComponentProps> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'pdf-page' }, children)
}

export const Text: React.FC<ComponentProps> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'pdf-text' }, children)
}

export const View: React.FC<ComponentProps> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'pdf-view' }, children)
}

export const Image: React.FC<ImageProps> = ({ src }) => {
  return React.createElement('img', {
    'data-testid': 'pdf-image',
    src,
    alt: 'PDF image'
  })
}

export const StyleSheet = {
  create: (styles: Record<string, any>) => styles,
}

export const pdf = {
  create: async () => new Blob(),
}

export const Font = {
  register: () => {},
}

// その他必要なコンポーネントやユーティリティをここに追加