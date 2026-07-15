import { afterEach, describe, expect, it } from 'vitest'
import OpenAI from 'openai'
import generateCharacter, { errorResponse, type CharacterApiRequest, type CharacterApiResponse } from '../../api/generate-character'

function responseMock() {
  const state = { status: 200, body: undefined as unknown }
  const response = {
    setHeader() { return response },
    set statusCode(status: number) { state.status = status },
    end(body: string) { state.body = JSON.parse(body); return response },
  } as unknown as CharacterApiResponse
  return { response, state }
}

function request(body: unknown = {}, method = 'POST'): CharacterApiRequest {
  return { method, body, headers: {}, once() { return this } } as unknown as CharacterApiRequest
}

describe('/api/generate-character', () => {
  const originalKey = process.env.OPENAI_API_KEY
  afterEach(() => { process.env.OPENAI_API_KEY = originalKey })

  it('never attempts generation without a server-side API key', async () => {
    delete process.env.OPENAI_API_KEY
    const { response, state } = responseMock()
    await generateCharacter(request(), response)
    expect(state.status).toBe(503)
    expect(state.body).toMatchObject({ code: 'api_key_missing' })
  })

  it('requires explicit consent before inspecting any reference payload', async () => {
    process.env.OPENAI_API_KEY = 'test-only'
    const { response, state } = responseMock()
    await generateCharacter(request({ images: [] }), response)
    expect(state.status).toBe(400)
    expect(state.body).toMatchObject({ code: 'consent_required' })
  })

  it('requires exactly the front, three-quarter, and full-body views', async () => {
    process.env.OPENAI_API_KEY = 'test-only'
    const { response, state } = responseMock()
    await generateCharacter(request({ consent: true, images: [] }), response)
    expect(state.status).toBe(400)
    expect(state.body).toMatchObject({ code: 'three_images_required' })
  })

  it('returns a safe provider diagnostic when OpenAI rejects a request', () => {
    const error = new OpenAI.APIError(400, { code: 'invalid_value', type: 'invalid_request_error', param: 'model' }, 'Invalid model sk-secret-value', new Headers())
    const mapped = errorResponse(error)
    expect(mapped).toMatchObject({
      status: 422,
      code: 'openai_request_rejected',
      diagnostic: { providerStatus: 400, providerCode: 'invalid_value', parameter: 'model' },
    })
    expect(mapped.diagnostic?.detail).not.toContain('sk-secret-value')
  })
})
