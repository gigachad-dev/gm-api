import { GM_fetchError } from './GM_fetchError.js'

const httpMethods = [
  'POST',
  'GET',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'TRACE',
  'OPTIONS',
  'CONNECT'
] as const

type HTTPMethods = typeof httpMethods[number]

export async function GM_fetch(
  input: RequestInfo | URL,
  init?: RequestInit & { method: HTTPMethods }
): Promise<Response> {
  const request = new Request(input, init)

  let body: string | undefined
  if (init?.body) {
    body = await request.text()
  }

  const response = await xmlHttpRequest(request, body)
  if (response.ok) {
    return response
  }

  throw new GM_fetchError({
    message: response.statusText,
    response,
    data: body
  })
}

function xmlHttpRequest(request: Request, data?: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: request.url,
      method: request.method as any,
      headers: xhrHeaders(request.headers),
      data,
      onload: (response) => resolve(parseResponse(response)),
      onerror: reject
    })
  })
}

function xhrHeaders(headers?: Headers): Record<string, string> | undefined {
  if (!headers) {
    return undefined
  }

  const mappedHeaders: Record<string, string> = {}
  headers.forEach((value, key) => {
    mappedHeaders[value] = key
  })

  return mappedHeaders
}

function parseResponse({
  status,
  statusText,
  responseText,
  responseHeaders
}: Tampermonkey.Response<any>): Response {
  return new Response(responseText, {
    status,
    statusText,
    headers: parseRawHeaders(responseHeaders)
  })
}

function parseRawHeaders(rawHeader: string): Headers {
  const headers = rawHeader
    .trim()
    .split('\r\n')
    .map((header) => {
      const [key, value] = header.split(': ')
      return [key, value]
    }) as [string, string][]

  return new Headers(headers)
}
