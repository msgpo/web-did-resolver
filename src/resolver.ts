import { ParsedDID, DIDDocument } from 'did-resolver'
import fetch from 'cross-fetch'

const DOC_PATH = '/.well-known/did.json'

async function get(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  })
  if (res.status >= 400) {
    throw new Error(`Bad response ${res.statusText}`)
  }
  return res.json()
}

export function getResolver() {
  async function resolve(
    did: string,
    parsed: ParsedDID
  ): Promise<DIDDocument | null> {

    let path = parsed.id + DOC_PATH
    const id = parsed.id.split(':');
    if (id.length > 1) path = id.join('/') + '/did.json';
    const url: string = `https://${path}`

    let data: any = null
    try {
      data = await get(url)
    } catch (error) {
      throw new Error(
        `DID must resolve to a valid https URL containing a JSON document: ${error.message}`
      )
    }

    const docIdMatchesDid = data.id === did
    if (!docIdMatchesDid) {
      throw new Error('DID document id does not match requested did')
    }

    const docHasPublicKey =
      Array.isArray(data.publicKey) && data.publicKey.length > 0
    if (!docHasPublicKey) throw new Error('DID document has no public keys')

    return data
  }

  return { web: resolve }
}
