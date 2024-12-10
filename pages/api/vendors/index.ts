import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { VendorStatus as PrismaVendorStatus, EntityType as PrismaEntityType } from '@prisma/client';

// Prismaエラーの型定義
type PrismaError = Error & {
  code?: string;
  meta?: { target?: string[] };
};

// ステータスの定義
const VendorStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

// 事業者区分の定義
const EntityType = {
  CORPORATION: 'corporation', // 法人
  INDIVIDUAL: 'individual',   // 個人事業主
  OTHER: 'other',            // その他
} as const;

// バリデーションスキーマの定義
const createVendorSchema = z.object({
  // 基本情報
  name: z.string().min(1, { message: '会社名は必須です' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }).nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  
  // 取引状況と分類
  status: z.enum([
    VendorStatus.ACTIVE,
    VendorStatus.INACTIVE,
    VendorStatus.PENDING,
    VendorStatus.SUSPENDED
  ]).default(VendorStatus.ACTIVE),
  industry: z.string().optional(),
  
  // 法的要件
  entityType: z.enum([
    EntityType.CORPORATION,
    EntityType.INDIVIDUAL,
    EntityType.OTHER
  ]),
  registrationNumber: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  myNumber: z.string().nullable().optional(),
  
  // 日付情報
  establishedDate: z.string().nullable().optional(),
  contractStartDate: z.string().nullable().optional(),
  
  // その他
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type CreateVendorRequest = z.infer<typeof createVendorSchema>;

async function handlePost(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    // リクエストボディのパース
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body) {
      return res.status(400).json({
        message: 'リクエストボディが空です',
      });
    }

    // リクエストボディのバリデーョン
    const validationResult = createVendorSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'バリデーションエラー',
        errors: validationResult.error.errors,
      });
    }

    const {
      name,
      email,
      phone,
      address,
      contactPerson,
      status,
      industry,
      entityType,
      registrationNumber,
      invoiceNumber,
      myNumber,
      establishedDate,
      contractStartDate,
      notes,
      tags,
    } = validationResult.data;

    // 空文字列を null に変換
    function emptyStringToNull(value: string | null | undefined): string | null {
      if (value === undefined || value === '') {
        return null;
      }
      return value;
    }

    // 日付のパース
    const parsedEstablishedDate = establishedDate ? new Date(establishedDate) : null;
    const parsedContractStartDate = contractStartDate ? new Date(contractStartDate) : null;

    // データの整形
    const data: Prisma.VendorCreateInput = {
      name,
      email: emptyStringToNull(email),
      phone: emptyStringToNull(phone),
      address: emptyStringToNull(address),
      contactPerson: emptyStringToNull(contactPerson),
      status: status as PrismaVendorStatus || VendorStatus.ACTIVE,
      industry: emptyStringToNull(industry),
      entityType,
      registrationNumber: emptyStringToNull(registrationNumber),
      invoiceNumber: emptyStringToNull(invoiceNumber),
      myNumber: emptyStringToNull(myNumber),
      establishedDate: parsedEstablishedDate,
      contractStartDate: parsedContractStartDate,
      notes: emptyStringToNull(notes),
      createdBy: { connect: { id: session.user.id } },
      // タグの処理
      tags: tags && tags.length > 0 ? {
        create: tags.map(tagName => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName },
            },
          },
        })),
      } : {},
    };

    console.log('Session info:', session);
    console.log('Data being sent to Prisma:', data);

    // Vendorを作成
    const vendor = await prisma.vendor.create({ data });

    if (!vendor) {
      throw new Error('Vendor creation failed.');
    }

    return res.status(201).json(vendor);
  } catch (error: any) {
    console.error('Vendor creation error:', error);

    const errorMessage =
      error instanceof Error && error.message
        ? error.message
        : '取引先の作成中にエラーが発生しました';

    return res.status(500).json({
      message: errorMessage,
    });
  }
}

// クエ��パラメータの型定義
type QueryParams = {
  search?: string;
  status?: PrismaVendorStatus;  // string から VendorStatus に変更
  tags?: string[];
};

// handleGet関数の実装
async function handleGet(
  req: NextApiRequest, 
  res: NextApiResponse, 
  session: { user: { id: string } }
) {
  // クエリパラメータの取得
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const status = req.query.status as PrismaVendorStatus;
  const tags = Array.isArray(req.query.tags) ? req.query.tags : [];
  const sortBy = (req.query.sortBy as string) || 'updatedAt';
  const sortOrder = (req.query.sortOrder as string) || 'desc';

  // 検索条件の構築
  const where: Prisma.VendorWhereInput = {
    createdById: session.user.id,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ],
    }),
    ...(status && { status }),
    ...(tags.length > 0 && {
      tags: {
        some: {
          tag: { id: { in: tags } },
        },
      },
    }),
  };

  // 取引先の総数を取得
  const total = await prisma.vendor.count({ where });

  // 取引先データの取得
  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
  });

  // 利用可能なタグの取得（ユーザーの取引先に関連付けられているタグのみ）
  const userTags = await prisma.vendorTag.findMany({
    where: {
      vendor: {
        createdById: session.user.id
      }
    },
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        }
      }
    },
    distinct: ['tagId'],
  });

  // レスポンスの構築
  return res.status(200).json({
    vendors: vendors.map(vendor => ({
      ...vendor,
      tags: vendor.tags.map(t => t.tag.name),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    availableTags: userTags.map(t => t.tag.name),
  });
}

// vendorの型を明示的に定義
type VendorWithTags = Prisma.VendorGetPayload<{
  include: {
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  if (!session.user.id) {
    return res.status(400).json({ message: 'ユーザーIDが取得できませんでした' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, session);
  } else if (req.method === 'POST') {
    return handlePost(req, res, session);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
