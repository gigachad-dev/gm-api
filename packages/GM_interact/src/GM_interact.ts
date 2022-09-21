import displace from 'displacejs'

export class GM_interact {
  private displace: DisplaceJSObject

  constructor(...args: Parameters<typeof displace>) {
    this.displace = displace(...args)
  }

  reinit(): void {
    this.displace.reinit()
  }

  destroy(): void {
    this.displace.destroy()
  }
}
