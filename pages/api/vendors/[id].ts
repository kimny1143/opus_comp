import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { vendorSchema } from '@/lib/validations/vendor'
import { validationMessages as msg } from '@/lib/validations/messages'
import { Prisma } from '@prisma/client'
import * as z from 'zod'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user) {
    return res.status(401).json({ message: msg.auth.required })
  }

  const { id } = req.query
  
  // 取引先の存在と権限チェック
  const vendor = await prisma.vendor.findFirst({
    where: { 
      id: id as string,
      createdById: session.user.id 
    },
    include: {
      purchaseOrders: { select: { id: true } },
      invoices: { select: { id: true } }
    }
  })

  if (!vendor) {
    return res.status(404).json({ message: msg.vendor.notFound })
  }

  // PUT: 更新処理
  if (req.method === 'PUT') {
    try {
      const validatedData = await vendorSchema.parseAsync(req.body)
      const updated = await prisma.vendor.update({
        where: { id: id as string },
        data: validatedData,
      })
      return res.status(200).json(updated)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ 
          message: msg.validation.invalid,
          code: error.code,
          meta: error.meta
        })
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: msg.validation.invalid,
          errors: error.errors
        })
      }
      // その他のエラー
      console.error('Vendor update error:', error)
      return res.status(500).json({ 
        message: msg.validation.invalid 
      })
    }
  }

  // DELETE: 削除処理
  if (req.method === 'DELETE') {
    try {
      // 関連データチェック
      if (vendor.purchaseOrders.length > 0 || vendor.invoices.length > 0) {
        return res.status(400).json({ message: msg.vendor.hasRelatedData })
      }

      // トランザクションで削除処理
      await prisma.$transaction(async (tx) => {
        // タグの関連を削除
        await tx.vendorTag.deleteMany({
          where: { vendorId: id as string }
        })

        // 取引先を削除
        await tx.vendor.delete({
          where: { 
            id: id as string,
            createdById: session.user.id
          }
        })
      })

      return res.status(200).json({ 
        message: msg.vendor.deleted 
      })
    } catch (error) {
      console.error('Vendor delete error:', error)
      return res.status(500).json({ 
        message: msg.error.deletion 
      })
    }
  }
}
