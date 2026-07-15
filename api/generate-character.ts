import type { IncomingMessage, ServerResponse } from 'node:http'
import OpenAI, { toFile } from 'openai'

export type CharacterApiRequest = IncomingMessage & { body?: unknown }
export type CharacterApiResponse = ServerResponse

const MAX_IMAGE_BYTES = 1_600_000
const REQUEST_TIMEOUT_MS = 80_000
const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface CharacterReference {
  data: string
  mimeType: string
  name?: string
  view: 'front' | 'three-quarter' | 'full-body'
}

interface CharacterRequest {
  consent?: boolean
  images?: CharacterReference[]
  adjustment?: string
}

const characterPrompt = `Create one cohesive premium Kunu Block character sheet using all three private child reference photographs only as visual reference. The result must be clearly stylized, warm, rounded, block-inspired, toy-like, and non-photorealistic while preserving the child's recognizable hairstyle, skin tone, broad facial impression, age-appropriate proportions, and the casual pink-and-light-blue Yosemite outfit visible in the references.

Use a wide 3:2 character-sheet composition on one perfectly uniform pale mint background (#E9F5F2), with generous empty space between figures. The leftmost 31% must contain exactly one complete head-to-toe front-facing character, centered, with nothing overlapping it, feet visible, and at least 8% clear background around the silhouette. The remaining area should contain a front view, three-quarter view, side view, neutral expression portrait, and happy expression portrait, all visibly the same cohesive character. Premium soft materials, rounded forms, subtle studio lighting, clean silhouettes, polished family animation art direction. No photorealism, text, labels, logos, watermarks, UI, props, borders, or scenery.`

function send(res: CharacterApiResponse, status: number, body: object) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.statusCode = status
  res.end(JSON.stringify(body))
}

function parseReference(reference: CharacterReference, index: number): { buffer: Buffer; mimeType: string; filename: string } {
  if (!reference || !supportedTypes.has(reference.mimeType)) throw new Error('unsupported_image')
  const match = reference.data?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match || match[1] !== reference.mimeType) throw new Error('invalid_image')
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) throw new Error('image_size')
  const extension = reference.mimeType === 'image/png' ? 'png' : reference.mimeType === 'image/webp' ? 'webp' : 'jpg'
  return { buffer, mimeType: reference.mimeType, filename: `reference-${index + 1}.${extension}` }
}

interface CharacterErrorResponse {
  status: number
  code: string
  message: string
  diagnostic?: { providerStatus?: number; providerCode?: string; providerType?: string; parameter?: string; detail?: string }
}

function safeProviderDetail(message: string) {
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/data:image\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, '[image]')
    .slice(0, 300)
}

export function errorResponse(error: unknown): CharacterErrorResponse {
  if (error instanceof OpenAI.APIUserAbortError || error instanceof OpenAI.APIConnectionTimeoutError || (error instanceof Error && error.name === 'AbortError')) {
    return { status: 504, code: 'timeout', message: 'Character generation took too long. Please retry.' }
  }
  if (error instanceof OpenAI.APIError) {
    const apiCode = typeof error.code === 'string' ? error.code : ''
    const diagnostic = {
      providerStatus: error.status,
      providerCode: apiCode || undefined,
      providerType: error.type || undefined,
      parameter: error.param || undefined,
      detail: safeProviderDetail(error.message),
    }
    if (error.status === 429) return { status: 429, code: 'rate_limited', message: 'The character studio is busy. Please wait a moment and retry.' }
    if (apiCode.includes('content_policy') || apiCode.includes('moderation')) return { status: 422, code: 'moderation', message: 'OpenAI could not create this character from the submitted references. Try different clear family photos.' }
    if (error.status === 401) return { status: 503, code: 'api_key_invalid', message: 'The character studio is not configured correctly.' }
    if (error.status === 403) return { status: 503, code: 'openai_access_denied', message: 'This OpenAI project does not currently have access to character generation.', diagnostic }
    if (error.status === 400 || error.status === 404 || error.status === 422) {
      return { status: 422, code: 'openai_request_rejected', message: 'OpenAI rejected the character request. Check the project model access, billing, and image settings.', diagnostic }
    }
    return { status: 502, code: 'openai_service_error', message: 'OpenAI could not complete character generation. Please retry shortly.', diagnostic }
  }
  if (error instanceof Error && ['unsupported_image', 'invalid_image', 'image_size'].includes(error.message)) {
    return { status: 400, code: error.message, message: 'Use three clear JPEG, PNG, or WebP photos under the upload limit.' }
  }
  return { status: 500, code: 'generation_failed', message: 'Kunu could not create the character. Your photos were not saved; please retry.' }
}

export default async function generateCharacter(req: CharacterApiRequest, res: CharacterApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return send(res, 405, { code: 'method_not_allowed', message: 'Use POST to generate a character.' })
  }
  if (req.headers['sec-fetch-site'] === 'cross-site') return send(res, 403, { code: 'cross_site', message: 'Cross-site requests are not allowed.' })
  if (!process.env.OPENAI_API_KEY) return send(res, 503, { code: 'api_key_missing', message: 'The character studio is not configured yet.' })

  const body = (req.body ?? {}) as CharacterRequest
  if (body.consent !== true) return send(res, 400, { code: 'consent_required', message: 'Parent consent is required before sending references to OpenAI.' })
  if (!Array.isArray(body.images) || body.images.length !== 3) return send(res, 400, { code: 'three_images_required', message: 'Provide a front, three-quarter, and full-body reference.' })
  const expectedViews = ['front', 'three-quarter', 'full-body']
  if (body.images.some((image, index) => image.view !== expectedViews[index])) return send(res, 400, { code: 'invalid_views', message: 'Reference photos must be in the requested order.' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  req.once('aborted', () => controller.abort())

  try {
    const references = body.images.map(parseReference)
    const uploads = await Promise.all(references.map((reference) => toFile(reference.buffer, reference.filename, { type: reference.mimeType })))
    const adjustment = typeof body.adjustment === 'string' ? body.adjustment.trim().slice(0, 600) : ''
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const result = await openai.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
      image: uploads,
      prompt: adjustment ? `${characterPrompt}\nParent-requested adjustment: ${adjustment}` : characterPrompt,
      input_fidelity: 'high',
      background: 'opaque',
      quality: 'high',
      size: '1536x1024',
      output_format: 'jpeg',
      output_compression: 88,
      n: 1,
    }, { signal: controller.signal })
    const image = result.data?.[0]?.b64_json
    if (!image) throw new Error('empty_image')
    return send(res, 200, { image: `data:image/jpeg;base64,${image}`, model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2' })
  } catch (error) {
    const mapped = errorResponse(error)
    console.error('[Kunu] Character generation failed.', { code: mapped.code, status: mapped.status, diagnostic: mapped.diagnostic })
    return send(res, mapped.status, { code: mapped.code, message: mapped.message, diagnostic: mapped.diagnostic })
  } finally {
    clearTimeout(timeout)
  }
}
