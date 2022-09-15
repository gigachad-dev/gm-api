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
]

export async function GM_fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const request = new Request(input, init)

  let data: string | undefined
  if (init?.body) {
    data = await request.text()
  }

  return await xmlHttpRequest(request, data)
}

function xmlHttpRequest(request: Request, data?: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: request.url,
      method: xhrMethod(request.method),
      headers: xhrHeaders(request.headers),
      data,
      onload: (response) => resolve(parseResponse(response)),
      onerror: reject
    })
  })
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

function xhrMethod(method: string): any {
  method = method.toUpperCase()
  if (httpMethods.includes(method)) {
    return method
  }

  throw new Error(`Unsupported HTTP method "${method}"`)
}

function xhrHeaders(headers?: Headers): Record<string, string> | undefined {
  if (!headers) {
    return undefined
  }

  const mappedHeaders: Record<string, string> = {}
  for (const [key, value] of headers) {
    mappedHeaders[value] = key
  }

  return mappedHeaders
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
