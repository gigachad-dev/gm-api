export class GM_fetchError extends Error {
  response: Response
  data: unknown

  constructor({
    message,
    response,
    data
  }: {
    message: string
    response: Response
    data: unknown
  }) {
    super(message)

    this.name = this.constructor.name
    this.response = response
    this.data = data ?? { message }
  }
}
