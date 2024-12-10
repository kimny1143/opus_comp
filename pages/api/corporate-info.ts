import { NextApiRequest, NextApiResponse } from 'next';

// 法人番号APIのエンドポイントとアプリケーションID
const API_ENDPOINT = 'https://api.houjin-bangou.nta.go.jp/4/num';
const APPLICATION_ID = 'あなたのアプリケーションID';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ message: '法人番号が指定されていません' });
  }

  try {
    const apiResponse = await fetch(
      `${API_ENDPOINT}?id=${APPLICATION_ID}&number=${number}&type=02`
    );

    if (!apiResponse.ok) {
      throw new Error('法人番号APIからの応答が不正です');
    }

    const data = await apiResponse.json();

    // 必要な情報を抽出して返す
    const companyInfo = {
      name: data.corporations[0]?.name,
      address: data.corporations[0]?.address,
      // 他の必要なフィールド
    };

    res.status(200).json(companyInfo);
  } catch (error) {
    console.error('Error fetching corporate info:', error);
    res.status(500).json({ message: '法人情報の取得中にエラーが発生しました' });
  }
}
