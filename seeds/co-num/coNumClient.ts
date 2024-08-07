import { Db, MongoClient } from 'mongodb'

export async function coNumClient(): Promise<CoNumClient> {
  const url = process.env.CO_NUM_DATABASE_URL
  const databaseName = process.env.CO_NUM_DATABASE_NAME

  if (url === undefined) {
    throw Error('L’url de MongoDB n’est pas configurée.')
  }

  const client = new MongoClient(url)
  await client.connect()
  const db = client.db(databaseName)

  return {
    client,
    db,
  }
}

type CoNumClient = Readonly<{
  client: MongoClient
  db: Db
}>
