import { Metadata } from 'next'
import { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Détails du lieu d\'inclusion ',
}

async function LieuPage({ params }: Props) : Promise<ReactElement>{
  const { id } = await params

  return (
    // <LieuxInclusionDetails data={presentedData} />
    <div>
      page détail lieu
      {id}
    </div>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    id: string
  }>>
}>

export default LieuPage
