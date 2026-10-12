import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function readError(body: unknown): { code: string; message: string } | null {
  if (typeof body !== 'object' || body === null || !('error' in body)) return null
  const error = (body as ApiErrorBody).error
  if (typeof error?.code !== 'string' || typeof error.message !== 'string') return null
  return error
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new ApiError(res.status, 'INTERNAL_ERROR', 'Something went wrong. Please try again.')
  }

  if (!res.ok) {
    const error = readError(body)
    throw new ApiError(
      res.status,
      error?.code ?? 'INTERNAL_ERROR',
      error?.message ?? 'Something went wrong. Please try again.'
    )
  }

  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
