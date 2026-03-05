import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '메모 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `다음 메모 내용을 한국어로 2~3문장으로 간결하게 요약해 주세요. 나열된 항목이면 공통적인 핵심 내용만 포함하고, 진행되는 내용이라면 핵심적인 흐름만 요약해줘. 메모 내용은 마크다운 형식으로 되어 있어.\n\n---\n${content}\n---`,
    })

    const summary = response.text

    if (!summary) {
      return NextResponse.json(
        { error: '요약 결과를 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    console.error('Gemini API 호출 오류:', message)
    return NextResponse.json(
      { error: `AI 요약 중 오류가 발생했습니다: ${message}` },
      { status: 500 }
    )
  }
}
